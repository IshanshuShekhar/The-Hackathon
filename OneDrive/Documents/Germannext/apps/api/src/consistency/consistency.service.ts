import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { ProfileService } from '../profile/profile.service';
import { DiscrepancyItem, InconsistencyReport, ResolveInconsistencyDto, Provenance, UserRole } from '@educaro/shared';
import * as crypto from 'crypto';

@Injectable()
export class ConsistencyService {
  private readonly logger = new Logger(ConsistencyService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
    private readonly profileService: ProfileService,
  ) {}

  async checkInconsistencies(userId: string): Promise<InconsistencyReport> {
    const startTime = Date.now();

    // Fetch existing unresolved inconsistencies from DB
    const existingRows = await this.db.query(
      'SELECT * FROM inconsistencies WHERE user_id = $1 AND is_resolved = FALSE',
      [userId]
    );

    if (existingRows.rows.length > 0) {
      const discrepancies: DiscrepancyItem[] = existingRows.rows.map((r: any) => ({
        id: r.id,
        fieldKey: r.field_key,
        fieldLabel: r.field_label,
        sourceA: JSON.parse(r.source_a_json),
        sourceB: JSON.parse(r.source_b_json),
        clarifyingQuestion: r.clarifying_question,
        suggestedOptions: JSON.parse(r.suggested_options_json),
        severity: r.severity,
        isResolved: r.is_resolved,
        resolvedValue: r.resolved_value,
      }));

      return { hasInconsistency: true, discrepancies };
    }

    // Check profile fields for discrepancies
    const fieldsRes = await this.db.query(
      'SELECT * FROM profile_fields WHERE user_id = $1',
      [userId]
    );
    const fields = fieldsRes.rows;

    const chatGradYear = fields.find((f: any) => f.field_key === 'graduationYear')?.value;
    const docGradDate = fields.find((f: any) => f.field_key === 'graduationDate')?.value;

    const discrepancies: DiscrepancyItem[] = [];

    // Check if graduation year from chat conflicts with extracted graduation date from document
    if (chatGradYear && docGradDate && chatGradYear !== docGradDate) {
      const conflictId = crypto.randomUUID();
      const item: DiscrepancyItem = {
        id: conflictId,
        fieldKey: 'graduationYear',
        fieldLabel: 'Graduation Year / Date of Passing',
        sourceA: {
          sourceType: 'CHAT',
          sourceName: 'Applicant Profile Intake',
          value: chatGradYear,
        },
        sourceB: {
          sourceType: 'DOCUMENT',
          sourceName: 'Degree Certificate (Anna University)',
          value: docGradDate,
        },
        clarifyingQuestion: `We detected a date conflict: Your chat intake states you graduated in ${chatGradYear}, but your uploaded Anna University degree states completion in ${docGradDate}. Which year is correct for your APS / Anabin verification?`,
        suggestedOptions: [
          `${docGradDate} (As stated on my official degree certificate)`,
          `${chatGradYear} (Provisional was earlier; final convocation completed in ${chatGradYear})`,
        ],
        severity: 'CRITICAL',
        isResolved: false,
      };

      await this.db.query(
        `INSERT INTO inconsistencies (id, user_id, field_key, field_label, source_a_json, source_b_json, clarifying_question, suggested_options_json, severity, is_resolved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)`,
        [
          item.id,
          userId,
          item.fieldKey,
          item.fieldLabel,
          JSON.stringify(item.sourceA),
          JSON.stringify(item.sourceB),
          item.clarifyingQuestion,
          JSON.stringify(item.suggestedOptions),
          item.severity,
        ]
      );

      discrepancies.push(item);

      // Log event
      await this.eventsService.logEvent({
        userId,
        agent: 'Consistency Agent',
        tool: 'CrossDocumentConsistencyCheck',
        reason: `Discrepancy caught: Chat graduation year (${chatGradYear}) vs Degree Certificate date (${docGradDate})`,
        input: { chatGradYear, docGradDate },
        output: { conflictDetected: true, clarifyingQuestion: item.clarifyingQuestion },
        confidence: 0.99,
        durationMs: Date.now() - startTime,
      });
    }

    return {
      hasInconsistency: discrepancies.length > 0,
      discrepancies,
    };
  }

