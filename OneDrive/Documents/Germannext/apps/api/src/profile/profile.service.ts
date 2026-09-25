import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { Provenance, UserRole, ProfileFieldRecord, UpsertFieldDto } from '@educaro/shared';
import * as crypto from 'crypto';

export interface ActorContext {
  userId: string;
  role: UserRole;
  isAi?: boolean;
}

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
  ) {}

  /**
   * Enforces Hard Rule 1:
   * "Every profile field must carry a provenance label (VERIFIED / APPLICANT_PROVIDED / AI_EXTRACTED / AI_GENERATED).
   * The AI-writing path must never be able to set VERIFIED."
   */
  async upsertField(actor: ActorContext, dto: UpsertFieldDto): Promise<ProfileFieldRecord> {
    const startTime = Date.now();

    // 1. HARD RULE 1 CHECK: AI writing path cannot set VERIFIED
    if (actor.isAi && dto.provenance === Provenance.VERIFIED) {
      this.logger.error(`Security breach attempt: AI path tried to assign VERIFIED to field '${dto.fieldKey}'`);
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Security Violation (Hard Rule 1): AI agent writing paths are forbidden from setting VERIFIED provenance.',
        field: dto.fieldKey,
        attemptedProvenance: dto.provenance,
      });
    }

    // 2. APPLICANT SELF-EDIT CHECK: An applicant cannot mark their own fields as VERIFIED directly
    let finalProvenance = dto.provenance;
    if (!actor.isAi && actor.role === UserRole.APPLICANT) {
      if (dto.provenance === Provenance.VERIFIED) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Applicants cannot mark their own fields as VERIFIED. Verification requires official checks or consultant sign-off.',
        });
      }
      // Human direct edits default to APPLICANT_PROVIDED
      finalProvenance = Provenance.APPLICANT_PROVIDED;
    }

    // Default provenance fallback if not specified
    if (!finalProvenance) {
      finalProvenance = actor.isAi ? Provenance.AI_EXTRACTED : Provenance.APPLICANT_PROVIDED;
    }

    // 3. Upsert into database
    const updatedAt = new Date().toISOString();
    const id = crypto.randomUUID();

    // Check existing
    const existing = await this.db.query(
      'SELECT id, value, provenance FROM profile_fields WHERE user_id = $1 AND field_key = $2',
      [actor.userId, dto.fieldKey]
    );

    let resultRecord: ProfileFieldRecord;

    if (existing.rows.length > 0) {
      // Update existing field
      const res = await this.db.query(
        `UPDATE profile_fields
         SET value = $1, provenance = $2, confidence = $3, source_document_id = $4,
             source_snippet = $5, updated_at = $6
         WHERE user_id = $7 AND field_key = $8
         RETURNING *`,
        [
          dto.value,
          finalProvenance,
          dto.confidence ?? null,
          dto.sourceDocumentId ?? null,
          dto.sourceSnippet ?? null,
          updatedAt,
          actor.userId,
          dto.fieldKey,
        ]
      );
      const row = res.rows[0];
      resultRecord = {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        fieldKey: row.field_key,
        value: row.value,
        provenance: row.provenance as Provenance,
        confidence: row.confidence,
        sourceDocumentId: row.source_document_id,
        sourceSnippet: row.source_snippet,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      };
    } else {
      // Insert new field
      const res = await this.db.query(
        `INSERT INTO profile_fields
         (id, user_id, category, field_key, value, provenance, confidence, source_document_id, source_snippet, updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
         RETURNING *`,
        [
          id,
          actor.userId,
          dto.category || 'general',
          dto.fieldKey,
          dto.value,
          finalProvenance,
          dto.confidence ?? null,
          dto.sourceDocumentId ?? null,
          dto.sourceSnippet ?? null,
          updatedAt,
        ]
      );
      const row = res.rows[0];
      resultRecord = {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        fieldKey: row.field_key,
        value: row.value,
        provenance: row.provenance as Provenance,
        confidence: row.confidence,
        sourceDocumentId: row.source_document_id,
        sourceSnippet: row.source_snippet,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      };
    }

    // 4. Update applicant completeness score
    await this.recalculateCompleteness(actor.userId);

    // 5. HARD RULE 3: Log agent action if called from AI path
    if (actor.isAi) {
      await this.eventsService.logEvent({
        userId: actor.userId,
        agent: 'ProfileAgent',
        tool: 'upsertField',
        reason: `Upserted field ${dto.fieldKey} with provenance ${finalProvenance}`,
        input: dto,
        output: { fieldKey: resultRecord.fieldKey, provenance: resultRecord.provenance },
        confidence: dto.confidence,
        durationMs: Date.now() - startTime,
      });
    }

    return resultRecord;
  }

  async getProfile(userId: string): Promise<{ fields: ProfileFieldRecord[]; completenessScore: number }> {
    const res = await this.db.query(
      'SELECT * FROM profile_fields WHERE user_id = $1 ORDER BY category, field_key',
      [userId]
    );

    // If new profile has no fields, return empty profile
    if (res.rows.length === 0) {
      return { fields: [], completenessScore: 0 };
    }

    const fields: ProfileFieldRecord[] = res.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      fieldKey: row.field_key,
      value: row.value,
      provenance: row.provenance as Provenance,
      confidence: row.confidence,
      sourceDocumentId: row.source_document_id,
      sourceSnippet: row.source_snippet,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    }));

    const completenessScore = this.computeScore(fields);
    return { fields, completenessScore };
  }

  async saveCandidateDetails(
    userId: string,
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      age?: string;
      country?: string;
      germanLevel: string;
      englishLevel?: string;
    }
  ) {
    const actor = { userId, role: UserRole.APPLICANT, isAi: false };
    const savedFields: ProfileFieldRecord[] = [];

    // Personal details
    if (data.fullName) {
      const f = await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'fullName',
        value: data.fullName,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }
    if (data.email) {
      const f = await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'email',
        value: data.email,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }
    if (data.phone) {
      const f = await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'phone',
        value: data.phone,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }
    if (data.age) {
      const f = await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'age',
        value: String(data.age),
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }
    if (data.country) {
      const f = await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'country',
        value: data.country,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
      // Keep currentLocation in sync
      await this.upsertField(actor, {
        category: 'personal',
        fieldKey: 'currentLocation',
        value: data.country,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
    }

    // Language details
    if (data.germanLevel) {
      const f = await this.upsertField(actor, {
        category: 'languages',
        fieldKey: 'germanLevel',
        value: data.germanLevel,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }
    if (data.englishLevel) {
      const f = await this.upsertField(actor, {
        category: 'languages',
        fieldKey: 'englishLevel',
        value: data.englishLevel,
        provenance: Provenance.APPLICANT_PROVIDED,
      });
      savedFields.push(f);
    }

    // Sync into applicants table
    await this.db.query(
      `UPDATE applicants
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           location = COALESCE($4, location)
       WHERE user_id = $5`,
      [data.fullName || null, data.email || null, data.phone || null, data.country || null, userId]
    );

    // Log to Agent Events
    await this.eventsService.logEvent({
      userId,
      agent: 'Intake Agent',
      tool: 'CandidateDetailsForm',
      reason: 'Captured applicant primary personal & language proficiency details (Applicant-Provided)',
      input: data,
      output: { savedFieldsCount: savedFields.length, provenance: Provenance.APPLICANT_PROVIDED },
      confidence: 1.0,
      durationMs: 35,
    });

    return { success: true, savedFields };
  }

  private computeScore(fields: ProfileFieldRecord[]): number {
    const keyFields = ['fullName', 'targetPathway', 'currentLocation', 'germanLevel', 'highestDegree'];
    const filled = keyFields.filter((key) => {
      const f = fields.find((item) => item.fieldKey === key);
      return f && f.value && f.value.trim().length > 0;
    }).length;

    return Math.round((filled / keyFields.length) * 100);
  }

  private async recalculateCompleteness(userId: string) {
    const res = await this.db.query(
      'SELECT field_key, value FROM profile_fields WHERE user_id = $1',
      [userId]
    );
    const score = this.computeScore(
      res.rows.map((r: any) => ({ fieldKey: r.field_key, value: r.value } as any))
    );
    await this.db.query(
      'UPDATE applicants SET completeness_pct = $1 WHERE user_id = $2',
      [score, userId]
    );
  }
}
