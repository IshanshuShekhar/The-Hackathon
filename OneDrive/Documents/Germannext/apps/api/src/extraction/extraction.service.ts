import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { ProfileService } from '../profile/profile.service';
import { Provenance, UserRole, ExtractedDocument, ExtractedField, DocumentType } from '@educaro/shared';
import * as crypto from 'crypto';

export interface DocumentUploadDto {
  userId: string;
  documentType: DocumentType;
  filename: string;
  base64Data?: string;
  simulatedSampleId?: 'degree_standard' | 'degree_conflict' | 'language_b1' | 'language_a2' | 'passport_standard' | 'visa_standard';
}

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
    private readonly profileService: ProfileService,
  ) {}

  async processDocumentExtraction(dto: DocumentUploadDto): Promise<ExtractedDocument> {
    const startTime = Date.now();
    const docId = crypto.randomUUID();

    let extractedFields: ExtractedField[] = [];
    let overallConfidence = 0.95;
    let previewUrl = '';

    if (dto.documentType === 'DEGREE_CERTIFICATE') {
      previewUrl = '/samples/degree_certificate_preview.svg';
      const isConflictSample = dto.simulatedSampleId === 'degree_conflict';

      // If simulated conflict, graduation year is 2022 (while applicant entered 2024 in chat)
      const gradYear = isConflictSample ? '2022' : '2024';

      extractedFields = [
        {
          key: 'degreeName',
          label: 'Degree Title',
          value: 'Bachelor of Technology (B.Tech) - Computer Science',
          confidence: 0.98,
          sourceSnippet: 'Awarded degree of Bachelor of Technology in Computer Science & Engineering',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'institution',
          label: 'Awarding University',
          value: 'Anna University, Chennai',
          confidence: 0.95,
          sourceSnippet: 'Anna University, Chennai 600025, Tamil Nadu, India',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'graduationDate',
          label: 'Date / Year of Passing',
          value: gradYear,
          confidence: 0.93,
          sourceSnippet: isConflictSample ? 'Completed requirements in the examination held in June 2022' : 'Completed requirements in the examination held in May 2024',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'gradeOrGpa',
          label: 'CGPA / Classification',
          value: '8.4 / 10 (First Class with Distinction)',
          confidence: 0.91,
          sourceSnippet: 'Cumulative Grade Point Average: 8.40 (Scale 10.0)',
          provenance: Provenance.AI_EXTRACTED,
        },
      ];
    } else if (dto.documentType === 'LANGUAGE_CERTIFICATE') {
      previewUrl = '/samples/goethe_certificate_preview.svg';
      const isB1 = dto.simulatedSampleId !== 'language_a2';
      const level = isB1 ? 'B1' : 'A2';

      extractedFields = [
        {
          key: 'certificateIssuer',
          label: 'Exam Board / Institute',
          value: 'Goethe-Institut / Max Mueller Bhavan',
          confidence: 0.99,
          sourceSnippet: 'Goethe-Zertifikat Prüfungskommission Max Mueller Bhavan New Delhi',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'germanLevel',
          label: 'CEFR German Level',
          value: level,
          confidence: 0.97,
          sourceSnippet: `Zertifikat Deutsch / Goethe-Zertifikat ${level} für Jugendliche & Erwachsene`,
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'score',
          label: 'Overall Grade / Points',
          value: '84 / 100 (Gut / Good)',
          confidence: 0.94,
          sourceSnippet: 'Gesamtergebnis: 84 Punkte (Gut) — Hören: 22, Lesen: 20, Schreiben: 21, Sprechen: 21',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'testDate',
          label: 'Examination Date',
          value: '14.11.2023',
          confidence: 0.96,
          sourceSnippet: 'Prüfungsdatum: 14. November 2023',
          provenance: Provenance.AI_EXTRACTED,
        },
      ];
    } else if (dto.documentType === 'PASSPORT') {
      previewUrl = '/samples/passport_preview.svg';
      extractedFields = [
        {
          key: 'fullName',
          label: 'Full Name',
          value: 'Rahul Sharma',
          confidence: 0.99,
          sourceSnippet: 'Given Names: RAHUL, Surname: SHARMA, Republic of India Passport',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'passportNumber',
          label: 'Passport Number',
          value: 'Z5829104',
          confidence: 0.98,
          sourceSnippet: 'Passport No: Z5829104, Type: P, Country Code: IND',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'nationality',
          label: 'Nationality',
          value: 'Indian',
          confidence: 0.99,
          sourceSnippet: 'Nationality: INDIAN, Place of Birth: TAMIL NADU',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'expiryDate',
          label: 'Expiry Date',
          value: '18.08.2032',
          confidence: 0.96,
          sourceSnippet: 'Date of Expiry: 18/08/2032, Date of Issue: 19/08/2022',
          provenance: Provenance.AI_EXTRACTED,
        },
      ];
    } else if (dto.documentType === 'VISA') {
      previewUrl = '/samples/visa_preview.svg';
      extractedFields = [
        {
          key: 'visaType',
          label: 'Visa Type',
          value: 'National Visa (Type D) / Schengen',
          confidence: 0.97,
          sourceSnippet: 'Art des Visums / Type of Visa: D, Valid for: DEUTSCHLAND',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'validityDates',
          label: 'Validity Dates',
          value: '01.10.2024 – 30.09.2025',
          confidence: 0.95,
          sourceSnippet: 'Gültig von / Valid from: 01-10-2024 bis / until: 30-09-2025',
          provenance: Provenance.AI_EXTRACTED,
        },
        {
          key: 'visaNumber',
          label: 'Visa / Sticker Number',
          value: 'DEU8492019',
          confidence: 0.94,
          sourceSnippet: 'Nummer des Visums / Visa No: DEU8492019',
          provenance: Provenance.AI_EXTRACTED,
        },
      ];
    }

    // Save to documents table
    await this.db.query(
      `INSERT INTO documents (id, user_id, document_type, filename, preview_url, status, extracted_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        docId,
        dto.userId,
        dto.documentType,
        dto.filename,
        previewUrl,
        'EXTRACTED',
        JSON.stringify(extractedFields),
      ]
    );

    // Save fields into profile_fields with AI_EXTRACTED provenance
    const actor = { userId: dto.userId, role: UserRole.APPLICANT, isAi: true };
    for (const field of extractedFields) {
      await this.profileService.upsertField(actor, {
        category: dto.documentType,
        fieldKey: field.key,
        value: field.value,
        provenance: Provenance.AI_EXTRACTED,
        confidence: field.confidence,
        sourceDocumentId: docId,
        sourceSnippet: field.sourceSnippet,
      });
    }

    const durationMs = Date.now() - startTime;

    // Log to Agent Events
    await this.eventsService.logEvent({
      userId: dto.userId,
      agent: 'Extraction Agent',
      tool: 'OCRDocumentParser',
      reason: `Parsed uploaded ${dto.documentType.replace('_', ' ')} (${dto.filename})`,
      input: {
        documentType: dto.documentType,
        filename: dto.filename,
        sampleId: dto.simulatedSampleId,
      },
      output: {
        documentId: docId,
        fieldsCount: extractedFields.length,
        overallConfidence,
        previewUrl,
      },
      confidence: overallConfidence,
      durationMs,
    });

    return {
      id: docId,
      documentType: dto.documentType,
      filename: dto.filename,
      previewUrl,
      uploadedAt: new Date().toISOString(),
      extractedFields,
      overallConfidence,
      status: 'EXTRACTED',
    };
  }

  async getDocuments(userId: string): Promise<ExtractedDocument[]> {
    const res = await this.db.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.rows.map((r: any) => ({
      id: r.id,
      documentType: r.document_type,
      filename: r.filename,
      previewUrl: r.preview_url,
      uploadedAt: r.created_at,
      extractedFields: JSON.parse(r.extracted_data || '[]'),
      overallConfidence: 0.95,
      status: r.status,
    }));
  }

  async confirmExtractedField(userId: string, docId: string, fieldKey: string, confirmedValue?: string) {
    // When applicant confirms or edits an extracted field, update provenance to APPLICANT_PROVIDED
    const actor = { userId, role: UserRole.APPLICANT, isAi: false };
    
    const existing = await this.db.query(
      'SELECT category, value FROM profile_fields WHERE user_id = $1 AND field_key = $2',
      [userId, fieldKey]
    );

    const val = confirmedValue ?? (existing.rows[0]?.value || '');
    const category = existing.rows[0]?.category || 'DOCUMENTS';

    await this.profileService.upsertField(actor, {
      category,
      fieldKey,
      value: val,
      provenance: Provenance.APPLICANT_PROVIDED,
      sourceDocumentId: docId,
    });

    await this.eventsService.logEvent({
      userId,
      agent: 'Extraction Agent',
      tool: 'FieldConfirmationTool',
      reason: `Applicant reviewed and confirmed field '${fieldKey}'`,
      input: { fieldKey, value: val },
      output: { provenance: Provenance.APPLICANT_PROVIDED, status: 'CONFIRMED' },
      confidence: 1.0,
      durationMs: 45,
    });

    return { success: true, fieldKey, confirmedValue: val, provenance: Provenance.APPLICANT_PROVIDED };
  }
}
