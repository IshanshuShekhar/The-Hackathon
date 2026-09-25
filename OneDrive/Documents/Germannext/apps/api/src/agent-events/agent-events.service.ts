import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AgentEvent, CreateAgentEventDto } from '@educaro/shared';
import * as crypto from 'crypto';

@Injectable()
export class AgentEventsService {
  private readonly logger = new Logger(AgentEventsService.name);

  constructor(private readonly db: DatabaseService) {}

  async logEvent(dto: CreateAgentEventDto & { userId?: string }): Promise<AgentEvent> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const inputStr = typeof dto.input === 'string' ? dto.input : JSON.stringify(dto.input);
    const outputStr = typeof dto.output === 'string' ? dto.output : JSON.stringify(dto.output);

    try {
      await this.db.query(
        `INSERT INTO agent_events (id, user_id, agent, tool, reason, input, output, confidence, duration_ms, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          dto.userId || null,
          dto.agent,
          dto.tool,
          dto.reason || null,
          inputStr,
          outputStr,
          dto.confidence ?? null,
          dto.durationMs ?? null,
          timestamp,
        ]
      );

      this.logger.log(`[AgentEvent] ${dto.agent} -> ${dto.tool} logged (${dto.durationMs ?? 0}ms)`);
    } catch (err: any) {
      this.logger.error(`Failed to log agent event: ${err.message}`);
    }

    return {
      id,
      applicantId: dto.userId,
      agent: dto.agent,
      tool: dto.tool,
      reason: dto.reason,
      input: dto.input,
      output: dto.output,
      confidence: dto.confidence,
      durationMs: dto.durationMs,
      timestamp,
    };
  }

  async getEvents(userId?: string): Promise<AgentEvent[]> {
    let query = 'SELECT * FROM agent_events ORDER BY timestamp DESC LIMIT 100';
    let params: any[] = [];

    if (userId) {
      query = 'SELECT * FROM agent_events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100';
      params = [userId];
    }

    const res = await this.db.query(query, params);
    return res.rows.map((r: any) => ({
      id: r.id,
      applicantId: r.user_id,
      agent: r.agent,
      tool: r.tool,
      reason: r.reason,
      input: safeJsonParse(r.input),
      output: safeJsonParse(r.output),
      confidence: r.confidence,
      durationMs: r.duration_ms,
      timestamp: r.timestamp,
    }));
  }
}

function safeJsonParse(val: string): any {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}
