import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StepHeader } from '../../components/StepHeader';
import { AgentTracePanel } from '../../components/AgentTracePanel';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { Pathway } from '@educaro/shared';
import { GraduationCap, Wrench, Briefcase, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const GoalIntakePage: React.FC = () => {
  const { user, token } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();
  const [selectedPathway, setSelectedPathway] = useState<Pathway>(Pathway.STUDY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const pathways = [
    {
      id: Pathway.STUDY,
      title: 'University Study (Master’s / Bachelor’s)',
      subtitle: 'Higher Education in Germany',
      description: 'Pursue state-accredited Bachelor or Master degree programs at German public universities. Low to zero tuition fees with high research standards.',
      icon: GraduationCap,
      highlights: ['Direct admission with recognized degree', 'English & German taught programs', '18-month post-study work visa'],
      minGerman: 'English C1 or German B2/C1',
    },
    {
      id: Pathway.AUSBILDUNG,
      title: 'Dual Vocational Training (Ausbildung)',
      subtitle: 'Paid Apprenticeship + Classroom Training',
      description: 'Combine hands-on paid company training with vocational schooling in IT, Nursing, Mechatronics, or Hotel Management. Earn a monthly stipend from Day 1.',
      icon: Wrench,
      highlights: ['Earn ~€950–€1,400 monthly stipend', 'Guaranteed employer placement', 'Full residency qualification'],
      minGerman: 'Minimum German B1 required',
    },
    {
      id: Pathway.EMPLOYMENT,
      title: 'Direct Employment / EU Blue Card',
      subtitle: 'Skilled Work & Opportunity Card',
      description: 'For experienced Indian graduates looking for direct tech, engineering, healthcare, or shortage occupation positions with German employers.',
      icon: Briefcase,
      highlights: ['EU Blue Card fast-track to PR in 21 months', 'Chancenkarte points system', 'Family reunification rights'],
      minGerman: 'German A2–B1 or English C1',
    },
  ];

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      if (token) {
        await fetch('/api/intake/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            step: 'GOAL',
            message: selectedPathway,
            language: 'en',
          }),
        });
        await refreshJourney();
      }
      navigate('/journey/details');
    } catch (err) {
      console.error('Failed to save pathway goal:', err);
      navigate('/journey/details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />
      
      <StepHeader
        currentStepIndex={1}
        totalSteps={7}
        stepTitle="Goal Intake"
        stepSubtitle="Select your target pathway to Germany so our Intake Agent tailors requirements"
        nextRoute="/journey/details"
        onContinue={handleContinue}
        continueLabel={isSubmitting ? 'Saving Goal...' : 'Confirm Goal & Continue →'}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1: Define Your Pathway</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344653] tracking-tight">
            What is your primary goal in Germany?
          </h2>
          <p className="text-xs sm:text-sm text-[#71808A] mt-2">
            Educaro provides specialized immigration guidance, university matching, and dual employer contracts across three pathways.
          </p>
        </div>

        {/* Pathway Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {pathways.map((item) => {
            const isSelected = selectedPathway === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPathway(item.id)}
                className={`rounded-3xl border p-6 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#EEF1EB] border-[#5F7D8B] shadow-md ring-2 ring-[#5F7D8B]/20 transform -translate-y-1'
                    : 'bg-[#EEF1EB] border-[#DCE2DC] hover:border-[#718C9B] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-colors ${
                      isSelected ? 'bg-[#5F7D8B] text-white' : 'bg-[#E5EDF0] text-[#718C9B]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-[#5F7D8B] text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border border-[#DCE2DC] bg-[#F5F5EF]" />
                    )}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B] block mb-1">
                    {item.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-[#344653] leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#71808A] leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#DCE2DC]">
                    {item.highlights.map((hl, i) => (
                      <div key={i} className="text-[11px] text-[#344653] flex items-center gap-1.5">
                        <span className="text-[#5F7D8B] font-bold">✓</span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#DCE2DC] flex items-center justify-between text-[11px]">
                  <span className="text-[#71808A]">Language:</span>
                  <span className="font-semibold text-[#344653]">{item.minGerman}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#E8ECE5] rounded-2xl border border-[#DCE2DC] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#344653]">Selected Pathway: {selectedPathway}</h4>
            <p className="text-xs text-[#71808A] mt-0.5">
              Next: Our Intake Agent will collect your personal details, degree, and skills through an interactive chat.
            </p>
          </div>
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>{isSubmitting ? 'Saving Goal...' : 'Continue to Profile Chat →'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
