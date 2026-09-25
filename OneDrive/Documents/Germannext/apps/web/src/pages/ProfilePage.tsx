import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Provenance, ProfileFieldRecord, PROVENANCE_LABELS } from '@educaro/shared';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import {
  User,
  Shield,
  Edit2,
  Check,
  X,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [fields, setFields] = useState<ProfileFieldRecord[]>([]);
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Hard Rule 1 live demo simulation message
  const [ruleTestFeedback, setRuleTestFeedback] = useState<{
    type: 'success' | 'security_rejection';
    message: string;
    details?: string;
  } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const json = await res.json();
      setFields(json.data.fields || []);
      setCompletenessScore(json.data.completenessScore || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleStartEdit = (field: ProfileFieldRecord) => {
    setEditingFieldKey(field.fieldKey);
    setEditValue(field.value);
  };

  const handleCancelEdit = () => {
    setEditingFieldKey(null);
    setEditValue('');
  };

  const handleSaveField = async (category: string, fieldKey: string) => {
    setSavingKey(fieldKey);
    setError(null);
    try {
      const res = await fetch('/api/profile/field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          fieldKey,
          value: editValue,
          provenance: Provenance.APPLICANT_PROVIDED,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to update field');
      }

      await fetchProfile();
      setEditingFieldKey(null);
      setEditValue('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  // Test Hard Rule 1: AI writing path attempting to write VERIFIED (Must be rejected with 403)
  const testHardRule1Rejection = async () => {
    setRuleTestFeedback(null);
    try {
      const res = await fetch('/api/profile/field/ai-upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'education',
          fieldKey: 'highestDegree',
          value: 'Master in Quantum Computing (Unauthorized Verification)',
          provenance: Provenance.VERIFIED, // Strictly forbidden for AI path!
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Expected 403 Forbidden!
        setRuleTestFeedback({
          type: 'security_rejection',
          message: 'Hard Rule 1 Write Guard Enforced: Server rejected AI attempt to set VERIFIED!',
          details: `HTTP ${res.status}: ${data.message || JSON.stringify(data)}`,
        });
      } else {
        setRuleTestFeedback({
          type: 'success',
          message: 'Warning: Field was accepted (Write guard may not have triggered)',
        });
      }
    } catch (err: any) {
      setRuleTestFeedback({
        type: 'security_rejection',
        message: 'Security Rejection Triggered: ' + err.message,
      });
    }
  };

  // Test AI extraction: AI writing path setting AI_EXTRACTED with confidence (Allowed)
  const testAIExtraction = async () => {
    setRuleTestFeedback(null);
    try {
      const res = await fetch('/api/profile/field/ai-upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'education',
          fieldKey: 'highestDegree',
          value: 'B.Tech in Information Technology',
          provenance: Provenance.AI_EXTRACTED,
          confidence: 0.94,
          sourceDocumentId: 'degree_certificate_scan.pdf',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message);
      }

      await fetchProfile();
      setRuleTestFeedback({
        type: 'success',
        message: 'AI Extracted field successfully saved with AI_EXTRACTED provenance & 94% confidence bar!',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            E
          </div>
          <div>
            <h1 className="text-base font-semibold text-white flex items-center gap-2">
              Educaro Profile Dashboard
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                Phase 1 Active
              </span>
            </h1>
            <p className="text-xs text-slate-400">Authenticated as {user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
            Role: {user?.role}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold">Notice</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Live Rule Guard Demonstration Banner */}
        {ruleTestFeedback && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-3 border transition-all ${
              ruleTestFeedback.type === 'security_rejection'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
            }`}
          >
            {ruleTestFeedback.type === 'security_rejection' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-sm">{ruleTestFeedback.message}</div>
              {ruleTestFeedback.details && (
                <div className="font-mono text-[11px] opacity-80">{ruleTestFeedback.details}</div>
              )}
            </div>
          </div>
        )}

        {/* Completeness & Provenance Overview Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Applicant Profile with Field-Level Provenance
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                PRD Section 4 & BUILD_GUIDE Section 4: Every single profile attribute is stamped with provenance.
              </p>
            </div>

            {/* Completeness Gauge */}
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Profile Completeness</div>
                <div className="text-base font-bold text-emerald-400">{completenessScore}%</div>
              </div>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Provenance Badges Legend */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs font-medium text-slate-300 mb-2">Provenance Badge System:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              {Object.values(Provenance).map((prov) => (
                <div key={prov} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                  <ProvenanceBadge provenance={prov} />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    {PROVENANCE_LABELS[prov].description.slice(0, 32)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Toolbar for Testing */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div className="text-slate-400 font-medium">Interactive Hard Rule 1 & 3 Tests:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testHardRule1Rejection}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Test Hard Rule 1 (AI Attempting VERIFIED)
            </button>
            <button
              onClick={testAIExtraction}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg font-medium transition flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              Simulate AI Extraction (94% Conf)
            </button>
            <button
              onClick={fetchProfile}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Profile Fields List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Your Profile Fields (Click 'Edit' to test provenance update)</h3>
            <span className="text-xs text-slate-400">{fields.length} attributes stored</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading profile fields...</div>
          ) : fields.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No fields found.</div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {fields.map((field) => {
                const isEditing = editingFieldKey === field.fieldKey;
                const isSaving = savingKey === field.fieldKey;

                return (
                  <div key={field.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300 font-mono">
                          {field.fieldKey}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {field.category}
                        </span>
                        <ProvenanceBadge
                          provenance={field.provenance}
                          confidence={field.confidence ?? undefined}
                        />
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-slate-950 border border-blue-500 rounded px-3 py-1.5 text-sm text-white w-full sm:w-96 focus:outline-none"
                            placeholder="Enter new value"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveField(field.category, field.fieldKey)}
                            disabled={isSaving}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition flex items-center gap-1 font-medium"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-100 font-medium">{field.value || '<Not specified>'}</p>
                      )}

                      <div className="text-[10px] text-slate-500">
                        Last updated: {new Date(field.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(field)}
                        className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700/80"
                      >
                        <Edit2 className="w-3 h-3 text-blue-400" />
                        <span>Edit Field</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
