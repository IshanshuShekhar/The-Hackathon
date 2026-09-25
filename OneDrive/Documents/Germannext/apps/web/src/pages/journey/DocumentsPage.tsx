import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StepHeader } from '../../components/StepHeader';
import { SideBySideReview } from '../../components/SideBySideReview';
import { InconsistencyDialog } from '../../components/InconsistencyDialog';
import { AgentTracePanel } from '../../components/AgentTracePanel';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { ExtractedDocument, DiscrepancyItem, DocumentType } from '@educaro/shared';
import {
  Upload,
  FileCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user, token } = useAuth();
  const { inconsistencies, resolveDiscrepancy, refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeConflict, setActiveConflict] = useState<DiscrepancyItem | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  // Load existing documents
  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/extraction/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const docs = await res.json();
        setDocuments(docs);
        if (docs.length > 0 && !selectedDocId) {
          setSelectedDocId(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadDocuments();
    }
  }, [token]);

  // Check inconsistencies
  useEffect(() => {
    if (inconsistencies && inconsistencies.length > 0) {
      setActiveConflict(inconsistencies[0]);
    } else {
      setActiveConflict(null);
    }
  }, [inconsistencies]);

  const handleSimulatedUpload = async (
    docType: DocumentType,
    sampleId: 'degree_standard' | 'degree_conflict' | 'language_b1' | 'language_a2' | 'passport_standard' | 'visa_standard',
    filename: string
  ) => {
    setIsUploading(true);
    try {
      const res = await fetch('/api/extraction/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: docType,
          filename,
          simulatedSampleId: sampleId,
        }),
      });

      if (res.ok) {
        const newDoc: ExtractedDocument = await res.json();
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
        setSelectedDocId(newDoc.id);
        await refreshJourney();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmField = async (docId: string, fieldKey: string, confirmedValue?: string) => {
    try {
      await fetch('/api/extraction/confirm-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ docId, fieldKey, confirmedValue }),
      });
      await refreshJourney();
    } catch (err) {
      console.error('Failed to confirm field:', err);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Document checklist categories
  const checklistCategories = [
    {
      type: 'DEGREE_CERTIFICATE' as DocumentType,
      title: 'Degree Certificate',
      requirement: 'Required for University & APS verification',
      isOptional: false,
      sampleId: 'degree_standard' as const,
      sampleFile: 'Anna_University_Degree_2024.pdf',
    },
    {
      type: 'LANGUAGE_CERTIFICATE' as DocumentType,
      title: 'German Language Certificate',
      requirement: 'Goethe / TestDaF (Mandatory for Ausbildung, recommended for Study)',
      isOptional: false,
      sampleId: 'language_b1' as const,
      sampleFile: 'Goethe_Zertifikat_B1_Score.pdf',
    },
    {
      type: 'PASSPORT' as DocumentType,
      title: 'Passport (Identity Proof)',
      requirement: 'National Passport for German Visa Application',
      isOptional: true,
      sampleId: 'passport_standard' as const,
      sampleFile: 'Passport_India_Rahul_Sharma.pdf',
    },
    {
      type: 'VISA' as DocumentType,
      title: 'German / Schengen Visa',
      requirement: 'Previous or current visa stamp (if held)',
      isOptional: true,
      sampleId: 'visa_standard' as const,
      sampleFile: 'German_National_Visa_D.pdf',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      <StepHeader
        currentStepIndex={5}
        totalSteps={8}
        stepTitle="Document Upload & Extraction Review"
        stepSubtitle="Side-by-side verification: original certificate preview next to extracted fields with confidence scoring"
        backRoute="/journey/video"
        nextRoute="/journey/qualification"
        continueLabel="Proceed to Qualification →"
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Document Checklist & Verification Status */}
        <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DCE2DC]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                  Document Checklist & Status
                </span>
                <span className="text-xs text-[#71808A]">Step 5 of 8</span>
              </div>
              <h2 className="text-xl font-bold text-[#344653]">
                Application Credential Verification
              </h2>
              <p className="text-xs text-[#71808A] mt-0.5">
                Every category displays real-time status. Unuploaded documents show as "Not uploaded / Missing" until an actual file is received.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#71808A]">
              <span>Uploaded:</span>
              <span className="px-2.5 py-1 rounded-full bg-[#5F7D8B] text-white">
                {documents.length} / {checklistCategories.length}
              </span>
            </div>
          </div>

          {/* Checklist Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {checklistCategories.map((cat) => {
              const uploadedDoc = documents.find((d) => d.documentType === cat.type);
              const isUploaded = Boolean(uploadedDoc);

              return (
                <div
                  key={cat.type}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isUploaded
                      ? 'bg-[#F5F5EF] border-emerald-300 shadow-xs'
                      : 'bg-[#F5F5EF] border-[#DCE2DC]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B]">
                        {cat.isOptional ? 'Optional' : 'Required'}
                      </span>
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Extracted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Not uploaded / Missing</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#344653] leading-snug">
                        {cat.title}
                      </h4>
                      <p className="text-[11px] text-[#71808A] mt-0.5 leading-tight">
                        {cat.requirement}
                      </p>
                    </div>

                    {isUploaded && (
                      <p className="text-[11px] font-medium text-[#5F7D8B] truncate">
                        📄 {uploadedDoc?.filename}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCE2DC] flex items-center justify-between gap-2">
                    {isUploaded ? (
                      <button
                        onClick={() => setSelectedDocId(uploadedDoc!.id)}
                        className={`w-full py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedDoc?.id === uploadedDoc?.id
                            ? 'bg-[#5F7D8B] text-white'
                            : 'bg-[#E5EDF0] text-[#344653] hover:bg-[#DCE2DC]'
                        }`}
                      >
                        {selectedDoc?.id === uploadedDoc?.id ? 'Viewing in Split View' : 'Review Side-by-Side'}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleSimulatedUpload(cat.type, cat.sampleId, cat.sampleFile)
                        }
                        disabled={isUploading}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload {cat.title.split(' ')[0]}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Testing Triggers for Demo */}
          <div className="pt-3 border-t border-[#DCE2DC] flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[11px] text-[#71808A]">
              Demo Quick-Actions: Test edge cases and AI Consistency Agent
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  handleSimulatedUpload(
                    'DEGREE_CERTIFICATE',
                    'degree_conflict',
                    'Anna_University_Degree_Conflicting_2022.pdf'
                  )
                }
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-colors"
                title="Inject graduation year conflict (2022 vs 2024)"
              >
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Test Conflict Degree (Consistency Agent)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conflict Alert Banner if an inconsistency is detected */}
        {activeConflict && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                  Consistency Agent Conflict Detected: {activeConflict.fieldLabel}
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {activeConflict.sourceA.sourceName} says <strong>{activeConflict.sourceA.value}</strong>, while {activeConflict.sourceB.sourceName} states <strong>{activeConflict.sourceB.value}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveConflict(activeConflict)}
              className="px-4 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs shrink-0"
            >
              Resolve Discrepancy Live →
            </button>
          </div>
        )}

        {/* Document Selector Tabs if multiple documents uploaded */}
        {documents.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-[#71808A] uppercase tracking-wider mr-2">
              Viewing Document:
            </span>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  (selectedDocId === doc.id || (!selectedDocId && documents[0]?.id === doc.id))
                    ? 'bg-[#5F7D8B] text-white border-[#5F7D8B] shadow-xs'
                    : 'bg-[#EEF1EB] text-[#344653] border-[#DCE2DC] hover:bg-[#E8ECE5]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{doc.filename}</span>
              </button>
            ))}
          </div>
        )}

        {/* Side-by-Side Review Section (PRD Section 6 #3) */}
        {selectedDoc ? (
          <SideBySideReview
            document={selectedDoc}
            onConfirmField={handleConfirmField}
          />
        ) : (
          <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E5EDF0] text-[#718C9B] flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#344653]">No Documents Uploaded Yet</h3>
              <p className="text-xs text-[#71808A] max-w-md mx-auto mt-1">
                Click one of the buttons above to simulate uploading your Degree Certificate or Goethe German Language test score.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() =>
                  handleSimulatedUpload(
                    'DEGREE_CERTIFICATE',
                    'degree_standard',
                    'Anna_University_Degree_2024.pdf'
                  )
                }
                className="px-5 py-2.5 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs font-semibold"
              >
                Quick Upload Sample Degree Certificate
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Prompt */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DCE2DC]">
          <button
            onClick={() => navigate('/journey/chat')}
            className="text-xs text-[#71808A] hover:text-[#344653] font-medium"
          >
            ← Back to Profile Chat
          </button>
          <button
            onClick={() => navigate('/journey/qualification')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <span>Proceed to Qualification Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* Inconsistency Clarification Modal */}
      {activeConflict && (
        <InconsistencyDialog
          discrepancy={activeConflict}
          onResolve={async (id, val) => {
            await resolveDiscrepancy(id, val);
            setActiveConflict(null);
          }}
          onClose={() => setActiveConflict(null)}
        />
      )}

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
