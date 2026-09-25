import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@educaro/shared';
import { Mail, Lock, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, sendOtp, verifyOtp, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialEmail = searchParams.get('email') || '';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      setInfoMsg(`A 6-digit one-time code has been sent to ${email}`);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
        setOtpCode(res.debugOtp); // auto-fill for demo speed
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyOtp(email, otpCode);
      // PRD Section 8.2 #3: On successful signup or login, taken directly to Goal Intake!
      navigate('/journey/goal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'signup') {
        await register(email, password, UserRole.APPLICANT, true);
      } else {
        await login(email, password);
      }
      navigate('/journey/goal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoApplicant = async () => {
    setLoading(true);
    try {
      await demoLogin(UserRole.APPLICANT);
      navigate('/journey/goal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#71808A] hover:text-[#344653] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#5F7D8B] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm mb-3">
            ER
          </div>
          <h2 className="text-2xl font-extrabold text-[#344653] tracking-tight">
            {mode === 'signup' ? 'Begin Your Germany Journey' : 'Welcome Back to EduRoute AI'}
          </h2>
          <p className="text-xs text-[#71808A] mt-1">
            {mode === 'signup'
              ? 'Create your applicant profile and discover your optimal pathway to Germany'
              : 'Sign in to resume your verified applicant profile & qualification status'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-8 shadow-sm space-y-5">
          
          {/* Toggle between OTP and Password */}
          <div className="flex rounded-xl bg-[#E8ECE5] p-1 border border-[#DCE2DC]">
            <button
              type="button"
              onClick={() => { setAuthMethod('OTP'); setOtpSent(false); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                authMethod === 'OTP' ? 'bg-[#5F7D8B] text-white shadow-xs' : 'text-[#71808A] hover:text-[#344653]'
              }`}
            >
              Email + Instant OTP
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('PASSWORD')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                authMethod === 'PASSWORD' ? 'bg-[#5F7D8B] text-white shadow-xs' : 'text-[#71808A] hover:text-[#344653]'
              }`}
            >
              Password
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              {infoMsg}
            </div>
          )}

          {/* OTP Authentication Flow */}
          {authMethod === 'OTP' ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#344653] block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71808A]" />
                    <input
                      type="email"
                      required
                      placeholder="applicant@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] placeholder:text-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                >
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP →'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-semibold text-[#344653]">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#718C9B] hover:underline text-[11px]"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71808A]" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-center font-mono tracking-widest text-base font-bold text-[#344653] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
                    />
                  </div>
                </div>

                {debugOtp && (
                  <div className="p-2 rounded-lg bg-[#E5EDF0] border border-[#DCE2DC] text-[11px] text-[#344653] flex items-center justify-between">
                    <span>Demo Auto-code: <strong>{debugOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="text-[#5F7D8B] font-semibold underline"
                    >
                      Use code
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Goal Intake →'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )
          ) : (
            /* Password Authentication Flow */
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344653] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71808A]" />
                  <input
                    type="email"
                    required
                    placeholder="applicant@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] placeholder:text-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344653] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71808A]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] placeholder:text-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <span>{loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account & Start →' : 'Sign In & Resume →'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle between Sign Up and Sign In */}
          <div className="pt-2 text-center text-xs text-[#71808A]">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setInfoMsg(''); }}
                  className="font-bold text-[#5F7D8B] hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(''); setInfoMsg(''); }}
                  className="font-bold text-[#5F7D8B] hover:underline"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-[#DCE2DC] text-center">
            <button
              type="button"
              onClick={handleQuickDemoApplicant}
              className="inline-flex items-center gap-1.5 text-xs text-[#718C9B] hover:text-[#344653] font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click Demo Applicant Login</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
