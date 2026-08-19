/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      colors: {
        // =========================================================
        // SAATHI CORE
        // =========================================================

        // Main page background
        bg: '#F7F2FA',
        surface: '#FFFBFD',

        ink: {
          900: '#4A3654',
          800: '#302934',
          700: '#5A4C61',
          500: '#756A78',
          400: '#958A99',
          300: '#B9ADBF',
          200: '#DED2E3',
          100: '#E8DDEB',
        },

        brand: {
          plum: '#4A3654',
          violet: '#8064A2',
          coral: '#D95B78',
          'coral-hover': '#C94F6B',
          'coral-soft': '#F7DDE5',
          'violet-soft': '#ECE5F3',
        },

        // =========================================================
        // MENSTRUAL CYCLE PHASES
        // Keep these separate from the general brand palette.
        // =========================================================

        phase: {
          menstrual: '#E85D75',
          'menstrual-light': '#FCE1E6',

          follicular: '#4FA89B',
          'follicular-light': '#D6EEE9',

          ovulation: '#E8A94A',
          'ovulation-light': '#FBEACB',

          luteal: '#6B5B95',
          'luteal-light': '#E8E0F0',
        },

        // =========================================================
        // LEGACY / EXISTING SEMANTIC COLORS
        // Keep these so existing components do not break.
        // Do NOT use these for new brand decisions.
        // =========================================================

        rose: {
          50: '#FDF2F4',
          100: '#FCE1E6',
          200: '#F8C2CD',
          300: '#F19DAE',
          400: '#EA7C93',
          500: '#E96A78',
          600: '#C43F58',
          700: '#9E2F45',
        },

        plum: {
          50: '#F5F2F9',
          100: '#E8E0F0',
          300: '#B8A3CC',
          500: '#6B5B95',
          600: '#564879',
          700: '#443A61',
        },

        teal: {
          50: '#EDF7F5',
          100: '#D6EEE9',
          300: '#9BD4C8',
          400: '#7BC2B5',
          500: '#4FA89B',
          600: '#3D8579',
          700: '#2F675E',
        },

        amber: {
          50: '#FDF6EB',
          100: '#FBEACB',
          400: '#F0BC72',
          500: '#E8A94A',
          600: '#C88C31',
        },
      },

      // ===========================================================
      // SHADOWS — SOFT, NOT HEAVY
      // ===========================================================

      boxShadow: {
        soft: '0 2px 8px rgba(67, 44, 74, 0.06)',
        card: '0 4px 20px rgba(67, 44, 74, 0.08)',
        lift: '0 12px 32px rgba(67, 44, 74, 0.12)',
      },

      borderRadius: {
        xl2: '1.25rem',
      },

      keyframes: {
        fadeIn: {
          '0%': {
            opacity: 0,
            transform: 'translateY(6px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },

        slideUp: {
          '0%': {
            opacity: 0,
            transform: 'translateY(16px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },

        toastIn: {
          '0%': {
            opacity: 0,
            transform: 'translateY(-8px) scale(0.98)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          },
        },
      },

      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        slideUp: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        toastIn: 'toastIn 0.25s ease-out both',
      },
    },
  },

  plugins: [],
}