  async resolveInconsistency(userId: string, dto: ResolveInconsistencyDto) {
    const startTime = Date.now();

    // Update inconsistency record
    await this.db.query(
      `UPDATE inconsistencies
       SET is_resolved = TRUE, resolved_value = $1
       WHERE id = $2 AND user_id = $3`,
      [dto.resolvedValue, dto.discrepancyId, userId]
    );

    // Get discrepancy details
    const incRes = await this.db.query('SELECT * FROM inconsistencies WHERE id = $1', [dto.discrepancyId]);
    const inc = incRes.rows[0];

    // Update the profile field with APPLICANT_PROVIDED provenance
    const actor = { userId, role: UserRole.APPLICANT, isAi: false };
    if (inc?.field_key) {
      await this.profileService.upsertField(actor, {
        category: 'EDUCATION',
        fieldKey: inc.field_key,
        value: dto.resolvedValue,
        provenance: Provenance.APPLICANT_PROVIDED,
        sourceSnippet: `Clarification resolved by applicant: ${dto.resolutionNote || dto.resolvedValue}`,
      });
    }

    // Log event
    await this.eventsService.logEvent({
      userId,
      agent: 'Consistency Agent',
      tool: 'DiscrepancyResolutionTool',
      reason: `Applicant resolved inconsistency for '${inc?.field_label || 'field'}' to '${dto.resolvedValue}'`,
      input: { discrepancyId: dto.discrepancyId, chosenValue: dto.resolvedValue, note: dto.resolutionNote },
      output: { status: 'RESOLVED', updatedProfileValue: dto.resolvedValue },
      confidence: 1.0,
      durationMs: Date.now() - startTime,
    });

    return {
      success: true,
      resolvedValue: dto.resolvedValue,
      message: 'Inconsistency successfully resolved and profile updated.',
    };
  }

  async injectDemoConflict(userId: string) {
    // Helper endpoint to inject a conflict during demo presentations
    const conflictId = crypto.randomUUID();
    const item: DiscrepancyItem = {
      id: conflictId,
      fieldKey: 'graduationYear',
      fieldLabel: 'Graduation Year / Date of Passing',
      sourceA: {
        sourceType: 'CHAT',
        sourceName: 'Applicant Profile Intake',
        value: '2024',
      },
      sourceB: {
        sourceType: 'DOCUMENT',
        sourceName: 'Degree Certificate (Anna University)',
        value: '2022',
      },
      clarifyingQuestion: 'We detected a date conflict: Your chat intake states you graduated in 2024, but your uploaded Anna University degree states completion in June 2022. Which year is correct for your APS / Anabin verification?',
      suggestedOptions: [
        '2022 (As stated on my official degree certificate)',
        '2024 (Provisional was 2022; final convocation held in 2024)',
      ],
      severity: 'CRITICAL',
      isResolved: false,
    };

    await this.db.query(
      `INSERT INTO inconsistencies (id, user_id, field_key, field_label, source_a_json, source_b_json, clarifying_question, suggested_options_json, severity, is_resolved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)`,
      [
        item.id,
        userId,
        item.fieldKey,
        item.fieldLabel,
        JSON.stringify(item.sourceA),
        JSON.stringify(item.sourceB),
        item.clarifyingQuestion,
        JSON.stringify(item.suggestedOptions),
        item.severity,
      ]
    );

    await this.eventsService.logEvent({
      userId,
      agent: 'Consistency Agent',
      tool: 'InconsistencyCatcher',
      reason: 'Cross-document discrepancy detected: Date mismatch between self-reported intake and verified degree',
      input: { field: 'graduationYear', chat: '2024', degreeDoc: '2022' },
      output: { conflictDetected: true, severity: 'CRITICAL' },
      confidence: 0.99,
      durationMs: 80,
    });

    return { success: true, discrepancy: item };
  }
}
