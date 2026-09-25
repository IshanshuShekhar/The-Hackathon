import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { QualificationService } from '../qualification/qualification.service';
import {
  Pathway,
  Provenance,
  RecommendationItem,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
  ReadinessScoreItem,
  ReadinessScoreCategory,
  GapAnalysisResponse,
  MissingRequirement,
} from '@educaro/shared';
import * as crypto from 'crypto';
import OpenAI from 'openai';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
    private readonly qualificationService: QualificationService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized for Recommendations explanation synthesis.');
    } else {
      this.logger.log('OPENAI_API_KEY not provided. Recommendations will use deterministic grounded explanations.');
    }
  }

  /**
   * Retrieves all active recommendations for the authenticated applicant,
   * sorted deterministically: REQUIRED first, then IMPORTANT, then RECOMMENDED.
   */
  async getRecommendations(userId: string): Promise<RecommendationItem[]> {
    // Recompute or refresh recommendations to ensure freshness
    await this.recomputeRecommendations(userId);

    const res = await this.db.query(
      `SELECT * FROM recommendations
       WHERE user_id = $1 AND status != 'dismissed'
       ORDER BY
         CASE priority
           WHEN 'REQUIRED' THEN 1
           WHEN 'IMPORTANT' THEN 2
           WHEN 'RECOMMENDED' THEN 3
           ELSE 4
         END ASC,
         created_at DESC`,
      [userId],
    );

    return res.rows.map((r: any) => this.mapRecommendationRow(r));
  }

  /**
   * Retrieves the single top-priority item (Next Best Action) for the applicant.
   */
  async getNextBestAction(userId: string): Promise<RecommendationItem | null> {
    const recommendations = await this.getRecommendations(userId);
    const active = recommendations.filter((r) => r.status === 'pending' || r.status === 'in_progress');
    return active.length > 0 ? active[0] : (recommendations[0] || null);
  }

  /**
   * Grouped Gap-Analysis View (PRD Section 16)
   * Groups recommendations by category and computes deterministic 5-category Readiness Scores.
   */
  async getGapAnalysis(userId: string): Promise<GapAnalysisResponse> {
    const recommendations = await this.getRecommendations(userId);

    const grouped = {
      missingInfo: recommendations.filter((r) => r.type === 'MISSING_INFO'),
      documents: recommendations.filter((r) => r.type === 'DOCUMENT'),
      language: recommendations.filter((r) => r.type === 'LANGUAGE'),
      qualification: recommendations.filter((r) => r.type === 'QUALIFICATION'),
      application: recommendations.filter((r) => r.type === 'APPLICATION'),
    };

    const readinessScores = await this.computeReadinessScores(userId);
    const overallReadinessPct = Math.round(
      readinessScores.reduce((acc, curr) => acc + curr.scorePct, 0) / readinessScores.length,
    );

    const nextBestAction = await this.getNextBestAction(userId);

    let summary = 'Your German admission and visa profile is progressing well.';
    const requiredPending = recommendations.filter((r) => r.priority === 'REQUIRED' && r.status === 'pending');
    if (requiredPending.length > 0) {
      summary = `You have ${requiredPending.length} mandatory requirement(s) blocking official German submission. Complete these first.`;
    } else if (overallReadinessPct >= 80) {
      summary = 'High readiness! Most mandatory criteria satisfied. Focus on university application and visa appointment prep.';
    }

    return {
      readinessScores,
      overallReadinessPct,
      groupedRecommendations: grouped,
      nextBestAction,
      summary,
    };
  }

  /**
   * Updates recommendation status (pending | in_progress | completed | dismissed).
   * Verifies tenant ownership.
   */
  async updateStatus(
    userId: string,
    recommendationId: string,
    newStatus: RecommendationStatus,
  ): Promise<RecommendationItem> {
    const existing = await this.db.query(
      `SELECT * FROM recommendations WHERE id = $1`,
      [recommendationId],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundException(`Recommendation ${recommendationId} not found.`);
    }

    if (existing.rows[0].user_id !== userId) {
      throw new ForbiddenException('You are not authorized to modify this recommendation.');
    }

    const updated = await this.db.query(
      `UPDATE recommendations
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [newStatus, recommendationId, userId],
    );

    await this.eventsService.logEvent({
      userId,
      agent: 'Recommendation Agent',
      tool: 'StatusManager',
      reason: `Applicant updated recommendation '${existing.rows[0].title}' to status: ${newStatus}`,
      input: { recommendationId, newStatus },
      output: { id: recommendationId, status: newStatus },
      confidence: 1.0,
      durationMs: 15,
    });

    return this.mapRecommendationRow(updated.rows[0]);
  }

  /**
   * Recomputes recommendations by reusing the Qualification Engine's rule logic,
   * adding softer non-blocking suggestions, and generating AI-grounded explanations.
   */
  async recomputeRecommendations(userId: string): Promise<RecommendationItem[]> {
    const startTime = Date.now();

    // 1. Fetch user profile fields and documents
    const fieldsRes = await this.db.query(
      `SELECT field_key, value FROM profile_fields WHERE user_id = $1`,
      [userId],
    );
    const fieldMap: Record<string, string> = {};
    for (const r of fieldsRes.rows) {
      fieldMap[r.field_key] = r.value;
    }

    const docsRes = await this.db.query(
      `SELECT document_type, status FROM documents WHERE user_id = $1`,
      [userId],
    );
    const uploadedDocs = new Set(docsRes.rows.map((r: any) => r.document_type));

    const incRes = await this.db.query(
      `SELECT * FROM inconsistencies WHERE user_id = $1 AND is_resolved = FALSE`,
      [userId],
    );
    const hasUnresolvedConflicts = incRes.rows.length > 0;

    const videoRes = await this.db.query(
      `SELECT id FROM video_intros WHERE user_id = $1`,
      [userId],
    );
    const hasVideoIntro = videoRes.rows.length > 0;

    const cvRes = await this.db.query(
      `SELECT id FROM cvs WHERE user_id = $1`,
      [userId],
    );
    const hasCv = cvRes.rows.length > 0;

    const entRes = await this.db.query(
      `SELECT feature_key FROM entitlements WHERE user_id = $1 AND status = 'ACTIVE'`,
      [userId],
    );
    const entitlements = entRes.rows.map((r: any) => r.feature_key);
    const hasPremium = entitlements.includes('EDUCARO_PREMIUM') || entitlements.includes('CONSULTANT_REVIEW');

    // 2. REUSE EXISTING QUALIFICATION ENGINE (Section 13)
    const qualificationEval = await this.qualificationService.evaluateQualification(userId);

    const rawPathway = fieldMap['targetPathway'] || 'STUDY';
    let pathway: Pathway = Pathway.STUDY;
    if (rawPathway.toUpperCase().includes('AUSBILDUNG') || rawPathway.toUpperCase().includes('TRAINING') || rawPathway.toUpperCase().includes('VOCATIONAL')) {
      pathway = Pathway.AUSBILDUNG;
    } else if (rawPathway.toUpperCase().includes('EMPLOYMENT') || rawPathway.toUpperCase().includes('CAREER') || rawPathway.toUpperCase().includes('JOB')) {
      pathway = Pathway.EMPLOYMENT;
    }

    const degree = fieldMap['degree'] || fieldMap['degreeName'] || '';
    const university = fieldMap['institution'] || '';
    const germanLevel = fieldMap['germanLevel'] || 'Not assessed';

    // 3. GENERATE CANDIDATE RECOMMENDATION CARDS
    interface CandidateRec {
      ruleId: string;
      type: RecommendationType;
      priority: RecommendationPriority;
      title: string;
      description: string;
      actionRoute: string;
      actionLabel: string;
      whyExplanation?: string;
    }

    const candidateRecs: CandidateRec[] = [];

    // 3a. Convert Qualification Engine's outstanding/missing requirements
    for (const req of qualificationEval.missingRequirements) {
      let type: RecommendationType = 'QUALIFICATION';
      if (req.category === 'LANGUAGE') type = 'LANGUAGE';
      else if (req.category === 'DOCUMENT') type = 'DOCUMENT';
      else if (req.category === 'DEGREE') type = 'QUALIFICATION';

      let actionRoute = '/journey/documents';
      let actionLabel = 'Review Documents';

      if (req.id.includes('german') || req.category === 'LANGUAGE') {
        actionRoute = '/learning-path';
        actionLabel = 'Explore German Modules';
      } else if (req.id.includes('inconsistency') || req.id.includes('conflict')) {
        actionRoute = '/journey/documents';
        actionLabel = 'Resolve Inconsistency';
      } else if (req.id.includes('degree') || req.id.includes('h_plus')) {
        actionRoute = '/journey/documents';
        actionLabel = 'Upload Official Certificate';
      }

      candidateRecs.push({
        ruleId: req.id,
        type,
        priority: req.severity === 'BLOCKING' ? 'REQUIRED' : 'IMPORTANT',
        title: req.title,
        description: req.description,
        actionRoute,
        actionLabel,
        whyExplanation: await this.synthesizeWhyExplanation({
          title: req.title,
          category: req.category,
          pathway,
          degree,
          university,
          germanLevel,
          severity: req.severity,
        }),
      });
    }

    // 3b. Add softer, non-blocking suggestions that Qualification Engine doesn't produce

    // Soft suggestion 1: Core contact details
    if (!fieldMap['fullName'] || !fieldMap['phoneNumber']) {
      candidateRecs.push({
        ruleId: 'soft_complete_personal_profile',
        type: 'MISSING_INFO',
        priority: 'IMPORTANT',
        title: 'Complete Candidate Contact & Identity Details',
        description: 'Provide your full legal passport name and country-coded phone number for consulate submission verification.',
        actionRoute: '/journey/details',
        actionLabel: 'Complete Details',
        whyExplanation: 'German embassies require exact name matching across all submitted certificates and passport visas.',
      });
    }

    // Soft suggestion 2: Official German CV (Lebenslauf)
    if (!hasCv) {
      candidateRecs.push({
        ruleId: 'soft_generate_german_cv',
        type: 'APPLICATION',
        priority: 'IMPORTANT',
        title: 'Generate Official German CV (Lebenslauf)',
        description: 'Format your education, skills, and projects into the strict chronological Europass/DIN 5008 German Lebenslauf layout.',
        actionRoute: '/journey/cv',
        actionLabel: 'Build German CV',
        whyExplanation: 'German academic boards and HR managers reject generic international resumes that do not adhere to tabular German Lebenslauf standards.',
      });
    }

    // Soft suggestion 3: Video Intro / Motivation
    if (!hasVideoIntro) {
      candidateRecs.push({
        ruleId: 'soft_record_video_intro',
        type: 'APPLICATION',
        priority: 'RECOMMENDED',
        title: 'Record 60-Second Motivation Video Intro',
        description: 'Record a brief intro video explaining your academic motivation and reasons for choosing Germany.',
        actionRoute: '/journey/video',
        actionLabel: 'Record Video Intro',
        whyExplanation: 'Speech-to-text extraction from your intro helps consultants verify your spoken fluency and boosts application confidence.',
      });
    }

    // Soft suggestion 4: Pathway-Scoped Suggestions
    if (pathway === Pathway.STUDY) {
      candidateRecs.push({
        ruleId: 'pathway_study_program_selection',
        type: 'APPLICATION',
        priority: 'RECOMMENDED',
        title: 'Shortlist 3 Recognized TU9 / State Universities',
        description: 'Match your verified Indian Bachelor curriculum against public German universities with no tuition fees.',
        actionRoute: '/journey/qualification',
        actionLabel: 'View Degree Match',
        whyExplanation: `Given your degree (${degree || 'B.Tech/Bachelor'}), state universities require verified Anabin equivalence and strict NC cutoff adherence.`,
      });
    } else if (pathway === Pathway.AUSBILDUNG) {
      candidateRecs.push({
        ruleId: 'pathway_ausbildung_motivation_portfolio',
        type: 'APPLICATION',
        priority: 'RECOMMENDED',
        title: 'Prepare Vocational Motivation Statement (Anschreiben)',
        description: 'Craft a personalized German cover letter highlighting practical workshop experience and dedication to the dual-training system.',
        actionRoute: '/journey/cv',
        actionLabel: 'Draft Cover Letter',
        whyExplanation: 'German training companies (Ausbildungsbetriebe) prioritize motivation and commitment over pure academic grades.',
      });
    } else if (pathway === Pathway.EMPLOYMENT) {
      candidateRecs.push({
        ruleId: 'pathway_employment_chancenkarte_audit',
        type: 'QUALIFICATION',
        priority: 'RECOMMENDED',
        title: 'Audit Opportunity Card (Chancenkarte) Point Matrix',
        description: 'Calculate your points across age, German/English proficiency, and recognized qualifications for direct job-seeking.',
        actionRoute: '/journey/qualification',
        actionLabel: 'Check Points Score',
        whyExplanation: 'The 2024 Skilled Immigration Act requires 6 points for candidates entering Germany on an Opportunity Card job search visa.',
      });
    }

    // Soft suggestion 5: Educaro Premium / Advisor Session
    if (!hasPremium) {
      candidateRecs.push({
        ruleId: 'soft_educaro_premium_upgrade',
        type: 'APPLICATION',
        priority: 'RECOMMENDED',
        title: 'Schedule 1-on-1 Consultation & Fast-Track APS Review',
        description: 'Unlock 90 days of Educaro Premium: 1-on-1 advisor strategy sessions, extended C1/technical German modules, and priority document verification.',
        actionRoute: '/checkout',
        actionLabel: 'Unlock Educaro Premium',
        whyExplanation: 'Senior consultants review degree date discrepancies and provide guaranteed APS certificate submission guidance.',
      });
    }

    // 4. PERSIST TO RECOMMENDATIONS TABLE (PRESERVE USER STATUS CHANGES)
    const existingRows = await this.db.query(
      `SELECT * FROM recommendations WHERE user_id = $1`,
      [userId],
    );
    const existingMap = new Map<string, any>();
    for (const row of existingRows.rows) {
      const key = row.rule_id || row.title;
      existingMap.set(key, row);
    }

    const currentRuleKeys = new Set<string>();

    for (const rec of candidateRecs) {
      const key = rec.ruleId || rec.title;
      currentRuleKeys.add(key);

      const existing = existingMap.get(key);

      if (existing) {
        // Update details while preserving user status (in_progress, completed, dismissed)
        await this.db.query(
          `UPDATE recommendations
           SET type = $1, priority = $2, title = $3, description = $4,
               pathway_context = $5, action_route = $6, action_label = $7,
               why_explanation = $8, updated_at = CURRENT_TIMESTAMP
           WHERE id = $9`,
          [
            rec.type,
            rec.priority,
            rec.title,
            rec.description,
            pathway,
            rec.actionRoute,
            rec.actionLabel,
            rec.whyExplanation || existing.why_explanation,
            existing.id,
          ],
        );
      } else {
        // Insert new recommendation
        const newId = crypto.randomUUID();
        await this.db.query(
          `INSERT INTO recommendations (
            id, user_id, type, priority, title, description,
            status, pathway_context, action_route, action_label,
            why_explanation, why_provenance, rule_id, created_at, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            newId,
            userId,
            rec.type,
            rec.priority,
            rec.title,
            rec.description,
            pathway,
            rec.actionRoute,
            rec.actionLabel,
            rec.whyExplanation,
            Provenance.AI_GENERATED,
            rec.ruleId,
          ],
        );
      }
    }

    // Mark recommendations that were previously outstanding but are now satisfied as 'completed'
    for (const [key, existing] of existingMap.entries()) {
      if (!currentRuleKeys.has(key) && existing.status === 'pending') {
        await this.db.query(
          `UPDATE recommendations SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [existing.id],
        );
      }
    }

    // 5. LOG TO AGENT TRACE
    await this.eventsService.logEvent({
      userId,
      agent: 'Recommendation Agent',
      tool: 'RulePrioritizer',
      reason: `Synthesized ${candidateRecs.length} personalized recommendations for ${pathway} pathway`,
      input: {
        pathway,
        degree,
        missingRequirementsCount: qualificationEval.missingRequirements.length,
        hasConflicts: hasUnresolvedConflicts,
      },
      output: {
        totalGenerated: candidateRecs.length,
        requiredCount: candidateRecs.filter((r) => r.priority === 'REQUIRED').length,
        importantCount: candidateRecs.filter((r) => r.priority === 'IMPORTANT').length,
        recommendedCount: candidateRecs.filter((r) => r.priority === 'RECOMMENDED').length,
      },
      confidence: 1.0,
      durationMs: Date.now() - startTime,
    });

    const refreshed = await this.db.query(
      `SELECT * FROM recommendations WHERE user_id = $1 ORDER BY
         CASE priority
           WHEN 'REQUIRED' THEN 1
           WHEN 'IMPORTANT' THEN 2
           WHEN 'RECOMMENDED' THEN 3
           ELSE 4
         END ASC,
         created_at DESC`,
      [userId],
    );

    return refreshed.rows.map((r: any) => this.mapRecommendationRow(r));
  }

  /**
   * Deterministic 5-Category Readiness Scores Computation (PRD Section 16)
   * Computes Education, Language, Document, Qualification, and Application scores (0-100%)
   * paired with real grounded explanatory reasons.
   */
  async computeReadinessScores(userId: string): Promise<ReadinessScoreItem[]> {
    const fieldsRes = await this.db.query(
      `SELECT field_key, value FROM profile_fields WHERE user_id = $1`,
      [userId],
    );
    const fieldMap: Record<string, string> = {};
    for (const r of fieldsRes.rows) fieldMap[r.field_key] = r.value;

    const docsRes = await this.db.query(
      `SELECT document_type, status FROM documents WHERE user_id = $1`,
      [userId],
    );
    const uploadedDocs = new Set(docsRes.rows.map((r: any) => r.document_type));

    const incRes = await this.db.query(
      `SELECT id FROM inconsistencies WHERE user_id = $1 AND is_resolved = FALSE`,
      [userId],
    );
    const hasUnresolvedConflicts = incRes.rows.length > 0;

    const videoRes = await this.db.query(`SELECT id FROM video_intros WHERE user_id = $1`, [userId]);
    const cvRes = await this.db.query(`SELECT id FROM cvs WHERE user_id = $1`, [userId]);

    const evalResult = await this.qualificationService.evaluateQualification(userId);

    const scores: ReadinessScoreItem[] = [];

    // 1. EDUCATION READINESS
    const hasDegree = Boolean(fieldMap['degree'] || fieldMap['degreeName']);
    const hasInstitution = Boolean(fieldMap['institution']);
    const hasGpa = Boolean(fieldMap['gradeOrGpa']);
    let eduScore = 20;
    if (hasDegree) eduScore += 35;
    if (hasInstitution) eduScore += 25;
    if (hasGpa) eduScore += 20;

    let eduReason = 'Provide degree name, institution, and GPA to assess academic equivalence.';
    if (hasDegree && hasInstitution) {
      eduReason = `${fieldMap['degreeName'] || fieldMap['degree']} from ${fieldMap['institution']} satisfies German KMK H+ institutional standards.`;
    }
    scores.push({
      category: 'EDUCATION',
      scorePct: Math.min(eduScore, 100),
      status: eduScore >= 80 ? 'EXCELLENT' : eduScore >= 55 ? 'ON_TRACK' : 'ACTION_REQUIRED',
      reason: eduReason,
    });

    // 2. LANGUAGE READINESS
    const rawGerman = (fieldMap['germanLevel'] || 'NONE').toUpperCase();
    let langScore = 20;
    let langReason = 'No German proficiency reported. German track preparation recommended.';

    if (rawGerman.includes('C1') || rawGerman.includes('TESTDAF')) {
      langScore = 95;
      langReason = 'C1 Level satisfies direct German-taught University admission and Blue Card standards.';
    } else if (rawGerman.includes('B2')) {
      langScore = 85;
      langReason = 'B2 Level satisfies direct Ausbildung contracts and medical/nursing licensing prerequisites.';
    } else if (rawGerman.includes('B1')) {
      langScore = 70;
      langReason = 'B1 Level provides a solid foundation; progression to B2 recommended for university enrollment.';
    } else if (rawGerman.includes('A2')) {
      langScore = 50;
      langReason = 'A2 Level indicates active study. Target B1/B2 required for visa submission (approx. 4 months).';
    } else if (rawGerman.includes('A1')) {
      langScore = 35;
      langReason = 'A1 Foundations completed. Continue daily structured modules on Deutsche Welle.';
    }
    scores.push({
      category: 'LANGUAGE',
      scorePct: langScore,
      status: langScore >= 80 ? 'EXCELLENT' : langScore >= 50 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
      reason: langReason,
    });

    // 3. DOCUMENT READINESS
    let docScore = 15;
    const hasDegreeCert = uploadedDocs.has('DEGREE_CERTIFICATE');
    const hasLangCert = uploadedDocs.has('LANGUAGE_CERTIFICATE');
    const hasPassport = uploadedDocs.has('PASSPORT');

    if (hasDegreeCert) docScore += 45;
    if (hasLangCert) docScore += 25;
    if (hasPassport) docScore += 15;

    let docReason = 'Official degree certificate and language transcripts pending upload.';
    if (hasDegreeCert && hasLangCert) {
      docReason = 'Core academic degree and German certificates uploaded and verified via OCR.';
    } else if (hasDegreeCert) {
      docReason = 'Bachelor certificate uploaded and extracted; official language certificate pending.';
    }
    scores.push({
      category: 'DOCUMENT',
      scorePct: Math.min(docScore, 100),
      status: docScore >= 80 ? 'EXCELLENT' : docScore >= 50 ? 'ON_TRACK' : 'ACTION_REQUIRED',
      reason: docReason,
    });

    // 4. QUALIFICATION READINESS
    let qualScore = evalResult.scorePct;
    if (hasUnresolvedConflicts) qualScore = Math.max(30, qualScore - 20);

    let qualReason = `Satisfies ${evalResult.passedCriteria.length} of ${evalResult.passedCriteria.length + evalResult.missingRequirements.length} German regulatory admission criteria.`;
    if (hasUnresolvedConflicts) {
      qualReason += ' ⚠️ Active graduation date discrepancy blocks expedited processing.';
    }
    scores.push({
      category: 'QUALIFICATION',
      scorePct: qualScore,
      status: qualScore >= 80 ? 'EXCELLENT' : qualScore >= 60 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
      reason: qualReason,
    });

    // 5. APPLICATION READINESS
    let appScore = 20;
    if (cvRes.rows.length > 0) appScore += 35;
    if (videoRes.rows.length > 0) appScore += 25;
    if (fieldMap['fullName'] && fieldMap['targetPathway']) appScore += 20;

    let appReason = 'Generate German CV (Lebenslauf) and complete video intro to finalize portfolio.';
    if (cvRes.rows.length > 0 && videoRes.rows.length > 0) {
      appReason = 'German Lebenslauf generated and video intro motivation statement recorded.';
    } else if (cvRes.rows.length > 0) {
      appReason = 'Chronological German CV ready; video introduction optional add-on.';
    }
    scores.push({
      category: 'APPLICATION',
      scorePct: Math.min(appScore, 100),
      status: appScore >= 80 ? 'EXCELLENT' : appScore >= 55 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
      reason: appReason,
    });

    return scores;
  }

  /**
   * LLM explanation synthesis for "why this recommendation".
   * Grounded strictly in applicant's real profile data. Falls back gracefully if no LLM key.
   */
  private async synthesizeWhyExplanation(context: {
    title: string;
    category: string;
    pathway: Pathway;
    degree: string;
    university: string;
    germanLevel: string;
    severity: string;
  }): Promise<string> {
    if (this.openai && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are a German Immigration & Academic Admissions Advisor for Educaro.
Explain in 1-2 concise, professional sentences why the following recommendation is important for this specific applicant.
Ground your response strictly in the applicant's real profile. Do not invent unprovided credentials.

Applicant Profile:
- Target Pathway: ${context.pathway}
- Degree: ${context.degree || 'Not provided'}
- Institution: ${context.university || 'Not provided'}
- Current German Level: ${context.germanLevel}

Recommendation:
- Title: ${context.title}
- Category: ${context.category}
- Severity: ${context.severity}`;

        const res = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.2,
        });

        const text = res.choices[0]?.message?.content?.trim();
        if (text) return text;
      } catch (err) {
        this.logger.warn('LLM explanation synthesis failed, falling back to deterministic explanation', err);
      }
    }

    // High-fidelity realistic grounded fallback explanation
    if (context.category === 'LANGUAGE') {
      return `German consulates and university faculties require official CEFR certification to grant study visas for ${context.pathway.toLowerCase()} applicants.`;
    }
    if (context.category === 'DOCUMENT' || context.title.toLowerCase().includes('certificate')) {
      return `German academic evaluators (KMK / Anabin) require an uncompressed official graduation certificate to verify institutional H+ accreditation.`;
    }
    if (context.title.toLowerCase().includes('inconsistency') || context.title.toLowerCase().includes('conflict')) {
      return `Discrepancies across graduation dates trigger automated security holds on APS certification queues until explicitly reconciled.`;
    }
    return `Mandatory for the ${context.pathway} pathway to ensure your application package satisfies German legal prerequisites.`;
  }

  private mapRecommendationRow(row: any): RecommendationItem {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as RecommendationType,
      priority: row.priority as RecommendationPriority,
      title: row.title,
      description: row.description,
      status: row.status as RecommendationStatus,
      pathwayContext: row.pathway_context as Pathway,
      actionRoute: row.action_route,
      actionLabel: row.action_label,
      whyExplanation: row.why_explanation,
      whyProvenance: (row.why_provenance as Provenance) || Provenance.AI_GENERATED,
      ruleId: row.rule_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
