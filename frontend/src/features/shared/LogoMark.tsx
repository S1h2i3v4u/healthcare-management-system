

type LogoMarkProps = {
  className?: string;
  animated?: boolean;
  variant?: 'light' | 'dark';
};

export function LogoMark({
  className = '',
  animated = true,
  variant = 'dark',
}: LogoMarkProps) {
  const heartColor = variant === 'light' ? '#FFFFFF' : '#143530';

  return (
    <>
      <span
        className={`healthcare-logo-mark ${
          animated ? 'healthcare-logo-animated' : ''
        } ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          className="healthcare-logo-svg"
          fill="none"
        >
          {/* Peach decorative circle */}
          <circle
            cx="18"
            cy="14"
            r="7"
            fill="#FDBA8C"
            className="logo-peach-circle"
          />

          {/* Teal decorative circle */}
          <circle
            cx="30"
            cy="16"
            r="5.5"
            fill="#5EB8A3"
            className="logo-teal-circle"
          />

          {/* Main heart */}
          <path
            d="M24 44
              C24 44 8 32 8 21
              C8 15 13 11 18 13
              C21 14 24 18 24 18
              C24 18 27 12 32 12
              C38 12 42 17 42 22
              C42 33 24 44 24 44 Z"
            fill="none"
            stroke={heartColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-heart"
          />

          {/* ECG / heartbeat line */}
          <path
            d="M14 23 H19 L21.5 20 L24 27 L27 20.5 H34"
            fill="none"
            stroke={heartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-heartbeat"
          />
        </svg>
      </span>

      <style>{`
        .healthcare-logo-mark {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          overflow: visible;
          transform: translateZ(0);
        }

        .healthcare-logo-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          display: block;
        }

        /* Heart breathing animation */
        .healthcare-logo-animated .logo-heart {
          transform-origin: 24px 27px;
          animation: healthcare-heart-breathe 3.4s ease-in-out infinite;
        }

        /* ECG animation */
        .healthcare-logo-animated .logo-heartbeat {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: healthcare-heartbeat 3.4s ease-in-out infinite;
        }

        /* Peach dot animation */
        .healthcare-logo-animated .logo-peach-circle {
          transform-origin: 18px 14px;
          animation: healthcare-dot-pulse 3.4s ease-in-out infinite;
        }

        /* Teal dot animation */
        .healthcare-logo-animated .logo-teal-circle {
          transform-origin: 30px 16px;
          animation: healthcare-dot-pulse 3.4s ease-in-out 180ms infinite;
        }

        /* Subtle hover effect */
        .healthcare-logo-mark:hover {
          transform: translateY(-1px) scale(1.03);
          transition: transform 220ms ease;
        }

        @keyframes healthcare-heart-breathe {
          0%,
          72%,
          100% {
            transform: scale(1);
          }

          76% {
            transform: scale(1.025);
          }

          80% {
            transform: scale(0.995);
          }

          84% {
            transform: scale(1.018);
          }

          88% {
            transform: scale(1);
          }
        }

        @keyframes healthcare-heartbeat {
          0%,
          67%,
          100% {
            stroke-dashoffset: 48;
            opacity: 0;
          }

          70% {
            stroke-dashoffset: 48;
            opacity: 0;
          }

          75% {
            stroke-dashoffset: 0;
            opacity: 1;
          }

          84% {
            stroke-dashoffset: -48;
            opacity: 1;
          }

          88% {
            stroke-dashoffset: -48;
            opacity: 0;
          }
        }

        @keyframes healthcare-dot-pulse {
          0%,
          72%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          78% {
            transform: scale(1.06);
            opacity: 0.92;
          }

          84% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .healthcare-logo-animated .logo-heart,
          .healthcare-logo-animated .logo-heartbeat,
          .healthcare-logo-animated .logo-peach-circle,
          .healthcare-logo-animated .logo-teal-circle {
            animation: none !important;
          }

          .healthcare-logo-mark:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}