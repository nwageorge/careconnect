/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"Sora Variable"', 'Sora', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// OnePermit-style warm pastels (see index.css for the gradients and glass)
  			ink: { DEFAULT: '#1A1A2E', soft: '#4A4A6A' },
  			coral: '#FF6B6B',
  			joy: {
  				blush: '#FFF5F5',
  				lilac: '#F3E5F5',
  				lavender: '#E6E6FA',
  				peach: '#FFDAB9',
  				pink: '#FFB7B2',
  				cream: '#FFFDD0',
  				mist: '#E0F7FA'
  			},
  			// Stone is driven by CSS variables so dark mode can flip the whole scale (see index.css)
  			stone: {
  				'50': 'rgb(var(--stone-50) / <alpha-value>)',
  				'100': 'rgb(var(--stone-100) / <alpha-value>)',
  				'200': 'rgb(var(--stone-200) / <alpha-value>)',
  				'300': 'rgb(var(--stone-300) / <alpha-value>)',
  				'400': 'rgb(var(--stone-400) / <alpha-value>)',
  				'500': 'rgb(var(--stone-500) / <alpha-value>)',
  				'600': 'rgb(var(--stone-600) / <alpha-value>)',
  				'700': 'rgb(var(--stone-700) / <alpha-value>)',
  				'800': 'rgb(var(--stone-800) / <alpha-value>)',
  				'900': 'rgb(var(--stone-900) / <alpha-value>)',
  				'950': 'rgb(var(--stone-950) / <alpha-value>)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};