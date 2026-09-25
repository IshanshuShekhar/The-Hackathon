import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as crypto from 'crypto';

@Injectable()
export class FaqService implements OnModuleInit {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.seedFaq();
  }

  private async seedFaq() {
    try {
      const res = await this.db.query('SELECT COUNT(*) FROM faq_categories');
      if (parseInt(res.rows[0].count) > 0) {
        return; // Already seeded
      }

      this.logger.log('Seeding FAQ categories and items...');

      const categories = [
        { key: 'getting_started', label: 'Getting started' },
        { key: 'documents', label: 'Documents and profile' },
        { key: 'eligibility', label: 'Eligibility and next steps' },
        { key: 'language', label: 'German language' },
        { key: 'payment', label: 'Verification and payment' },
        { key: 'privacy', label: 'Privacy and data' },
        { key: 'after', label: 'After the assessment' },
      ];

      const catIds: Record<string, string> = {};
      let order = 0;
      for (const cat of categories) {
        const id = crypto.randomUUID();
        await this.db.query(
          `INSERT INTO faq_categories (id, key, label_en, "order") VALUES ($1, $2, $3, $4)`,
          [id, cat.key, cat.label, ++order]
        );
        catIds[cat.key] = id;
      }

      // We don't have all 32, so we seed a few from the UI context
      const items = [
        {
          category: 'getting_started',
          q: 'Who is EduRoute AI for?',
          a: 'Applicants from India exploring study, vocational training (Ausbildung), or direct employment opportunities in Germany.',
        },
        {
          category: 'language',
          q: 'Do I need to know German to start?',
          a: 'No. You can start your profile in English or Hindi. If your German level is weak or missing, we\'ll show a guided learning path with tutorial videos and a readiness estimate instead of blocking you.',
        },
        {
          category: 'documents',
          q: 'What documents do I need to upload?',
          a: 'Degrees, mark sheets, experience letters, German language certificates (e.g. Goethe, TestDaF), and your existing CV (if you have one) — you can add these progressively, not all at once.',
        },
        {
          category: 'eligibility',
          q: 'How do I know if I qualify?',
          a: 'After your profile is complete, you\'ll get a clear qualification outcome evaluated by our deterministic rules engine plus a list of any outstanding requirements — not just a vague yes/no.',
        },
        {
          category: 'eligibility',
          q: 'What is the "next best action"?',
          a: 'At every stage, your dashboard shows the single most useful thing to do next (e.g. "Upload your German language certificate") so you\'re never guessing what\'s left.',
        },
        {
          category: 'eligibility',
          q: 'How does EduRoute AI decide what I should do next?',
          a: 'Your Recommendations dashboard looks at your actual profile — pathway, documents, qualification status, language levels, and progress so far — and prioritizes what\'s missing as Required, Important, or Recommended. Every recommendation has a "Why this recommendation?" explanation so you can see exactly what it\'s based on, not just a black-box suggestion.',
        },
        {
          category: 'eligibility',
          q: 'Do recommendations change if my situation changes?',
          a: 'Yes. As soon as you upload a document, resolve a conflict, or update your profile, your recommendations and readiness scores recalculate automatically — you\'ll never see stale advice.',
        },
        {
          category: 'payment',
          q: 'Do I need to pay to use EduRoute AI?',
          a: 'Building your profile and getting your qualification outcome is completely free. Optional paid add-ons (e.g. priority consultant review, expedited APS filing) can be unlocked via UPI or QR code payment.',
        },
        {
          category: 'payment',
          q: "What's included in Premium?",
          a: "Educaro Premium bundles everything in one plan: 1-on-1 Consultant Support, extended German learning modules beyond the free readiness path, priority document review with faster turnaround, and any other resources marked Premium as they're added. All of it unlocks with a single payment — no separate purchases per feature.",
        },
      ];

      for (const item of items) {
        await this.db.query(
          `INSERT INTO faq_items (id, category_id, question_en, answer_en) VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), catIds[item.category], item.q, item.a]
        );
      }

      this.logger.log('FAQ seeded successfully.');
    } catch (err) {
      this.logger.error('Failed to seed FAQ', err);
    }
  }

  async getAllFaqs() {
    const categoriesRes = await this.db.query('SELECT * FROM faq_categories ORDER BY "order" ASC');
    const itemsRes = await this.db.query('SELECT * FROM faq_items');

    const categories = categoriesRes.rows.map(c => ({
      id: c.id,
      key: c.key,
      label_en: c.label_en,
      label_hi: c.label_hi,
      items: itemsRes.rows.filter(i => i.category_id === c.id)
    }));

    return categories;
  }

  async searchFaqs(query: string) {
    const q = `%${query}%`;
    const itemsRes = await this.db.query(
      `SELECT * FROM faq_items WHERE question_en ILIKE $1 OR answer_en ILIKE $1`,
      [q]
    );
    return itemsRes.rows;
  }

  async getFaqsForScreen(screenKey: string) {
    const itemsRes = await this.db.query(
      `SELECT * FROM faq_items WHERE related_screen = $1`,
      [screenKey]
    );
    return itemsRes.rows;
  }
}
