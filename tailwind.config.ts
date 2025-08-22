import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Mexican-themed colors
        'mexican-red': '#CE1126',
        'mexican-green': '#006847',
        'mexican-gold': '#FFD700',
        'aztec-gold': '#C7941E',
        'maya-blue': '#73C2FB',
        'sunset-orange': '#FF6B35',
        'desert-sand': '#F4E4BC',
        'cactus-green': '#2E8B57',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'ticket-flip': 'ticketFlip 0.6s ease-in-out',
        'number-pop': 'numberPop 0.4s ease-out',
        'mexican-flag': 'mexicanFlag 3s ease-in-out infinite',
        'fiesta': 'fiesta 1s ease-in-out',
        'mariachi': 'mariachi 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(206, 17, 38, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(206, 17, 38, 0.8), 0 0 30px rgba(206, 17, 38, 0.6)' },
        },
        ticketFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        numberPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        mexicanFlag: {
          '0%, 100%': { 
            background: 'linear-gradient(to right, #006847 33%, white 33%, white 66%, #CE1126 66%)',
          },
          '50%': { 
            background: 'linear-gradient(to right, #CE1126 33%, white 33%, white 66%, #006847 66%)',
          },
        },
        fiesta: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(2deg)' },
          '50%': { transform: 'scale(1.2) rotate(0deg)' },
          '75%': { transform: 'scale(1.1) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        mariachi: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mexican-pattern': 'repeating-linear-gradient(45deg, #006847, #006847 10px, #CE1126 10px, #CE1126 20px)',
        'aztec-pattern': 'radial-gradient(circle, #C7941E 1px, transparent 1px)',
      },
      fontFamily: {
        'mexican': ['Playfair Display', 'serif'],
        'festive': ['Dancing Script', 'cursive'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'mexican': '0 4px 20px rgba(206, 17, 38, 0.3)',
        'golden': '0 4px 20px rgba(199, 148, 30, 0.4)',
        'ticket': '0 2px 10px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'ticket-selected': '0 4px 20px rgba(206, 17, 38, 0.4), 0 2px 10px rgba(206, 17, 38, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config