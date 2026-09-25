import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';
import { newDb } from 'pg-mem';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: any;
  private isInMemory = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      'postgresql://educaro:educaropassword@localhost:5432/educaro_db?schema=public';

    try {
      const realPool = new Pool({
        connectionString,
        connectionTimeoutMillis: 1500,
      });
      await realPool.query('SELECT 1');
      this.pool = realPool;
      this.isInMemory = false;
      this.logger.log('Connected to PostgreSQL container on port 5432');
    } catch (err) {
      this.logger.warn(
        `PostgreSQL port 5432 not reachable (${err.message}). Initializing embedded Postgres emulator (pg-mem) with full relational SQL support.`
      );
      const memDb = newDb();
      const pgAdapter = memDb.adapters.createPg();
      this.pool = new pgAdapter.Pool();
      this.isInMemory = true;
    }

    await this.initSchema();
  }

  async onModuleDestroy() {
    if (this.pool?.end) {
      await this.pool.end();
    }
  }

  private async initSchema() {
    try {
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT,
          role VARCHAR(50) DEFAULT 'APPLICANT' NOT NULL,
          consent_at TIMESTAMP,
          otp_code VARCHAR(10),
          otp_expires_at TIMESTAMP,
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS applicants (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          location VARCHAR(255),
          goal VARCHAR(50),
          completeness_pct INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS profile_fields (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          category VARCHAR(50) NOT NULL,
          field_key VARCHAR(100) NOT NULL,
          value TEXT NOT NULL,
          provenance VARCHAR(50) NOT NULL,
          confidence REAL,
          source_document_id VARCHAR(100),
          source_snippet TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, field_key)
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS agent_events (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          agent VARCHAR(100) NOT NULL,
          tool VARCHAR(100) NOT NULL,
          reason TEXT,
          input TEXT NOT NULL,
          output TEXT NOT NULL,
          confidence REAL,
          duration_ms INTEGER,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          document_type VARCHAR(50) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          preview_url TEXT,
          status VARCHAR(50) DEFAULT 'EXTRACTED',
          extracted_data TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS inconsistencies (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          field_key VARCHAR(100) NOT NULL,
          field_label VARCHAR(255) NOT NULL,
          source_a_json TEXT NOT NULL,
          source_b_json TEXT NOT NULL,
          clarifying_question TEXT NOT NULL,
          suggested_options_json TEXT NOT NULL,
          severity VARCHAR(20) DEFAULT 'CRITICAL',
          is_resolved BOOLEAN DEFAULT FALSE,
          resolved_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS entitlements (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          feature_key VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, feature_key)
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          transaction_id VARCHAR(100) UNIQUE NOT NULL,
          method VARCHAR(50) NOT NULL,
          amount INTEGER NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status VARCHAR(50) DEFAULT 'COMPLETED',
          entitlement_key VARCHAR(100) NOT NULL,
          utr VARCHAR(64),
          receipt_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS video_intros (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          video_url TEXT NOT NULL,
          filename VARCHAR(255),
          transcript TEXT NOT NULL,
          duration_seconds INTEGER,
          extracted_data TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS purchases (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          payment_id VARCHAR(100),
          amount INTEGER NOT NULL DEFAULT 999,
          currency VARCHAR(10) NOT NULL DEFAULT 'INR',
          purchase_date TIMESTAMP,
          access_expiry_date TIMESTAMP,
          status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
          plan VARCHAR(100) NOT NULL DEFAULT 'EDUCARO_PREMIUM',
          receipt_file_url TEXT,
          receipt_original_filename VARCHAR(255),
          receipt_mime_type VARCHAR(100),
          receipt_size_bytes INTEGER,
          confirmed_at TIMESTAMP,
          confirmed_by VARCHAR(64),
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON purchases(user_id, status);

        -- Safe column additions for existing installations
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS receipt_file_url TEXT;
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS receipt_original_filename VARCHAR(255);
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS receipt_mime_type VARCHAR(100);
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS receipt_size_bytes INTEGER;
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS confirmed_by VARCHAR(64);
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS cvs (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          cv_data TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_cvs_user ON cvs(user_id);
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS recommendations (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          priority VARCHAR(20) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          pathway_context VARCHAR(50) NOT NULL,
          action_route VARCHAR(100),
          action_label VARCHAR(100),
          why_explanation TEXT,
          why_provenance VARCHAR(50) DEFAULT 'AI_GENERATED',
          rule_id VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_recommendations_user_status ON recommendations(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_recommendations_user_priority ON recommendations(user_id, priority);
        CREATE INDEX IF NOT EXISTS idx_recommendations_user_rule ON recommendations(user_id, rule_id);
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS faq_categories (
          id VARCHAR(64) PRIMARY KEY,
          key VARCHAR(50) UNIQUE NOT NULL,
          label_en VARCHAR(255) NOT NULL,
          label_hi VARCHAR(255),
          "order" INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS faq_items (
          id VARCHAR(64) PRIMARY KEY,
          category_id VARCHAR(64) REFERENCES faq_categories(id) ON DELETE CASCADE,
          question_en TEXT NOT NULL,
          question_hi TEXT,
          answer_en TEXT NOT NULL,
          answer_hi TEXT,
          related_screen VARCHAR(100),
          views INTEGER DEFAULT 0,
          unanswered_flag BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.logger.log('Database tables verified/initialized successfully (users, applicants, profile_fields, agent_events, documents, inconsistencies, entitlements, payments, video_intros, purchases, recommendations, faq)');
    } catch (err) {
      this.logger.error('Failed to initialize database schema', err.stack);
    }
  }

  async checkConnection(): Promise<{ connected: boolean; isInMemory: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return {
        connected: true,
        isInMemory: this.isInMemory,
        latencyMs: Date.now() - start,
      };
    } catch (error: any) {
      return {
        connected: false,
        isInMemory: this.isInMemory,
        error: error.message,
      };
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query(text, params);
  }
}
