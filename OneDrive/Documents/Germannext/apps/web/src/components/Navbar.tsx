import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { Activity, User, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onToggleTracePanel?: () => void;
  isTraceOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleTracePanel, isTraceOpen }) => {
  const { user, logout } = useAuth();
  const { entitlements } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();

  const isPriorityUnlocked = entitlements.includes('PRIORITY_APS_CONSULTANT_REVIEW');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 relative isolate w-full bg-[#F5F5EF]/90 backdrop-blur-md border-b border-[#DCE2DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#5F7D8B] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-[#4e6773] transition-colors">
            ER
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-[#344653]">
                EduRoute AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5EDF0] text-[#71808A] font-medium border border-[#DCE2DC]">
                Educaro 🇩🇪🇮🇳
              </span>
            </div>
            <p className="text-[11px] text-[#71808A] hidden sm:block">Agentic Applicant Journey to Germany</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 min-w-0 overflow-x-hidden text-sm font-medium text-[#71808A]">
          <Link
            to="/"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/' ? 'text-[#344653] font-semibold' : ''}`}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="transition-colors hover:text-[#344653]"
          >
            How It Works
          </a>
          <Link
            to="/journey/goal"
            className={`transition-colors hover:text-[#344653] ${location.pathname.startsWith('/journey') ? 'text-[#344653] font-semibold' : ''}`}
          >
            Your Journey
          </Link>
          <Link
            to="/journey/recommendations"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/journey/recommendations' ? 'text-[#344653] font-semibold' : ''}`}
          >
            Action Plan
          </Link>
          <Link
            to="/journey/documents"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/journey/documents' ? 'text-[#344653] font-semibold' : ''}`}
          >
            Documents
          </Link>
          <Link
            to="/journey/qualification"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/journey/qualification' ? 'text-[#344653] font-semibold' : ''}`}
          >
            Qualification
          </Link>
          <Link
            to="/learning-path"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/learning-path' ? 'text-[#344653] font-semibold' : ''}`}
          >
            German Path
          </Link>
          <Link
            to="/candidate-details"
            className={`transition-colors hover:text-[#344653] ${location.pathname === '/candidate-details' ? 'text-[#344653] font-semibold' : ''}`}
          >
            Candidate Details
          </Link>
          <a
            href="/#faq"
            className="transition-colors hover:text-[#344653]"
          >
            FAQ
          </a>
        </nav>

        {/* Right Auth Entry Points (PRD Section 9.1 & Section 8.2) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Agent Trace Toggle */}
          {onToggleTracePanel && (
            <button
              onClick={onToggleTracePanel}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                isTraceOpen
                  ? 'bg-[#5F7D8B] text-white border-[#5F7D8B]'
                  : 'bg-[#EEF1EB] text-[#344653] border-[#DCE2DC] hover:bg-[#E5EDF0]'
              }`}
              title="Live agent actions & tool trace"
            >
              <Activity className="w-3.5 h-3.5 text-[#718C9B]" />
              <span className="font-medium hidden sm:inline">Agent Trace</span>
            </button>
          )}

          {isPriorityUnlocked && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Priority APS Unlocked</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/candidate-details"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF1EB] hover:bg-[#E5EDF0] border border-[#DCE2DC] text-xs text-[#344653] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#718C9B]" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-[#71808A] hover:text-[#344653] hover:bg-[#EEF1EB] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth?mode=login"
              className="text-sm font-medium text-[#344653] hover:text-[#718C9B] px-3 py-1.5 rounded-full hover:bg-[#EEF1EB] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
