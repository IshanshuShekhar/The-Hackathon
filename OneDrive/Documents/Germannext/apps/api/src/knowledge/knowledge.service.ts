import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeEntry {
  id: string;
  category: string;
  fact: string;
  amount: number | null;
  source_url: string;
  last_verified: string;
}

/**
 * ⚠️ IMPORTANT DISCLAIMER:
 * Do not treat any of the numeric values (thresholds, costs, etc.) in the Knowledge Base as permanent.
 * They represent 2026 snapshots (e.g. EU Blue Card thresholds, student blocked account limits) 
 * and change periodically. They must be reviewed and verified regularly.
 */
@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly filePath = path.join(process.cwd(), 'content', 'germany-knowledge-base.json');

  async getKnowledgeBase(): Promise<KnowledgeEntry[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      this.logger.error('Failed to read knowledge base', err);
      return [];
    }
  }

  async updateKnowledgeBase(entries: KnowledgeEntry[]): Promise<KnowledgeEntry[]> {
    try {
      // Ensure the content directory exists
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2), 'utf8');
      return entries;
    } catch (err) {
      this.logger.error('Failed to write knowledge base', err);
      throw new Error('Could not update knowledge base');
    }
  }
}
