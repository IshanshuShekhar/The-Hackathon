/**
 * Hard Rule 3: Every agent action must be logged to an agent_events table
 * (agent, tool, input, output, timestamp) for the "What the AI did" trace panel.
 */
export interface AgentEvent {
  id: string;
  applicantId?: string;
  agent: string;          // e.g. 'Orchestrator', 'IntakeAgent', 'DocumentAgent', 'ValidationAgent'
  tool: string;           // e.g. 'getProfile', 'updateField', 'extractDocument', 'runValidation'
  reason?: string;        // Human-readable rationale for the tool call
  input: Record<string, unknown> | unknown;
  output: Record<string, unknown> | unknown;
  confidence?: number;
  durationMs?: number;
  timestamp: string;      // ISO 8601
}

export type CreateAgentEventDto = Omit<AgentEvent, 'id' | 'timestamp'>;
