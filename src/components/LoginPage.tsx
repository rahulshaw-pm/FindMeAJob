import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  Calendar,
  FileText,
  MessageSquareText,
} from 'lucide-react';
import { CompanyMark } from './CompanyMark';
import { ScreenMode, ScreenModeToggle } from './ScreenModeToggle';

interface LoginPageProps {
  onSignIn: (
    email: string,
    password: string,
    remember: boolean
  ) => { ok: true } | { ok: false; error: string };
  onRegister: (
    name: string,
    email: string,
    password: string,
    remember: boolean
  ) => { ok: true } | { ok: false; error: string };
  onDemoSignIn: (remember: boolean) => void;
  screenMode: ScreenMode;
  onChangeScreenMode: (mode: ScreenMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSignIn,
  onRegister,
  onDemoSignIn,
  screenMode,
  onChangeScreenMode,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMobile = screenMode === 'mobile';

  const switchMode = (next: 'signin' | 'register') => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result =
      mode === 'signin'
        ? onSignIn(email, password, remember)
        : onRegister(name, email, password, remember);

    if (result.ok === false) {
      setError(result.error);
    }
  };

  const previewCard = (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 sm:p-5 shadow-[0_8px_20px_-4px_rgba(15,23,42,0.07)] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <CompanyMark company="Linear" size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <span className="font-semibold text-[#0f172a]">Linear</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#006948]">Offer Stage</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#0f172a] leading-snug mt-0.5">
              Staff Product Engineer, Sync Engine
            </div>
          </div>
        </div>
        <span className="font-mono text-sm sm:text-lg font-extrabold text-[#059669] tabular-nums shrink-0">
          $225k – $260k
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#4b5563]">
        <span className="inline-flex items-center gap-1 font-mono font-medium text-[#0f172a]">
          <FileText className="w-3.5 h-3.5 text-[#6b7280]" aria-hidden="true" />
          v4.2 Staff Frontend
        </span>
        <span aria-hidden="true" className="text-[#9ca3af]">·</span>
        <span>Remote</span>
        <span aria-hidden="true" className="text-[#9ca3af]">·</span>
        <span className="inline-flex items-center gap-1 font-medium text-[#0f172a]">
          <Calendar className="w-3.5 h-3.5 text-[#059669]" aria-hidden="true" />
          Follow-up Nov 15
        </span>
      </div>

      <div className="pt-2.5 border-t border-[#f3f4f6] flex items-start gap-2 text-xs text-[#4b5563]">
        <MessageSquareText
          className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          <span className="font-semibold text-[#0f172a]">
            Offer Review &amp; Comp Call:
          </span>{' '}
          Written offer at $245k base + 0.18% equity. Reviewing relocation flexibility.
        </p>
      </div>
    </div>
  );

