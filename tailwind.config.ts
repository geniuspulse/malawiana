import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { 600: '#059669', 700: '#047857', 800: '#065f46' },
        gray: {
          50: '#f9fafb',
          55: '#f7f8fa',
          100: '#f3f4f6',
          150: '#eaecef',
          200: '#e5e7eb',
          300: '#d1d5db',
          350: '#b5bcc8',
          400: '#9ca3af',
          450: '#828a96',
          500: '#6b7280',
          550: '#596169',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          850: '#181f29',
          900: '#111827',
          950: '#030712',
        },
        slate: {
          50: '#f8fafc',
          600: '#475569',
          700: '#334155',
          750: '#293548',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    }
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
