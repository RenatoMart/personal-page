import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background:  '#FAFAF8',
				foreground:  '#1C1B2E',
				primary:     '#6366F1',
				'primary-light': '#EEF2FF',
				secondary:   '#F97316',
				'secondary-light': '#FFF7ED',
				accent:      '#06B6D4',
				muted:       '#6B7280',
				'muted-fg':  '#9CA3AF',
				surface:     '#FFFFFF',
				'surface-2': '#F5F3FF',
				border:      '#E5E7EB',
				'border-strong': '#D1D5DB',
			},
			fontFamily: {
				sans:    ['var(--font-dm-sans)', 'sans-serif'],
				display: ['var(--font-syne)', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-primary':   'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #F97316 100%)',
				'gradient-hero':      'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
				'gradient-card':      'linear-gradient(135deg, #EEF2FF 0%, #FFF7ED 100%)',
			},
			boxShadow: {
				'glow-primary':   '0 0 30px rgba(99, 102, 241, 0.25)',
				'glow-secondary': '0 0 30px rgba(249, 115, 22, 0.2)',
				'card':           '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.08)',
				'card-hover':     '0 4px 16px rgba(0,0,0,0.08), 0 16px 48px rgba(99,102,241,0.15)',
			},
			animation: {
				'blob': 'blob 9s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				blob: {
					'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
					'33%':      { transform: 'translate(30px, -40px) scale(1.08)' },
					'66%':      { transform: 'translate(-20px, 20px) scale(0.94)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%':      { transform: 'translateY(-10px)' },
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