  const authFormBlock = (
    <div className="w-full space-y-5">
      {/* Segmented Mode Switcher */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="grid grid-cols-2 gap-1 p-1 bg-[#f3f4f6] rounded-xl"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => switchMode('signin')}
          className={`min-h-[40px] py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'signin'
              ? 'bg-white text-[#0f172a] shadow-xs'
              : 'text-[#6b7280] hover:text-[#0f172a]'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          onClick={() => switchMode('register')}
          className={`min-h-[40px] py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'register'
              ? 'bg-white text-[#0f172a] shadow-xs'
              : 'text-[#6b7280] hover:text-[#0f172a]'
          }`}
        >
          Create account
        </button>
      </div>

      {/* Heading */}
      <div>
        <h2
          className={`${
            isMobile ? 'text-2xl' : 'text-[28px]'
          } font-bold tracking-[-0.02em] text-[#0f172a]`}
        >
          {mode === 'signin'
            ? 'Sign in to your search'
            : 'Start tracking your search'}
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          {mode === 'signin'
            ? 'Access your target roles, compensation ranges, interview logs, and tailored resumes.'
            : 'Keep your applications, interview feedback, and follow-up dates organized in one private workspace.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs font-medium text-[#ba1a1a]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label
              htmlFor="auth-name"
              className="block text-xs font-semibold text-[#374151] mb-1.5"
            >
              Full Name
            </label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Shaw"
              className="w-full h-11 px-3.5 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] placeholder:text-[#9ca3af] focus:outline-none focus:bg-white focus:border-[1.5px] focus:border-[#059669] transition-colors"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold text-[#374151] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] placeholder:text-[#9ca3af] focus:outline-none focus:bg-white focus:border-[1.5px] focus:border-[#059669] transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-[#374151]"
            >
              Password
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  setEmail('RahulShaw16feb@gmail.com');
                  setPassword('demo-password');
                  setError(null);
                }}
                className="text-xs font-semibold text-[#059669] hover:text-[#006948] py-1"
              >
                Fill demo credentials
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === 'signin'
                  ? 'Enter your password'
                  : 'At least 6 characters'
              }
              className="w-full h-11 pl-3.5 pr-11 text-sm bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-[#0f172a] placeholder:text-[#9ca3af] focus:outline-none focus:bg-white focus:border-[1.5px] focus:border-[#059669] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#6b7280] hover:text-[#0f172a] rounded"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Stitch Square Checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={remember}
            onClick={() => setRemember((v) => !v)}
            className="inline-flex items-center gap-2.5 min-h-[40px] text-sm text-[#374151] select-none"
          >
            <span
              aria-hidden="true"
              className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${
                remember
                  ? 'bg-[#059669] border border-[#059669] text-white'
                  : 'bg-white border-[1.5px] border-[#d1d5db]'
              }`}
            >
              {remember && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>Stay signed in on this browser</span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-12 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#059669] hover:bg-[#006948] active:scale-[0.98] rounded-lg transition-all"
        >
          <span>
            {mode === 'signin' ? 'Sign in to Pipeline' : 'Create Account'}
          </span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-0.5">
        <div className="flex-grow border-t border-[#e5e7eb]" />
        <span className="shrink mx-3 text-xs font-medium text-[#6b7280]">
          or
        </span>
        <div className="flex-grow border-t border-[#e5e7eb]" />
      </div>

      {/* One-Click Demo Workspace Button */}
      <button
        type="button"
        onClick={() => onDemoSignIn(remember)}
        className="w-full h-12 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0f172a] bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] rounded-lg transition-all"
      >
        <span>Explore Demo Search</span>
      </button>

      <p className="text-xs text-[#6b7280] text-center leading-relaxed">
        Private by default—your account and application history stay in this browser.
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-[#0f172a]">
        <div className="max-w-[430px] mx-auto min-h-screen bg-white border-x border-[#e5e7eb] shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex flex-col">
          {/* Compact Mobile Header */}
          <header className="px-4 h-14 border-b border-[#e5e7eb] flex items-center justify-between gap-3">
            <span className="text-lg font-extrabold tracking-[-0.03em] text-[#0f172a]">
              FindMeAJob
            </span>
            <ScreenModeToggle mode={screenMode} onChange={onChangeScreenMode} />
          </header>

          {/* Mobile Auth Content */}
          <main className="flex-1 px-4 py-6 space-y-6">
            {authFormBlock}

            {/* Live Card Preview below form */}
            <div className="pt-5 border-t border-[#f3f4f6] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0f172a]">
                  Inside your pipeline
                </span>
                <span className="font-mono text-[#059669] font-semibold">
                  4 Stages · Comp-First
                </span>
              </div>
              {previewCard}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0f172a] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Column: Direct Talent Stream Editorial & Pipeline Preview */}
      <aside className="lg:col-span-6 bg-[#f0f3ff] border-b lg:border-b-0 lg:border-r border-[#e5e7eb] px-6 sm:px-12 py-10 lg:py-14 flex flex-col justify-between gap-10">
        {/* Top Wordmark */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-extrabold tracking-[-0.03em] text-[#0f172a]">
            FindMeAJob
          </span>
          <span className="text-xs font-semibold text-[#059669]">
            Candidate Command Board
          </span>
        </div>

        {/* Editorial Headline & Live Card Preview */}
        <div className="max-w-lg space-y-7 my-auto">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.12] text-[#151c27] [text-wrap:balance]">
              Clear visibility across every role, round, and offer.
            </h1>
            <p className="text-base text-[#3d4a42] leading-relaxed">
              Track opportunities from Saved through Offer with transparent pay bands, tailored resume variants, interview feedback, and timely follow-up reminders.
            </p>
          </div>

          {previewCard}
        </div>

        {/* Bottom 3-Metric Structural Row */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#dce2f3]">
          <div>
            <div className="font-mono text-sm font-bold text-[#0f172a] tabular-nums">
              4 Stages
            </div>
            <div className="text-xs text-[#565e74] mt-0.5">
              Saved through Offer
            </div>
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-[#059669] tabular-nums">
              Private
            </div>
            <div className="text-xs text-[#565e74] mt-0.5">
              Stored in browser
            </div>
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-[#0f172a] tabular-nums">
              Comp-First
            </div>
            <div className="text-xs text-[#565e74] mt-0.5">
              Pay &amp; round clarity
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Clean High-Contrast Login Form */}
      <main className="lg:col-span-6 px-6 sm:px-12 py-10 lg:py-16 flex flex-col justify-between bg-white">
        <div className="flex justify-end">
          <ScreenModeToggle mode={screenMode} onChange={onChangeScreenMode} />
        </div>
        <div className="w-full max-w-[420px] mx-auto my-auto py-6">
          {authFormBlock}
        </div>
        <div />
      </main>
    </div>
  );
};
