
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',       // Deep Blue
        secondary: '#3B82F6',     // Bright Blue
        accent: '#F59E0B',        // Amber
        neutral: {
          dark: '#0F172A',        // Slate 900
          mid: '#64748B',         // Slate 500
          light: '#F1F5F9',       // Slate 100
        },
        error: '#DC2626',
        success: '#16A34A',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        h1: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '8px',
        modal: '16px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(15,23,42,0.08)',
        'card-hover': '0 8px 24px rgba(15,23,42,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
