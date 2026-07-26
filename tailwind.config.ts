import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#050816',
        'navy-deep': '#0a0a1a',
        accent: '#818cf8',
        'accent-mid': '#6366f1',
        'accent-dark': '#4f46e5',
        muted: '#aaa6c3',
        dimmed: '#64648a',
        surface: '#f4f4f6',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-strong': '0 0 30px rgba(99, 102, 241, 0.3)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
