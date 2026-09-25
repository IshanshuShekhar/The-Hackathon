import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  JourneyState,
  DiscrepancyItem,
  AgentEvent,
  ProfileFieldRecord,
  Provenance,
  Pathway,
} from '@educaro/shared';

interface JourneyContextType {
  journeyState: JourneyState | null;
  profileFields: Record<string, { value: string; provenance: Provenance; confidence?: number }>;
  agentEvents: AgentEvent[];
  inconsistencies: DiscrepancyItem[];
  entitlements: string[];
  loading: boolean;
  refreshJourney: () => Promise<void>;
  resolveDiscrepancy: (discrepancyId: string, resolvedValue: string) => Promise<void>;
  injectConflict: () => Promise<void>;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [profileFields, setProfileFields] = useState<Record<string, { value: string; provenance: Provenance; confidence?: number }>>({});
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const [inconsistencies, setInconsistencies] = useState<DiscrepancyItem[]>([]);
  const [entitlements, setEntitlements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshJourney = useCallback(async () => {
    if (!token && !user) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Journey State
      const stateRes = await fetch('/api/orchestrator/state', { headers });
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setJourneyState(stateData);
      }

      // 2. Fetch Candidate Details (Profile fields + Entitlements)
      const candRes = await fetch('/api/orchestrator/candidate-details', { headers });
      if (candRes.ok) {
        const candData = await candRes.json();
        const fMap: Record<string, { value: string; provenance: Provenance; confidence?: number }> = {};
        for (const f of candData.fields || []) {
          fMap[f.fieldKey] = {
            value: f.value,
            provenance: f.provenance,
            confidence: f.confidence,
          };
        }
        setProfileFields(fMap);

        const entList = (candData.entitlements || []).map((e: any) => e.feature_key);
        setEntitlements(entList);
      }

      // 3. Fetch Inconsistencies
      const incRes = await fetch('/api/consistency/check', { headers });
      if (incRes.ok) {
        const incData = await incRes.json();
        setInconsistencies(incData.discrepancies || []);
      }

      // 4. Fetch Agent Trace Events
      const traceRes = await fetch('/api/agent-trace', { headers });
      if (traceRes.ok) {
        const traceData = await traceRes.json();
        setAgentEvents(traceData.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh journey state:', err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      refreshJourney();
    }
  }, [token, refreshJourney]);

  const resolveDiscrepancy = async (discrepancyId: string, resolvedValue: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/consistency/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ discrepancyId, resolvedValue }),
      });
      if (res.ok) {
        await refreshJourney();
      }
    } catch (err) {
      console.error('Failed to resolve discrepancy:', err);
    }
  };

  const injectConflict = async () => {
    if (!token) return;
    try {
      await fetch('/api/consistency/inject-demo-conflict', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshJourney();
    } catch (err) {
      console.error('Failed to inject conflict:', err);
    }
  };

  return (
    <JourneyContext.Provider
      value={{
        journeyState,
        profileFields,
        agentEvents,
        inconsistencies,
        entitlements,
        loading,
        refreshJourney,
        resolveDiscrepancy,
        injectConflict,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourney must be used within JourneyProvider');
  return context;
};
