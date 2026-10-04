import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Stethoscope, CalendarCheck, FileText, ShieldCheck, ArrowRight,
  Search, ClipboardCheck, Pill, HeartPulse, Sparkles, BadgeCheck,
  Lock, Clock, Users, MapPin,
} from 'lucide-react';
import { getAvailableCities } from '@/api/doctorApi';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: cities } = useQuery({ queryKey: ['doctors', 'cities'], queryFn: getAvailableCities });

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      {/* Sticky pill nav — real logo mark instead of a keyboard-symbol
          placeholder, which is the single biggest thing that was making
          this read as unfinished rather than a real brand. */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'pt-3' : 'pt-6'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className={`flex items-center justify-between bg-white/85 backdrop-blur-md rounded-full border border-line px-4 py-2 transition-shadow duration-300 ${scrolled ? 'shadow-lift' : 'shadow-soft'}`}>
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark className="w-8 h-8" />
              <span className="font-display text-lg text-ink">Healthcare</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <a href="#how-it-works" className="text-sm font-medium text-ink-600 px-3.5 py-1.5 rounded-full hover:bg-cream-100 transition-colors">How it works</a>
              <a href="#features" className="text-sm font-medium text-ink-600 px-3.5 py-1.5 rounded-full hover:bg-cream-100 transition-colors">Find care</a>
              <Link to="/register/doctor" className="text-sm font-medium text-ink-600 px-3.5 py-1.5 rounded-full hover:bg-cream-100 transition-colors">For doctors</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-ink-600 px-3.5 py-2 hover:text-ink transition-colors">Sign in</Link>
              <Link to="/register/patient" className="flex items-center gap-1.5 text-sm font-medium bg-teal-500 text-white px-4 py-2.5 rounded-full hover:bg-teal-600 transition-all hover:shadow-lift shadow-soft">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — gradient mesh background instead of flat cream, bigger
          type scale, tighter tracking. */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 -top-20 w-[32rem] h-[32rem] bg-teal-400/[0.12] rounded-full blur-3xl" />
          <div className="absolute right-0 top-1/3 w-96 h-96 bg-peach-400/[0.14] rounded-full blur-3xl" />
          <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-lavender-400/[0.10] rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full mb-7">
              <Sparkles className="w-3.5 h-3.5" /> Care that stays with you
            </span>

            <h1 className="font-display text-[3.25rem] sm:text-7xl text-ink leading-[0.98] tracking-tight">
              Your healthcare,
              <br /><span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">organized digitally.</span>
            </h1>

            <p className="text-ink-600 mt-7 text-lg leading-relaxed max-w-md">
              Find the right doctor, book with confidence, and keep your complete
              health story in one secure place.
            </p>

            <div className="flex flex-wrap gap-3 mt-9">
              <Link to="/register/patient" className="flex items-center gap-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white px-7 py-4 rounded-full font-medium hover:brightness-105 transition-all shadow-lift hover:-translate-y-0.5">
                Book an appointment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register/patient" className="flex items-center gap-2 bg-white border border-line text-ink-600 px-7 py-4 rounded-full font-medium hover:bg-cream-100 transition-all hover:-translate-y-0.5 shadow-soft">
                <Search className="w-4 h-4" /> Find a doctor
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <div className="absolute -inset-5 bg-gradient-to-br from-teal-200/60 to-peach-200/40 rounded-[2rem] rotate-3 blur-[1px]" />
            <img
              src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Doctor consulting with a patient"
              className="relative w-full h-[440px] object-cover rounded-[1.75rem] shadow-lift"
            />

            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl2 shadow-lift px-5 py-4 flex items-center gap-3 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-success-400/30 blur-md" />
                <div className="relative w-10 h-10 rounded-full bg-success-50 text-success-700 flex items-center justify-center">
                  <ClipboardCheck className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Verified Doctors</p>
                <p className="text-xs text-ink-400">Reviewed before every listing</p>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-xl2 shadow-lift px-4 py-3.5 flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
              <div className="relative w-8 h-8 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-teal-400/30 blur-md" />
                <div className="relative w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm font-semibold text-ink">Book in under a minute</p>
            </div>
          </div>
        </div>

        {/* Trust strip — real glowing stat cards, not a plain text row */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TrustStat icon={MapPin} value={cities?.length ?? '—'} label="Cities served" tint="teal" />
            <TrustStat icon={ShieldCheck} value="100%" label="Verified doctors only" tint="sage" />
            <TrustStat icon={Lock} value="Private" label="End-to-end encrypted" tint="lavender" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-line">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full">The process</span>
          <h2 className="font-display text-4xl text-ink mt-5">How it works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          <div className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-line to-transparent" />
          <StepCard icon={Search} step="1" title="Find a doctor" text="Search by specialty, hospital, or city — see real availability, not guesswork." />
          <StepCard icon={CalendarCheck} step="2" title="Book instantly" text="Pick a time that works. No phone calls, no waiting on hold." />
          <StepCard icon={ClipboardCheck} step="3" title="Keep every record" text="Diagnosis, prescriptions, and reports — permanently yours, always accessible." />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-line">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full">Why Healthcare</span>
          <h2 className="font-display text-4xl text-ink mt-5">Built around trust</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FeatureCard icon={Stethoscope} title="Verified Doctors" text="Every doctor is reviewed and verified before they can accept appointments." />
          <FeatureCard icon={FileText} title="Digital Medical Records" text="Your full history, prescriptions, and reports — organized and searchable." />
          <FeatureCard icon={Pill} title="Prescriptions, Simplified" text="Download or print any prescription as a clean, professional PDF." />
          <FeatureCard icon={ShieldCheck} title="Secure by Design" text="Your records are private and encrypted, visible only to you and your doctors." />
        </div>
      </section>

      {/* For doctors */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-line">
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-[1.75rem] px-8 sm:px-14 py-16 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-white/10 animate-float-slow" />
          <div className="absolute right-40 top-6 w-16 h-16 rounded-full bg-white/5 animate-float" />

          <div className="relative max-w-lg">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full bg-white/25 blur-lg" />
              <div className="relative w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-white" strokeWidth={1.75} />
              </div>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl">For Doctors</h2>
            <p className="text-teal-50/90 mt-4 leading-relaxed text-lg">
              Manage your schedule, consultations, and patient records in one focused workspace —
              built for how you actually practice.
            </p>
            <div className="flex flex-wrap items-center gap-5 mt-7 text-sm text-teal-50/85">
              <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> Reviewed before listing</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Full patient history at a glance</span>
            </div>
            <Link
              to="/register/doctor"
              className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3.5 rounded-full font-semibold mt-8 hover:bg-teal-50 transition-all hover:-translate-y-0.5 shadow-lift"
            >
              Register as a Doctor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="w-6 h-6" />
            <span className="text-sm text-ink-400">⌘ Healthcare — organized care, for everyone.</span>
          </div>
          <div className="flex gap-5 text-sm text-ink-400">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Real logo mark, shared visual signature with the auth page — two
// overlapping circles forming a heart negative-space outline, rather
// than reusing a generic OS keyboard symbol as a "brand".
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="18" cy="14" r="7" fill="#FDBA8C" />
      <circle cx="30" cy="16" r="5.5" fill="#5EB8A3" />
      <path d="M24 44 C24 44 8 32 8 21 C8 15 13 11 18 13 C21 14 24 18 24 18 C24 18 27 12 32 12 C38 12 42 17 42 22 C42 33 24 44 24 44 Z" fill="none" stroke="#143530" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function TrustStat({ icon: Icon, value, label, tint }: {
  icon: React.ElementType; value: string | number; label: string; tint: 'teal' | 'sage' | 'lavender';
}) {
  const tintClasses = {
    teal: { bg: 'bg-teal-50', glow: 'bg-teal-400/30', text: 'text-teal-600' },
    sage: { bg: 'bg-sage-50', glow: 'bg-sage-400/30', text: 'text-sage-500' },
    lavender: { bg: 'bg-lavender-50', glow: 'bg-lavender-400/30', text: 'text-lavender-400' },
  }[tint];

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl2 border border-line px-5 py-4 shadow-card">
      <div className="relative w-11 h-11 flex-shrink-0">
        <div className={`absolute inset-0 rounded-full blur-md ${tintClasses.glow}`} />
        <div className={`relative w-11 h-11 rounded-full flex items-center justify-center ${tintClasses.bg} ${tintClasses.text}`}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
      </div>
      <div>
        <p className="font-display text-xl text-ink leading-none">{value}</p>
        <p className="text-xs text-ink-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function StepCard({ icon: Icon, step, title, text }: { icon: React.ElementType; step: string; title: string; text: string }) {
  return (
    <div className="relative text-center px-4 group">
      <div className="relative w-14 h-14 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full bg-teal-300/30 blur-md group-hover:bg-teal-300/50 transition-colors" />
        <div className="relative w-14 h-14 rounded-full bg-white border border-teal-100 text-teal-500 flex items-center justify-center shadow-soft">
          <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-xs text-teal-500 font-medium mb-1">STEP {step}</p>
      <h3 className="font-medium text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink-400 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="bg-white rounded-xl2 border border-line p-6 shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative w-10 h-10 mb-3">
        <div className="absolute inset-0 rounded-full bg-sage-300/30 blur-md" />
        <div className="relative w-10 h-10 rounded-full bg-sage-50 text-sage-500 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="font-medium text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink-400 leading-relaxed">{text}</p>
    </div>
  );
}