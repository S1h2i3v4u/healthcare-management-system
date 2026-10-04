import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  User,
  Stethoscope,
  HeartPulse,
  ArrowUpRight,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

import type {
  LoginRequest,
  RegisterPatientRequest,
  RegisterDoctorRequest,
} from '@/types';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

import { LogoMark } from '@/features/shared/LogoMark';

type Tab = 'signin' | 'signup';
type SignupRole = 'patient' | 'doctor';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    login,
    registerPatient,
    registerDoctor,
    isLoading,
  } = useAuth();

  /* ================================================================
     INITIAL TAB / ROLE
     ================================================================ */

  const initialTab: Tab =
    location.pathname === '/login'
      ? 'signin'
      : 'signup';

  const initialRole: SignupRole =
    location.pathname === '/register/doctor'
      ? 'doctor'
      : 'patient';

  const [tab, setTab] = useState<Tab>(initialTab);

  const [role, setRole] =
    useState<SignupRole>(initialRole);

  const [serverError, setServerError] =
    useState<string | null>(null);

  /* ================================================================
     TAB SWITCH
     ================================================================ */

  const switchTab = (nextTab: Tab) => {
    setTab(nextTab);
    setServerError(null);
  };

  /* ================================================================
     ROLE SWITCH
     ================================================================ */

  const switchRole = (nextRole: SignupRole) => {
    setRole(nextRole);
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* ============================================================
            LEFT SIDE — BRAND EXPERIENCE
            ============================================================ */}

        <section
          className="
            relative
            min-h-[620px]
            lg:min-h-screen
            overflow-hidden
            bg-gradient-to-br
            from-teal-700
            via-teal-600
            to-teal-700
            text-white
          "
        >

          {/* ========================================================
              DECORATIVE BACKGROUND
              ======================================================== */}

          <div
            className="
              absolute
              -top-32
              -right-32
              w-96
              h-96
              rounded-full
              border
              border-white/10
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              -top-20
              -right-20
              w-72
              h-72
              rounded-full
              bg-white/[0.035]
              animate-float-slow
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              left-[-80px]
              bottom-[-100px]
              w-80
              h-80
              rounded-full
              bg-peach-400/10
              blur-sm
              animate-float
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              right-12
              bottom-28
              w-20
              h-20
              rounded-full
              bg-white/[0.035]
              animate-float
              pointer-events-none
            "
          />

          {/* ========================================================
              DECORATIVE DOTS
              ======================================================== */}

          <div
            className="
              absolute
              top-28
              right-24
              w-2
              h-2
              rounded-full
              bg-white/30
              animate-pulse
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              top-40
              right-12
              w-1.5
              h-1.5
              rounded-full
              bg-peach-200/50
              animate-pulse
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              bottom-40
              left-16
              w-2
              h-2
              rounded-full
              bg-white/20
              animate-pulse
              pointer-events-none
            "
          />

          {/* ========================================================
              LEFT CONTENT
              ======================================================== */}

          <div
            className="
              relative
              z-10
              min-h-screen
              flex
              flex-col
              px-6
              sm:px-10
              lg:px-14
              xl:px-20
              py-8
              sm:py-10
              lg:py-12
            "
          >

            {/* ======================================================
                BRAND LOGO
                ====================================================== */}

            <Link
              to="/"
              aria-label="Healthcare home"
              className="
                group
                inline-flex
                items-center
                gap-3
                w-fit
                animate-fade-in
              "
            >

              {/* Living Heart — LIGHT VERSION */}

              <LogoMark
                variant="light"
                animated={true}
                className="
                  w-11
                  h-11
                  shrink-0
                  transition-transform
                  duration-300
                  group-hover:scale-105
                "
              />

              {/* Brand name */}

              <div>

                <p
                  className="
                    font-display
                    text-xl
                    leading-none
                    text-white
                    tracking-tight
                  "
                >
                  Healthcare
                </p>

                <p
                  className="
                    text-[10px]
                    tracking-[0.18em]
                    uppercase
                    text-teal-100/70
                    mt-1
                  "
                >
                  Care made clearer
                </p>

              </div>

            </Link>

            {/* ======================================================
                MAIN BRAND MESSAGE
                ====================================================== */}

            <div
              className="
                flex-1
                flex
                items-center
                py-12
                lg:py-6
              "
            >

              <div className="w-full max-w-xl">

                {/* ==================================================
                    EYEBROW
                    ================================================== */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3.5
                    py-2
                    rounded-full
                    bg-white/[0.08]
                    border
                    border-white/10
                    text-xs
                    font-medium
                    tracking-wide
                    text-teal-50
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '100ms',
                    animationFillMode: 'both',
                  }}
                >

                  <Sparkles
                    className="w-3.5 h-3.5 text-peach-200"
                    strokeWidth={1.8}
                  />

                  <span>
                    A calmer way to manage your care
                  </span>

                </div>

                {/* ==================================================
                    HEADING
                    ================================================== */}

                <h1
                  className="
                    font-display
                    text-3xl
                    sm:text-4xl
                    xl:text-5xl
                    leading-[1.06]
                    tracking-tight
                    mt-6
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '180ms',
                    animationFillMode: 'both',
                  }}
                >
                  Healthcare that
                  <br />

                  <span className="text-teal-100">
                    feels human.
                  </span>
                </h1>

                {/* ==================================================
                    DESCRIPTION
                    ================================================== */}

                <p
                  className="
                    text-sm
                    sm:text-base
                    leading-relaxed
                    text-teal-50/75
                    max-w-lg
                    mt-5
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '260ms',
                    animationFillMode: 'both',
                  }}
                >
                  Find trusted doctors, manage appointments,
                  keep your health records together, and stay
                  prepared for every step of your care.
                </p>

                {/* ==================================================
                    TRUST POINTS
                    ================================================== */}

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-3
                    gap-3
                    mt-7
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '340ms',
                    animationFillMode: 'both',
                  }}
                >

                  <TrustPoint
                    icon={ShieldCheck}
                    title="Verified"
                    text="Trusted doctors"
                  />

                  <TrustPoint
                    icon={HeartPulse}
                    title="Connected"
                    text="Your care in one place"
                  />

                  <TrustPoint
                    icon={Lock}
                    title="Private"
                    text="Your records stay yours"
                  />

                </div>

                {/* ==================================================
                    ECG SECTION
                    ================================================== */}

                <div
                  className="
                    mt-8
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '420ms',
                    animationFillMode: 'both',
                  }}
                >

                  <div className="flex items-center gap-3 mb-2">

                    <span
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.2em]
                        text-teal-100/50
                      "
                    >
                      Care, connected
                    </span>

                    <span
                      className="
                        h-px
                        flex-1
                        max-w-20
                        bg-white/10
                      "
                    />

                  </div>

                  <div
                    className="
                      relative
                      w-full
                      max-w-lg
                    "
                  >

                    {/* ECG GLOW */}

                    <div
                      className="
                        absolute
                        inset-0
                        blur-md
                        opacity-30
                        pointer-events-none
                      "
                    >

                      <svg
                        viewBox="0 0 500 70"
                        className="w-full h-12"
                        fill="none"
                        aria-hidden="true"
                      >

                        <path
                          d="
                            M0 35 H105
                            L125 35
                            L143 16
                            L160 54
                            L180 8
                            L201 61
                            L220 35
                            H275
                            C292 35 298 25 310 25
                            C322 25 328 35 342 35
                            H500
                          "
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                      </svg>

                    </div>

                    {/* MAIN ECG */}

                    <svg
                      viewBox="0 0 500 70"
                      className="
                        relative
                        w-full
                        max-w-lg
                        h-12
                        sm:h-14
                      "
                      fill="none"
                      aria-hidden="true"
                    >

                      {/* Base line */}

                      <path
                        d="
                          M0 35 H105
                          L125 35
                          L143 16
                          L160 54
                          L180 8
                          L201 61
                          L220 35
                          H275
                          C292 35 298 25 310 25
                          C322 25 328 35 342 35
                          H500
                        "
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Animated line */}

                      <path
                        d="
                          M0 35 H105
                          L125 35
                          L143 16
                          L160 54
                          L180 8
                          L201 61
                          L220 35
                          H275
                          C292 35 298 25 310 25
                          C322 25 328 35 342 35
                          H500
                        "
                        stroke="rgba(255,255,255,0.72)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="1000"
                        className="animate-draw-line"
                      />

                      {/* Moving pulse */}

                      <circle
                        r="3.5"
                        fill="rgba(255,255,255,0.95)"
                      >

                        <animateMotion
                          dur="3.5s"
                          repeatCount="indefinite"
                          path="
                            M0 35 H105
                            L125 35
                            L143 16
                            L160 54
                            L180 8
                            L201 61
                            L220 35
                            H275
                            C292 35 298 25 310 25
                            C322 25 328 35 342 35
                            H500
                          "
                        />

                      </circle>

                      {/* Pulse glow */}

                      <circle
                        r="7"
                        fill="rgba(255,255,255,0.10)"
                      >

                        <animateMotion
                          dur="3.5s"
                          repeatCount="indefinite"
                          path="
                            M0 35 H105
                            L125 35
                            L143 16
                            L160 54
                            L180 8
                            L201 61
                            L220 35
                            H275
                            C292 35 298 25 310 25
                            C322 25 328 35 342 35
                            H500
                          "
                        />

                      </circle>

                    </svg>

                  </div>

                </div>

                {/* ==================================================
                    SUPPORT CARD
                    ================================================== */}

                <div
                  className="
                    mt-4
                    w-full
                    max-w-md
                    animate-fade-up
                  "
                  style={{
                    animationDelay: '520ms',
                    animationFillMode: 'both',
                  }}
                >

                  <div
                    className="
                      relative
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.07]
                      backdrop-blur-md
                      px-5
                      py-4
                      overflow-hidden
                    "
                  >

                    {/* Decorative glow */}

                    <div
                      className="
                        absolute
                        -right-10
                        -top-10
                        w-28
                        h-28
                        rounded-full
                        bg-peach-400/10
                        blur-xl
                        pointer-events-none
                      "
                    />

                    <div
                      className="
                        relative
                        flex
                        items-center
                        gap-4
                      "
                    >

                      {/* Icon */}

                      <div
                        className="
                          w-11
                          h-11
                          rounded-2xl
                          bg-peach-400/90
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                          shadow-lg
                        "
                      >

                        <HeartPulse
                          className="w-5 h-5 text-white"
                          strokeWidth={2}
                        />

                      </div>

                      {/* Text */}

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            We're here for you
                          </p>

                          <span
                            className="
                              w-1.5
                              h-1.5
                              rounded-full
                              bg-teal-200
                              animate-pulse
                            "
                          />

                        </div>

                        <p
                          className="
                            text-[11px]
                            text-teal-50/65
                            mt-1
                            leading-relaxed
                          "
                        >
                          From your first search to your next
                          appointment, everything stays simple
                          and connected.
                        </p>

                      </div>

                      {/* Arrow */}

                      <div
                        className="
                          w-8
                          h-8
                          rounded-full
                          border
                          border-white/10
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                      >

                        <ArrowUpRight
                          className="
                            w-4
                            h-4
                            text-teal-100/70
                          "
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ======================================================
                FOOTER
                ====================================================== */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                justify-between
                gap-3
                text-[11px]
                text-teal-100/45
              "
            >

              <span>
                Designed around people, not paperwork.
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <Lock className="w-3.5 h-3.5" />

                  Private by design

                </span>

                <span
                  className="
                    w-1
                    h-1
                    rounded-full
                    bg-white/20
                  "
                />

                <span>
                  Healthcare platform
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ============================================================
            RIGHT SIDE — AUTHENTICATION
            ============================================================ */}

        <section
          className="
            relative
            min-h-screen
            bg-[#f6f2e9]
            flex
            items-start
            justify-center
            px-5
            sm:px-8
            lg:px-12
            xl:px-20
            py-8
            sm:py-10
            lg:py-12
            overflow-y-auto
          "
        >

          {/* ========================================================
              RIGHT BACKGROUND DECORATION
              ======================================================== */}

          <div
            className="
              absolute
              top-[-120px]
              right-[-120px]
              w-72
              h-72
              rounded-full
              bg-teal-500/[0.045]
              animate-float-slow
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              bottom-[-100px]
              left-[-100px]
              w-64
              h-64
              rounded-full
              bg-peach-400/[0.055]
              animate-float
              pointer-events-none
            "
          />

          {/* ========================================================
              AUTH CONTAINER
              ======================================================== */}

          <div
            className="
              relative
              z-10
              w-full
              max-w-[500px]
              mt-2
              sm:mt-4
              lg:mt-8
            "
          >

            {/* ======================================================
                AUTH CARD
                ====================================================== */}

            <div
              className="
                bg-[#fcfaf5]
                rounded-[1.75rem]
                shadow-[0_24px_70px_rgba(22,58,53,0.13)]
                border
                border-[#e7dfd1]
                overflow-hidden
                animate-fade-up
              "
            >

              {/* ==================================================
                  TOP ACCENT
                  ================================================== */}

              <div
                className="
                  h-1.5
                  bg-gradient-to-r
                  from-teal-800
                  via-teal-600
                  to-teal-400
                "
              />

              <div
                className="
                  p-6
                  sm:p-8
                  lg:p-9
                "
              >

                {/* ==================================================
                    AUTH HEADER
                    ================================================== */}

                <div className="mb-6">

                  {/* Mini brand */}

                  <Link
                    to="/"
                    aria-label="Healthcare home"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      mb-3
                      group
                    "
                  >

                    <LogoMark
                      variant="dark"
                      animated={true}
                      className="
                        w-8
                        h-8
                        shrink-0
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    />

                    <span
                      className="
                        text-[11px]
                        font-semibold
                        tracking-[0.16em]
                        text-teal-700
                        uppercase
                        group-hover:text-teal-800
                        transition-colors
                      "
                    >
                      Healthcare
                    </span>

                  </Link>

                  {/* Heading */}

                  <h2
                    className="
                      font-display
                      text-3xl
                      sm:text-[2rem]
                      leading-tight
                      text-[#243238]
                    "
                  >
                    {tab === 'signin'
                      ? 'Welcome back.'
                      : 'Let’s get started.'}
                  </h2>

                  {/* Description */}

                  <p
                    className="
                      text-sm
                      text-[#71808a]
                      mt-2
                      leading-relaxed
                    "
                  >
                    {tab === 'signin'
                      ? 'Sign in to continue managing your care.'
                      : 'Create your account and keep your care connected.'}
                  </p>

                </div>

                {/* ==================================================
                    SIGN IN / SIGN UP TABS
                    ================================================== */}

                <div
                  className="
                    relative
                    grid
                    grid-cols-2
                    gap-1.5
                    p-1.5
                    bg-[#f2eee5]
                    rounded-2xl
                    mb-7
                    border
                    border-[#e7dfd2]
                  "
                  role="tablist"
                  aria-label="Authentication options"
                >

                  {/* SIGN IN */}

                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'signin'}
                    onClick={() => switchTab('signin')}
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-3
                      rounded-xl
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        tab === 'signin'
                          ? `
                            bg-teal-700
                            text-white
                            shadow-[0_6px_18px_rgba(20,102,94,0.18)]
                          `
                          : `
                            text-[#71808a]
                            hover:text-[#35505a]
                            hover:bg-white/70
                          `
                      }
                    `}
                  >

                    <LogIn
                      className="w-4 h-4"
                      strokeWidth={2}
                    />

                    Sign in

                  </button>

                  {/* SIGN UP */}

                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'signup'}
                    onClick={() => switchTab('signup')}
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-2
                      py-3
                      rounded-xl
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        tab === 'signup'
                          ? `
                            bg-teal-700
                            text-white
                            shadow-[0_6px_18px_rgba(20,102,94,0.18)]
                          `
                          : `
                            text-[#71808a]
                            hover:text-[#35505a]
                            hover:bg-white/70
                          `
                      }
                    `}
                  >

                    <UserPlus
                      className="w-4 h-4"
                      strokeWidth={2}
                    />

                    Create account

                  </button>

                </div>

                {/* ==================================================
                    ROLE SELECTION
                    ================================================== */}

                {tab === 'signup' && (
                  <div
                    className="
                      mb-7
                      animate-fade-in
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-[#71808a]
                        mb-2.5
                      "
                    >
                      I want to use Healthcare as
                    </p>

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3
                      "
                    >

                      {/* PATIENT */}

                      <RoleCard
                        icon={User}
                        title="Patient"
                        subtitle="Manage my care"
                        active={role === 'patient'}
                        onClick={() =>
                          switchRole('patient')
                        }
                      />

                      {/* DOCTOR */}

                      <RoleCard
                        icon={Stethoscope}
                        title="Doctor"
                        subtitle="Join the network"
                        active={role === 'doctor'}
                        onClick={() =>
                          switchRole('doctor')
                        }
                      />

                    </div>

                  </div>
                )}

                {/* ==================================================
                    SERVER ERROR
                    ================================================== */}

                <ErrorBanner
                  message={serverError}
                />

                {/* ==================================================
                    FORM CONTAINER
                    ================================================== */}

                <div
                  key={`${tab}-${role}`}
                  className="animate-fade-in"
                >

                  {/* SIGN IN */}

                  {tab === 'signin' && (
                    <SignInForm
                      onError={setServerError}
                      login={login}
                      isLoading={isLoading}
                      navigate={navigate}
                    />
                  )}

                  {/* PATIENT */}

                  {tab === 'signup' &&
                    role === 'patient' && (
                      <PatientSignUpForm
                        onError={setServerError}
                        registerPatient={registerPatient}
                        isLoading={isLoading}
                        navigate={navigate}
                      />
                    )}

                  {/* DOCTOR */}

                  {tab === 'signup' &&
                    role === 'doctor' && (
                      <DoctorSignUpForm
                        onError={setServerError}
                        registerDoctor={registerDoctor}
                        isLoading={isLoading}
                        navigate={navigate}
                      />
                    )}

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

/* ==================================================================
   TRUST POINT
   ================================================================== */

function TrustPoint({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.055]
        backdrop-blur-sm
        px-3.5
        py-3
      "
    >

      <div
        className="
          flex
          items-center
          gap-2.5
        "
      >

        <div
          className="
            w-8
            h-8
            rounded-xl
            bg-white/[0.08]
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >

          <Icon
            className="w-4 h-4 text-teal-100"
            strokeWidth={1.8}
          />

        </div>

        <div className="min-w-0">

          <p
            className="
              text-[11px]
              font-semibold
              text-white
            "
          >
            {title}
          </p>

          <p
            className="
              text-[10px]
              text-teal-100/50
              mt-0.5
              truncate
            "
          >
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ==================================================================
   ROLE CARD
   ================================================================== */

function RoleCard({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        relative
        text-left
        p-3.5
        rounded-xl
        border
        transition-all
        duration-200
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-teal-500/40
        ${
          active
            ? `
              border-teal-300
              bg-teal-50
              shadow-soft
              scale-[1.015]
            `
            : `
              border-[#e4ddd1]
              bg-white/70
              hover:bg-white
              hover:border-teal-200
              hover:scale-[1.01]
            `
        }
      `}
    >

      {/* ==========================================================
          SELECTED INDICATOR
          ========================================================== */}

      {active && (
        <span
          className="
            absolute
            top-3
            right-3
            w-5
            h-5
            rounded-full
            bg-teal-600
            flex
            items-center
            justify-center
            animate-fade-in
          "
        >

          <CheckCircle2
            className="w-3.5 h-3.5 text-white"
            strokeWidth={3}
          />

        </span>
      )}

      {/* ==========================================================
          ROLE ICON
          ========================================================== */}

      <div
        className={`
          w-9
          h-9
          rounded-xl
          flex
          items-center
          justify-center
          mb-3
          ${
            active
              ? 'bg-white shadow-sm'
              : 'bg-[#f3efe6]'
          }
        `}
      >

        <Icon
          className={`
            w-[18px]
            h-[18px]
            ${
              active
                ? 'text-teal-700'
                : 'text-[#71808a]'
            }
          `}
          strokeWidth={1.9}
        />

      </div>

      {/* ==========================================================
          ROLE TITLE
          ========================================================== */}

      <p
        className={`
          text-sm
          font-semibold
          ${
            active
              ? 'text-teal-700'
              : 'text-[#2d3b40]'
          }
        `}
      >
        {title}
      </p>

      {/* ==========================================================
          ROLE SUBTITLE
          ========================================================== */}

      <p
        className="
          text-xs
          text-[#879198]
          mt-0.5
        "
      >
        {subtitle}
      </p>

    </button>
  );
}

/* ==================================================================
   SIGN IN FORM
   ================================================================== */

function SignInForm({
  onError,
  login,
  isLoading,
  navigate,
}: any) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (
    data: LoginRequest
  ) => {
    onError(null);

    try {
      await login(data);

      navigate('/');
    } catch (err: any) {
      onError(
        err?.response?.data?.message ??
          'Login failed. Please try again.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >

      {/* EMAIL */}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        autoComplete="email"
        {...register('email', {
          required: 'Email is required',
        })}
      />

      {/* PASSWORD */}

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        autoComplete="current-password"
        {...register('password', {
          required: 'Password is required',
        })}
      />

      {/* SUBMIT */}

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Sign In
      </Button>

    </form>
  );
}

/* ==================================================================
   PATIENT SIGN UP
   ================================================================== */

function PatientSignUpForm({
  onError,
  registerPatient,
  isLoading,
  navigate,
}: any) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterPatientRequest>();

  const password = watch('password');

  const onSubmit = async (
    data: RegisterPatientRequest
  ) => {
    onError(null);

    try {
      await registerPatient(data);

      navigate('/');
    } catch (err: any) {
      onError(
        err?.response?.data?.message ??
          'Registration failed. Please try again.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >

      {/* ==========================================================
          FULL NAME
          ========================================================== */}

      <Input
        label="Full Name"
        error={errors.fullName?.message}
        autoComplete="name"
        {...register('fullName', {
          required: 'Full name is required',
        })}
      />

      {/* ==========================================================
          EMAIL
          ========================================================== */}

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        autoComplete="email"
        {...register('email', {
          required: 'Email is required',
        })}
      />

      {/* ==========================================================
          MOBILE
          ========================================================== */}

      <Input
        label="Mobile Number"
        type="tel"
        inputMode="numeric"
        error={errors.mobileNumber?.message}
        autoComplete="tel"
        {...register('mobileNumber', {
          required: 'Mobile number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Must be a 10-digit number',
          },
        })}
      />

      {/* ==========================================================
          DOB + GENDER
          ========================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >

        <Input
          label="Date of Birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth', {
            required:
              'Date of birth is required',
          })}
        />

        <Select
          label="Gender"
          placeholder="Select..."
          options={[
            {
              value: 'MALE',
              label: 'Male',
            },
            {
              value: 'FEMALE',
              label: 'Female',
            },
            {
              value: 'OTHER',
              label: 'Other',
            },
          ]}
          error={errors.gender?.message}
          {...register('gender', {
            required: 'Gender is required',
          })}
        />

      </div>

      {/* ==========================================================
          PASSWORD + CONFIRM
          ========================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >

        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'At least 8 characters',
            },
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword', {
            required:
              'Please confirm your password',
            validate: (value) =>
              value === password ||
              'Passwords do not match',
          })}
        />

      </div>

      {/* ==========================================================
          SUBMIT
          ========================================================== */}

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>

    </form>
  );
}

/* ==================================================================
   DOCTOR SIGN UP
   ================================================================== */

function DoctorSignUpForm({
  onError,
  registerDoctor,
  isLoading,
  navigate,
}: any) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterDoctorRequest>();

  const password = watch('password');

  const onSubmit = async (
    data: RegisterDoctorRequest
  ) => {
    onError(null);

    try {
      await registerDoctor(data);

      navigate('/');
    } catch (err: any) {
      onError(
        err?.response?.data?.message ??
          'Registration failed. Please try again.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >

      {/* ==========================================================
          BASIC DETAILS
          ========================================================== */}

      <Input
        label="Full Name"
        error={errors.fullName?.message}
        autoComplete="name"
        {...register('fullName', {
          required: 'Full name is required',
        })}
      />

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        autoComplete="email"
        {...register('email', {
          required: 'Email is required',
        })}
      />

      <Input
        label="Mobile Number"
        type="tel"
        inputMode="numeric"
        error={errors.mobileNumber?.message}
        autoComplete="tel"
        {...register('mobileNumber', {
          required: 'Mobile number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Must be a 10-digit number',
          },
        })}
      />

      {/* ==========================================================
          PASSWORD + CONFIRM
          ========================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >

        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'At least 8 characters',
            },
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword', {
            required:
              'Please confirm your password',
            validate: (value) =>
              value === password ||
              'Passwords do not match',
          })}
        />

      </div>

      {/* ==========================================================
          PROFESSIONAL DETAILS
          ========================================================== */}

      <div
        className="
          pt-4
          border-t
          border-[#e5ddd1]
          space-y-4
        "
      >

        {/* SECTION HEADER */}

        <div>

          <p
            className="
              text-xs
              font-semibold
              text-[#53636b]
              uppercase
              tracking-[0.12em]
            "
          >
            Professional Details
          </p>

          <p
            className="
              text-xs
              text-[#879198]
              mt-1
              leading-relaxed
            "
          >
            These details help us verify your
            professional profile.
          </p>

        </div>

        {/* ========================================================
            REGISTRATION NUMBER
            ======================================================== */}

        <Input
          label="Medical Registration Number"
          error={
            errors.medicalRegistrationNumber?.message
          }
          {...register(
            'medicalRegistrationNumber',
            {
              required:
                'Registration number is required',
            }
          )}
        />

        {/* ========================================================
            QUALIFICATION
            ======================================================== */}

        <Input
          label="Medical Qualification"
          placeholder="e.g. MBBS, MD"
          error={
            errors.medicalQualification?.message
          }
          {...register(
            'medicalQualification',
            {
              required:
                'Qualification is required',
            }
          )}
        />

        {/* ========================================================
            SPECIALIZATION
            ======================================================== */}

        <Input
          label="Specialization"
          placeholder="e.g. General Medicine"
          error={
            errors.specialization?.message
          }
          {...register('specialization', {
            required:
              'Specialization is required',
          })}
        />

        {/* ========================================================
            EXPERIENCE + FEE
            ======================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >

          <Input
            label="Years of Experience"
            type="number"
            min={0}
            error={
              errors.yearsOfExperience?.message
            }
            {...register(
              'yearsOfExperience',
              {
                required:
                  'Experience is required',
                valueAsNumber: true,
                min: {
                  value: 0,
                  message:
                    'Cannot be negative',
                },
              }
            )}
          />

          <Input
            label="Consultation Fee (₹)"
            type="number"
            min={0}
            error={
              errors.consultationFee?.message
            }
            {...register(
              'consultationFee',
              {
                required:
                  'Fee is required',
                valueAsNumber: true,
                min: {
                  value: 0,
                  message:
                    'Cannot be negative',
                },
              }
            )}
          />

        </div>

        {/* ========================================================
            HOSPITAL
            ======================================================== */}

        <Input
          label="Hospital / Clinic Name"
          autoComplete="organization"
          {...register('hospitalName')}
        />

        {/* ========================================================
            CITY
            ======================================================== */}

        <Input
          label="City"
          error={errors.city?.message}
          autoComplete="address-level2"
          {...register('city', {
            required: 'City is required',
          })}
        />

        {/* ========================================================
            ADDRESS
            ======================================================== */}

        <Input
          label="Address"
          error={errors.address?.message}
          autoComplete="street-address"
          {...register('address', {
            required: 'Address is required',
          })}
        />

      </div>

      {/* ==========================================================
          SUBMIT
          ========================================================== */}

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Register as Doctor
      </Button>

    </form>
  );
}