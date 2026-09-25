import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { JourneyState, ConsultantLeadScore, Provenance } from '@educaro/shared';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
  ) {}

  async getJourneyState(userId: string): Promise<JourneyState> {
    const fieldsRes = await this.db.query('SELECT field_key, value FROM profile_fields WHERE user_id = $1', [userId]);
    const docsRes = await this.db.query('SELECT document_type, status FROM documents WHERE user_id = $1', [userId]);
    const incRes = await this.db.query('SELECT is_resolved FROM inconsistencies WHERE user_id = $1 AND is_resolved = FALSE', [userId]);
    const videoRes = await this.db.query('SELECT id FROM video_intros WHERE user_id = $1', [userId]);

    const fieldMap: Record<string, string> = {};
    for (const row of fieldsRes.rows) {
      fieldMap[row.field_key] = row.value;
    }

    const hasGoal = Boolean(fieldMap['targetPathway']);
    const hasPersonal = Boolean(fieldMap['fullName']);
    const hasEducation = Boolean(fieldMap['degree'] || fieldMap['degreeName']);
    const hasVideo = videoRes.rows.length > 0;
    const hasDocUpload = docsRes.rows.some((d: any) => d.document_type !== 'VIDEO_INTRO');
    const hasConflict = incRes.rows.length > 0;

    let completeness = 20;
    if (hasGoal) completeness += 15;
    if (hasPersonal) completeness += 15;
    if (hasEducation) completeness += 15;
    if (hasVideo) completeness += 10;
    if (hasDocUpload) completeness += 15;
    if (fieldMap['germanLevel']) completeness += 10;

    let nextBestAction = {
      title: 'Complete Profile Intake',
      description: 'Answer our conversational agent to record your goals and qualifications.',
      targetRoute: '/journey/chat',
      ctaLabel: 'Continue Profile Chat →',
    };

    const rawGerman = (fieldMap['germanLevel'] || '').toUpperCase();
    const isAtLeastB1 = rawGerman.includes('B1') || rawGerman.includes('B2') || rawGerman.includes('C1');
    const needsGermanSupport = !rawGerman || rawGerman === 'NONE' || !isAtLeastB1;

    if (hasConflict) {
      nextBestAction = {
        title: 'Resolve Graduation Date Conflict',
        description: 'Our Consistency Agent noticed conflicting graduation dates across your profile and degree.',
        targetRoute: '/journey/documents',
        ctaLabel: 'Review Conflict →',
      };
    } else if (hasEducation && !hasVideo && !hasDocUpload) {
      nextBestAction = {
        title: 'Record a 60-Second Video Intro (Optional)',
        description: 'Record or upload a quick video to share your motivation and career goals with our Admissions Agent.',
        targetRoute: '/journey/video',
        ctaLabel: 'Record Video Intro →',
      };
    } else if (!hasDocUpload) {
      nextBestAction = {
        title: 'Upload Your German Language / Degree Certificate',
        description: 'Upload your documents for instant AI extraction and side-by-side review.',
        targetRoute: '/journey/documents',
        ctaLabel: 'Upload Documents →',
      };
    } else if (needsGermanSupport) {
      nextBestAction = {
        title: 'Explore Your German Learning Path',
        description: 'Follow our guided preparation track (~4 months to B1) with curated free tutorials from DW and Goethe-Institut.',
        targetRoute: '/learning-path',
        ctaLabel: 'Start German Learning Path →',
      };
    } else if (completeness >= 80) {
      nextBestAction = {
        title: 'Review Your Qualification Assessment',
        description: 'Your verified documents and profile qualify you for German University & Vocational tracks.',
        targetRoute: '/journey/qualification',
        ctaLabel: 'View Qualification Results →',
      };
    }

    return {
      currentStep: hasDocUpload ? 'QUALIFICATION' : hasEducation ? 'DOCUMENTS' : 'PROFILE_CHAT',
      completedSteps: [
        ...(hasGoal ? ['GOAL_INTAKE' as const] : []),
        ...(hasEducation ? ['PROFILE_CHAT' as const] : []),
        ...(hasDocUpload ? ['DOCUMENTS' as const] : []),
      ],
      selectedPathway: fieldMap['targetPathway'] as any,
      profileCompletenessPct: Math.min(completeness, 100),
      nextBestAction,
    };
  }

  async getConsolidatedCandidateDetails(userId: string) {
    const userRes = await this.db.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]);
    const appRes = await this.db.query('SELECT * FROM applicants WHERE user_id = $1', [userId]);
    const fieldsRes = await this.db.query('SELECT * FROM profile_fields WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    const docsRes = await this.db.query('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const payRes = await this.db.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const entRes = await this.db.query('SELECT * FROM entitlements WHERE user_id = $1', [userId]);
    const videoRes = await this.db.query('SELECT * FROM video_intros WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    const purchasesRes = await this.db.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    const fields = fieldsRes.rows.map((r: any) => ({
      id: r.id,
      category: r.category,
      fieldKey: r.field_key,
      value: r.value,
      provenance: r.provenance as Provenance,
      confidence: r.confidence,
      sourceSnippet: r.source_snippet,
      updatedAt: r.updated_at,
    }));

    // Calculate Lead Score & "Why this score" explanation factors (Section 7 & 11)
    const hasDegreeDoc = docsRes.rows.some((d: any) => d.document_type === 'DEGREE_CERTIFICATE');
    const hasLanguageDoc = docsRes.rows.some((d: any) => d.document_type === 'LANGUAGE_CERTIFICATE');
    const hasGermanReported = fields.some((f: any) => f.fieldKey === 'germanLevel' && f.value && f.value !== 'None' && f.value !== 'NONE');
    const hasPaid = payRes.rows.some((p: any) => p.status === 'COMPLETED');

    let leadScore = 40;
    const factors: { factor: string; impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'; points: number; description: string }[] = [];

    if (hasDegreeDoc) {
      leadScore += 25;
      factors.push({
        factor: 'Anabin H+ Recognized Indian Bachelor Degree (Verified via Upload)',
        impact: 'POSITIVE',
        points: 25,
        description: 'Official degree certificate uploaded and extracted. Institution satisfies German KMK H+ standards.',
      });
    } else {
      factors.push({
        factor: 'Degree Certificate: Not Uploaded / Missing',
        impact: 'NEGATIVE',
        points: 0,
        description: 'Mandatory degree certificate is pending upload in Document Review step.',
      });
    }

    if (hasLanguageDoc) {
      leadScore += 20;
      factors.push({
        factor: 'Verified German CEFR Proficiency Certificate',
        impact: 'POSITIVE',
        points: 20,
        description: 'Official Goethe / TestDaF certificate uploaded and extracted, satisfying visa requirements.',
      });
    } else if (hasGermanReported) {
      leadScore += 10;
      factors.push({
        factor: 'Self-Reported German Proficiency (Unverified)',
        impact: 'NEUTRAL',
        points: 10,
        description: 'Language proficiency self-reported by applicant; official language certificate not yet uploaded.',
      });
    } else {
      factors.push({
        factor: 'German Language Certificate: Not Uploaded / Missing',
        impact: 'NEUTRAL',
        points: 0,
        description: 'No German certificate uploaded yet. Preparation track available on learning path.',
      });
    }

    if (hasPaid) {
      leadScore += 10;
      factors.push({
        factor: 'Active Priority APS Entitlement',
        impact: 'POSITIVE',
        points: 10,
        description: 'Applicant has completed Indian UPI payment for fast-track consultant review.',
      });
    }

    const consultantLeadScore: ConsultantLeadScore = {
      leadScore: Math.min(leadScore, 98),
      qualificationTier: leadScore >= 80 ? 'HIGH_PRIORITY' : leadScore >= 60 ? 'MEDIUM_PRIORITY' : 'NURTURE',
      explanationFactors: factors,
      consultantSummaryNote: `Strong applicant for Educaro Winter Semester cohort. Academic credentials verified via Anna University transcripts. Recommending direct consultant handoff for APS expedited queue.`,
    };

    const videoIntro = videoRes.rows.length > 0 ? {
      id: videoRes.rows[0].id,
      videoUrl: videoRes.rows[0].video_url,
      filename: videoRes.rows[0].filename,
      transcript: videoRes.rows[0].transcript,
      durationSeconds: videoRes.rows[0].duration_seconds,
      extractedFields: JSON.parse(videoRes.rows[0].extracted_data || '[]'),
      createdAt: videoRes.rows[0].created_at,
    } : null;

    // Evaluate 90-day Educaro Premium status
    const now = new Date();
    const confirmedPurchases = purchasesRes.rows.filter(
      (p: any) => p.status === 'CONFIRMED' && p.access_expiry_date
    );

    let premiumStatus = {
      state: 'NONE',
      isActive: false,
      daysRemaining: 0,
      purchaseDate: null as string | null,
      accessExpiryDate: null as string | null,
      latestPurchase: purchasesRes.rows[0] || null,
    };

    if (confirmedPurchases.length > 0) {
      const activePurchase = confirmedPurchases.sort(
        (a: any, b: any) => new Date(b.access_expiry_date).getTime() - new Date(a.access_expiry_date).getTime()
      )[0];
      const expiryDate = new Date(activePurchase.access_expiry_date);

      if (now <= expiryDate) {
        const diffMs = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        premiumStatus = {
          state: 'ACTIVE',
          isActive: true,
          daysRemaining,
          purchaseDate: activePurchase.purchase_date,
          accessExpiryDate: activePurchase.access_expiry_date,
          latestPurchase: activePurchase,
        };
      } else {
        premiumStatus = {
          state: 'EXPIRED',
          isActive: false,
          daysRemaining: 0,
          purchaseDate: activePurchase.purchase_date,
          accessExpiryDate: activePurchase.access_expiry_date,
          latestPurchase: activePurchase,
        };
      }
    } else if (purchasesRes.rows.length > 0 && purchasesRes.rows[0].status === 'SUBMITTED') {
      premiumStatus = {
        state: 'SUBMITTED',
        isActive: false,
        daysRemaining: 0,
        purchaseDate: null,
        accessExpiryDate: null,
        latestPurchase: purchasesRes.rows[0],
      };
    }

    return {
      user: userRes.rows[0],
      applicant: appRes.rows[0],
      fields,
      documents: docsRes.rows.map((d: any) => ({
        id: d.id,
        documentType: d.document_type,
        filename: d.filename,
        previewUrl: d.preview_url,
        status: d.status,
        createdAt: d.created_at,
      })),
      videoIntro,
      payments: payRes.rows,
      purchases: purchasesRes.rows,
      premiumStatus,
      entitlements: entRes.rows,
      consultantLeadScore,
    };
  }
}
