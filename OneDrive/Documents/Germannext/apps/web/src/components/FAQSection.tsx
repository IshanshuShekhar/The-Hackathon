import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: 'Who is EduRoute AI for?',
    answer: 'Applicants from India exploring study, vocational training (Ausbildung), or direct employment opportunities in Germany.',
  },
  {
    id: 2,
    question: 'Do I need to know German to start?',
    answer: 'No. You can start your profile in English or Hindi. If your German level is weak or missing, we\'ll show a guided learning path with tutorial videos and a readiness estimate instead of blocking you.',
  },
  {
    id: 3,
    question: 'What documents do I need to upload?',
    answer: 'Degrees, mark sheets, experience letters, German language certificates (e.g. Goethe, TestDaF), and your existing CV (if you have one) — you can add these progressively, not all at once.',
  },
  {
    id: 4,
    question: 'Will the AI make up information about me?',
    answer: 'No. Every field in your profile is labeled as Verified, Applicant-provided, AI-extracted, or AI-generated, so you always know what came from where. Extracted document data is shown side-by-side with the source for you to confirm.',
  },
  {
    id: 5,
    question: 'What happens if my documents have conflicting information?',
    answer: 'The system detects inconsistencies (e.g. mismatched graduation dates or names) automatically and asks you a clarifying question rather than guessing or guessing incorrectly.',
  },
  {
    id: 6,
    question: 'How do I know if I qualify?',
    answer: 'After your profile is complete, you\'ll get a clear qualification outcome evaluated by our deterministic rules engine plus a list of any outstanding requirements — not just a vague yes/no.',
  },
  {
    id: 7,
    question: 'What is the "next best action"?',
    answer: 'At every stage, your dashboard shows the single most useful thing to do next (e.g. "Upload your German language certificate") so you\'re never guessing what\'s left.',
  },
  {
    id: 71,
    question: "How does EduRoute AI decide what I should do next?",
    answer: "Your Recommendations dashboard looks at your actual profile — pathway, documents, qualification status, language levels, and progress so far — and prioritizes what's missing as Required, Important, or Recommended. Every recommendation has a \"Why this recommendation?\" explanation so you can see exactly what it's based on, not just a black-box suggestion.",
  },
  {
    id: 72,
    question: "Do recommendations change if my situation changes?",
    answer: "Yes. As soon as you upload a document, resolve a conflict, or update your profile, your recommendations and readiness scores recalculate automatically — you'll never see stale advice.",
  },
  {
    id: 8,
    question: 'Do I need to pay to use EduRoute AI?',
    answer: 'Building your profile and getting your qualification outcome is completely free. Optional paid add-ons (e.g. priority consultant review, expedited APS filing) can be unlocked via UPI or QR code payment.',
  },
  {
    id: 81,
    question: "What's included in Premium?",
    answer: "Educaro Premium bundles everything in one plan: 1-on-1 Consultant Support, extended German learning modules beyond the free readiness path, priority document review with faster turnaround, and any other resources marked Premium as they're added. All of it unlocks with a single payment — no separate purchases per feature.",
  },
  {
    id: 9,
    question: 'If I pay for a service, will I lose access after logging out?',
    answer: 'No. Anything you\'ve paid for stays permanently linked to your account in our database and is available whenever you log back in, on any device.',
  },
  {
    id: 10,
    question: 'Can a real consultant help me?',
    answer: 'Yes — you can request a referral to an Educaro consultant at any point, and they\'ll see your full profile, AI consultant summary, and lead score so you don\'t have to repeat yourself.',
  },
  {
    id: 11,
    question: 'Is my data safe?',
    answer: 'Your documents and personal data are handled securely and only used to build your applicant profile and assess your Germany eligibility in compliance with data privacy standards.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1); // first item open by default

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-[#E8ECE5] border-t border-[#DCE2DC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#344653] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#71808A] mt-2">
            Everything you need to know about navigating your study, Ausbildung, and career journey to Germany with Educaro.
          </p>
        </div>

        {/* Accordion (Single-Open per PRD Section 10) */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-[#EEF1EB] rounded-2xl border border-[#DCE2DC] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#E5EDF0]/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#344653]">
                    {item.id}. {item.question}
                  </span>
                  <div className={`p-1 rounded-full bg-[#E5EDF0] text-[#718C9B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#71808A] leading-relaxed border-t border-[#DCE2DC]/60 animate-in fade-in duration-200">
                    <p className="bg-[#F5F5EF] p-4 rounded-xl border border-[#DCE2DC]/50 text-[#344653]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
