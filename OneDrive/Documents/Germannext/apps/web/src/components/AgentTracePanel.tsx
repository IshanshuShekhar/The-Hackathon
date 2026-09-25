import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import { X, Activity, ChevronDown, ChevronRight, Clock, CheckCircle, Terminal } from 'lucide-react';
import { AgentEvent } from '@educaro/shared';

interface AgentTracePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentTracePanel: React.FC<AgentTracePanelProps> = ({ isOpen, onClose }) => {
  const { agentEvents, refreshJourney } = useJourney();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAgentColor = (agent: string) => {
    if (agent.includes('Intake')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (agent.includes('Extraction')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (agent.includes('Consistency')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (agent.includes('Qualification')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (agent.includes('CV')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-[#E5EDF0] text-[#344653] border-[#DCE2DC]';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#F5F5EF] shadow-2xl border-l border-[#DCE2DC] flex flex-col transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 bg-[#EEF1EB] border-b border-[#DCE2DC] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5F7D8B] text-white flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#344653] flex items-center gap-2">
              Agent Orchestration Trace
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#E5EDF0] text-[#71808A] border border-[#DCE2DC]">
                Live Feed
              </span>
            </h2>
            <p className="text-[11px] text-[#71808A]">Real-time audit log of agent calls and tool invocations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshJourney}
            className="p-1.5 text-xs text-[#71808A] hover:text-[#344653] hover:bg-[#E8ECE5] rounded transition-colors"
            title="Refresh events"
          >
            Refresh
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71808A] hover:text-[#344653] hover:bg-[#E8ECE5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agentEvents.length === 0 ? (
          <div className="p-8 text-center text-[#71808A] text-sm">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No agent actions recorded yet.</p>
            <p className="text-xs mt-1">Actions performed by Intake, Extraction, Consistency, and Qualification agents will appear here live.</p>
          </div>
        ) : (
          agentEvents.map((evt) => {
            const isExpanded = expandedId === evt.id;
            return (
              <div
                key={evt.id}
                className="bg-[#EEF1EB] rounded-xl border border-[#DCE2DC] p-3 text-xs shadow-xs transition-all hover:border-[#718C9B]"
              >
                {/* Event Top Bar */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(evt.id)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-semibold border text-[11px] ${getAgentColor(evt.agent)}`}>
                      {evt.agent}
                    </span>
                    <span className="text-[#71808A] font-mono">→</span>
                    <span className="font-mono text-[#344653] font-medium bg-[#E5EDF0] px-1.5 py-0.5 rounded text-[11px]">
                      {evt.tool}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71808A]">
                    {evt.durationMs !== undefined && (
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        {evt.durationMs}ms
                      </span>
                    )}
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Reason / Why */}
                {evt.reason && (
                  <div className="mt-2 text-[#344653] text-[12px] bg-[#F5F5EF] p-2 rounded-lg border border-[#DCE2DC]/60">
                    <span className="font-semibold text-[#71808A] text-[10px] uppercase tracking-wider block mb-0.5">
                      Agent Rationale / Why:
                    </span>
                    {evt.reason}
                  </div>
                )}

                {/* Confidence */}
                {evt.confidence !== undefined && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#71808A]">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Confidence: {(evt.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px]">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Expanded Details: Input & Output */}
                {isExpanded && (
                  <div className="mt-3 pt-2 border-t border-[#DCE2DC] space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[#71808A] font-semibold text-[10px] uppercase">Input Payload:</span>
                      <pre className="mt-1 p-2 rounded bg-[#E8ECE5] text-[#344653] overflow-x-auto whitespace-pre-wrap">
                        {typeof evt.input === 'string' ? evt.input : JSON.stringify(evt.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[#71808A] font-semibold text-[10px] uppercase">Output Result:</span>
                      <pre className="mt-1 p-2 rounded bg-[#E8ECE5] text-[#344653] overflow-x-auto whitespace-pre-wrap">
                        {typeof evt.output === 'string' ? evt.output : JSON.stringify(evt.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#EEF1EB] border-t border-[#DCE2DC] text-center text-[11px] text-[#71808A]">
        Every state change is audited & strictly labeled with provenance
      </div>
    </div>
  );
};
