import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEventsService } from '../agent-events/agent-events.service';
import { ProfileService } from '../profile/profile.service';
import { Provenance, UserRole, Pathway } from '@educaro/shared';

export interface IntakeMessageDto {
  userId: string;
  step: 'GOAL' | 'PERSONAL' | 'EDUCATION' | 'EMPLOYMENT' | 'SKILLS' | 'LANGUAGES' | 'MOTIVATION';
  message: string;
  language?: 'en' | 'hi';
  metadata?: Record<string, any>;
}

@Injectable()
export class IntakeService {
  private readonly logger = new Logger(IntakeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsService: AgentEventsService,
    private readonly profileService: ProfileService,
  ) {}

  async processIntakeMessage(dto: IntakeMessageDto) {
    const startTime = Date.now();
    const actor = { userId: dto.userId, role: UserRole.APPLICANT, isAi: false };

    let replyText = '';
    let quickReplies: string[] = [];
    let updatedFields: Record<string, string> = {};

    switch (dto.step) {
      case 'GOAL': {
        const lower = dto.message.toLowerCase();
        let targetPathway: Pathway = Pathway.STUDY;
        if (lower.includes('ausbildung') || lower.includes('vocational') || lower.includes('training')) {
          targetPathway = Pathway.AUSBILDUNG;
        } else if (lower.includes('job') || lower.includes('work') || lower.includes('employment') || lower.includes('career')) {
          targetPathway = Pathway.EMPLOYMENT;
        }

        await this.profileService.upsertField(actor, {
          category: 'GOAL',
          fieldKey: 'targetPathway',
          value: targetPathway,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        // Also update applicant table goal
        await this.db.query('UPDATE applicants SET goal = $1 WHERE user_id = $2', [targetPathway, dto.userId]);

        replyText = dto.language === 'hi'
          ? `शानदार! हमने आपका लक्ष्य "${targetPathway}" के रूप में रिकॉर्ड कर लिया है। चलिए आपकी व्यक्तिगत और शैक्षिक जानकारी एकत्र करते हैं। आपका पूरा नाम क्या है?`
          : `Excellent! We've set your target pathway to "${targetPathway}". Let's collect your personal and educational profile. What is your full legal name and current location in India?`;

        quickReplies = ['New Delhi, India', 'Bengaluru, India', 'Mumbai, India', 'Hyderabad, India'];
        updatedFields = { targetPathway };
        break;
      }

      case 'PERSONAL': {
        await this.profileService.upsertField(actor, {
          category: 'PERSONAL',
          fieldKey: 'fullName',
          value: dto.metadata?.name || dto.message.split(',')[0].trim(),
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        if (dto.metadata?.location || dto.message.includes(',')) {
          const loc = dto.metadata?.location || dto.message.split(',')[1]?.trim() || 'India';
          await this.profileService.upsertField(actor, {
            category: 'PERSONAL',
            fieldKey: 'location',
            value: loc,
            provenance: Provenance.APPLICANT_PROVIDED,
          });
        }

        replyText = dto.language === 'hi'
          ? `धन्यवाद! अब अपनी उच्चतम शिक्षा (डिग्री, विश्वविद्यालय और स्नातक वर्ष) साझा करें।`
          : `Thank you! Next, what is your highest educational qualification, university name, and year of graduation?`;

        quickReplies = [
          'B.Tech in Computer Science, 2024',
          'Bachelor of Nursing (B.Sc), 2023',
          'Mechanical Engineering (B.E.), 2022',
          'High School (12th Grade), 2024',
        ];
        break;
      }

      case 'EDUCATION': {
        const text = dto.message;
        let degree = dto.metadata?.degree || 'Bachelor of Technology';
        let institution = dto.metadata?.institution || 'Anna University';
        let gradYear = dto.metadata?.graduationYear || '2024';

        if (text.includes('202')) {
          const yearMatch = text.match(/20\d\d/);
          if (yearMatch) gradYear = yearMatch[0];
        }

        await this.profileService.upsertField(actor, {
          category: 'EDUCATION',
          fieldKey: 'degree',
          value: degree,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        await this.profileService.upsertField(actor, {
          category: 'EDUCATION',
          fieldKey: 'institution',
          value: institution,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        await this.profileService.upsertField(actor, {
          category: 'EDUCATION',
          fieldKey: 'graduationYear',
          value: gradYear,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        replyText = dto.language === 'hi'
          ? `शिक्षा विवरण सहेजे गए। क्या आपके पास कोई कार्य अनुभव (नौकरी/इंटर्नशिप) है? यदि हाँ, तो पद और अवधि बताएं।`
          : `Education details saved. Do you have any professional work experience or internships? If yes, please describe your role and duration.`;

        quickReplies = [
          '2 years as Software Engineer',
          '1 year as Registered Nurse',
          'Fresher / No full-time experience',
          '6 months internship',
        ];
        break;
      }

      case 'EMPLOYMENT': {
        const exp = dto.message;
        await this.profileService.upsertField(actor, {
          category: 'EMPLOYMENT',
          fieldKey: 'workExperience',
          value: exp,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        replyText = dto.language === 'hi'
          ? `कार्य अनुभव नोट कर लिया गया है। आपकी जर्मन और अंग्रेजी भाषा का स्तर क्या है?`
          : `Got it! Now what is your current proficiency in German (None, A1, A2, B1, B2) and English?`;

        quickReplies = [
          'German: None, English: Fluent (C1)',
          'German: A1, English: Fluent',
          'German: B1, English: Fluent',
          'German: B2 (Goethe Certificate)',
        ];
        break;
      }

      case 'LANGUAGES': {
        const text = dto.message;
        let germanLevel = 'NONE';
        if (text.toUpperCase().includes('B2')) germanLevel = 'B2';
        else if (text.toUpperCase().includes('B1')) germanLevel = 'B1';
        else if (text.toUpperCase().includes('A2')) germanLevel = 'A2';
        else if (text.toUpperCase().includes('A1')) germanLevel = 'A1';

        await this.profileService.upsertField(actor, {
          category: 'LANGUAGES',
          fieldKey: 'germanLevel',
          value: germanLevel,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        await this.profileService.upsertField(actor, {
          category: 'LANGUAGES',
          fieldKey: 'englishLevel',
          value: 'C1',
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        replyText = dto.language === 'hi'
          ? `भाषा स्तर अपडेट हो गया है। आपका प्राथमिक तकनीकी या व्यावसायिक कौशल क्या है?`
          : `Language proficiency updated. What are your key technical or vocational skills?`;

        quickReplies = [
          'Python, React, TypeScript, Cloud',
          'Clinical Nursing, Patient Care',
          'AutoCAD, SolidWorks, Manufacturing',
          'Data Analysis, SQL, Excel',
        ];
        break;
      }

      case 'SKILLS': {
        await this.profileService.upsertField(actor, {
          category: 'SKILLS',
          fieldKey: 'technicalSkills',
          value: dto.message,
          provenance: Provenance.APPLICANT_PROVIDED,
        });

        replyText = dto.language === 'hi'
          ? `बहुत बढ़िया! आपकी प्रोफ़ाइल का प्रारंभिक भाग पूरा हो गया है। अब कृपया अपने दस्तावेज़ (डिग्री प्रमाणपत्र और भाषा प्रमाणपत्र) अपलोड करें ताकि हमारा AI उन्हें सत्यापित कर सके।`
          : `Great job! Your foundational profile has been constructed. Now, please proceed to Document Upload to verify your credentials with our Extraction Agent.`;

        quickReplies = ['Proceed to Document Upload →'];
        break;
      }

      default:
        replyText = `Understood. Profile updated with your response.`;
        break;
    }

    // Log to Agent Events
    await this.eventsService.logEvent({
      userId: dto.userId,
      agent: 'Intake Agent',
      tool: 'ProfileCaptureEngine',
      reason: `Processed applicant response for step ${dto.step}`,
      input: { step: dto.step, message: dto.message, language: dto.language },
      output: { replyText, updatedFields },
      confidence: 0.96,
      durationMs: Date.now() - startTime,
    });

    return {
      success: true,
      step: dto.step,
      replyText,
      quickReplies,
      updatedFields,
    };
  }
}
