/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* ============================================================
         COLORS
         ============================================================ */
      colors: {
        cream: {
          DEFAULT: '#FBF7F0',
          50: '#FDFBF8',
          100: '#FBF7F0',
          200: '#F5EEE1',
        },

        ink: {
          DEFAULT: '#1E2A32',
          600: '#3A4750',
          400: '#6B7680',
        },

        teal: {
          50: '#EEF5F3',
          100: '#DCEBE6',
          400: '#3A8577',
          500: '#245E52',
          600: '#1B4A41',
          700: '#143530',
        },

        sage: {
          50: '#F2F5F0',
          100: '#E1E9DC',
          400: '#8FA687',
          500: '#748F6B',
        },

        lavender: {
          50: '#F5F2FA',
          200: '#E1D6F0',
          400: '#A78FC9',
        },

        peach: {
          50: '#FCF3EC',
          200: '#F3D9C4',
          400: '#DFA377',
        },

        success: {
          50: '#F0F5EE',
          500: '#5B7F52',
          700: '#3F5A38',
        },

        warning: {
          50: '#FBF2E4',
          500: '#C08A34',
          700: '#8F6423',
        },

        danger: {
          50: '#FBEFEC',
          500: '#B25A46',
          700: '#8A3F2E',
        },

        line: '#EDE6DA',
      },

      /* ============================================================
         FONTS
         ============================================================ */
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },

      /* ============================================================
         SHADOWS
         ============================================================ */
      boxShadow: {
        soft:
          '0 1px 2px rgba(30,42,50,0.04), 0 4px 16px rgba(30,42,50,0.05)',

        card:
          '0 2px 8px rgba(30,42,50,0.045)',

        lift:
          '0 8px 24px rgba(30,42,50,0.09)',
      },

      /* ============================================================
         BORDER RADIUS
         ============================================================ */
      borderRadius: {
        xl2: '1.25rem',
      },

      /* ============================================================
         ANIMATION KEYFRAMES
         ============================================================ */

      keyframes: {
        /* ------------------------------------------------------------
           Floating decorative elements
           ------------------------------------------------------------ */
        float: {
          '0%, 100%': {
            transform: 'translate(0, 0)',
          },

          '50%': {
            transform: 'translate(0, -14px)',
          },
        },

        floatSlow: {
          '0%, 100%': {
            transform: 'translate(0, 0)',
          },

          '50%': {
            transform: 'translate(8px, 10px)',
          },
        },

        /* ------------------------------------------------------------
           ECG / heartbeat line
           ------------------------------------------------------------ */
        drawLine: {
          '0%': {
            strokeDashoffset: 1000,
          },

          '70%': {
            strokeDashoffset: 0,
          },

          '100%': {
            strokeDashoffset: 0,
          },
        },

        /* ------------------------------------------------------------
           Card entrance
           ------------------------------------------------------------ */
        fadeUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        /* ------------------------------------------------------------
           Form/tab transition
           ------------------------------------------------------------ */
        fadeIn: {
          '0%': {
            opacity: '0',
          },

          '100%': {
            opacity: '1',
          },
        },
      },

      /* ============================================================
         ANIMATION UTILITIES
         ============================================================ */
      animation: {
        /* Decorative circle — medium movement */
        float: 'float 6s ease-in-out infinite',

        /* Decorative circle — very slow movement */
        'float-slow': 'floatSlow 9s ease-in-out infinite',

        /* Healthcare ECG animation */
        'draw-line': 'drawLine 3.5s ease-in-out infinite',

        /* Main authentication card */
        'fade-up': 'fadeUp 0.5s ease-out forwards',

        /* Form switching */
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },

  plugins: [],
};