import React, { useState } from 'react';
import { GermanReadinessTrack as GermanTrackType } from '@educaro/shared';
import { BookOpen, Clock, PlayCircle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface GermanReadinessTrackProps {
  track: GermanTrackType;
}

export const GermanReadinessTrack: React.FC<GermanReadinessTrackProps> = ({ track }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="bg-[#EEF1EB] rounded-2xl border border-[#DCE2DC] p-6 shadow-xs">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[#DCE2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              Learning-Readiness Path
            </span>
            <span className="text-xs text-[#71808A]">No Disqualification</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#344653]">
            {track.readinessHeadline}
          </h3>
          <p className="text-xs text-[#71808A] mt-0.5">
            Curated preparation path designed specifically for Indian applicants pursuing Germany.
          </p>
        </div>

        {/* Readiness Pill */}
        <div className="bg-[#F5F5EF] p-3 rounded-xl border border-[#DCE2DC] flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#5F7D8B] text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71808A] block">
              Estimated Readiness
            </span>
            <span className="text-sm font-extrabold text-[#344653]">
              ~{track.estimatedMonthsToTarget} Months
            </span>
            <span className="text-[10px] text-[#718C9B] block">at 10-12 hrs/week</span>
          </div>
        </div>
      </div>

      {/* Embedded Video Player Modal or In-line Preview */}
      {activeVideo && (
        <div className="mb-6 p-4 bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#344653]">Video Tutorial Preview</span>
            <button
              onClick={() => setActiveVideo(null)}
              className="text-xs text-[#71808A] hover:text-[#344653]"
            >
              Close Video ✕
            </button>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/90">
            <iframe
              src={activeVideo}
              title="Educaro German Learning Track"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Tutorial Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {track.tutorialModules.map((mod) => (
          <div
            key={mod.id}
            className="bg-[#F5F5EF] rounded-xl border border-[#DCE2DC] p-4 flex flex-col justify-between hover:border-[#718C9B] transition-all shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold px-2 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B]">
                  {mod.level}
                </span>
                <span className="text-[#71808A] font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mod.duration}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#344653] leading-snug mb-1">
                {mod.title}
              </h4>
              <p className="text-[11px] text-[#71808A] leading-relaxed">
                {mod.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DCE2DC]/60 flex items-center justify-between">
              <button
                onClick={() => setActiveVideo(mod.videoUrl)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5F7D8B] hover:text-[#4e6773]"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Watch Lesson</span>
              </button>
              <span className="text-[10px] text-[#71808A]">Free Module</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3.5 bg-[#E5EDF0] rounded-xl border border-[#DCE2DC] text-xs text-[#344653] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#718C9B] shrink-0" />
        <span>
          <strong>Educaro Promise:</strong> You are not disqualified due to beginner German. Completing these modules unlocks our partner university intake matching.
        </span>
      </div>

    </div>
  );
};
