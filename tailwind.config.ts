// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: {
  plugins: any[];
  theme: {
    extend: {
      boxShadow: { md: string; sm: string; lg: string };
      fontSize: { xl: string; "2xl": string; sm: string; xs: string; lg: string; base: string };
      colors: {
        foreground: string;
        "text-muted": string;
        error: string;
        "rich-black": string;
        accent: string;
        "text-secondary": string;
        secondary: string;
        "card-border": string;
        platinum: string;
        "navbar-border": string;
        background: string;
        success: string;
        sunset: string;
        warning: string;
        flame: string;
        card: string;
        vanilla: string;
        primary: string;
        info: string
      }
    }
  };
  content: string[]
} = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
      colors: {
        // Base palette
        // 'rich-black': '#050517',
        // 'flame': '#CF5C36',
        // 'sunset': '#EFC88B',
        // 'vanilla': '#F4E3B2',
        // 'platinum': '#D3D5D7',
        'rich-black': '#050517',
        'flame': '#e8673c',
        'sunset': '#edc585',
        'vanilla': '#F4E3B2',
        'platinum': '#fafafa',
        
        
        // Semantic colors
        background: '#050517',    // rich black
        foreground: '#D3D5D7',    // platinum
        
        // Text variations
        'text-secondary': '#EFC88B',  // sunset
        'text-muted': 'rgb(211 213 215 / 0.7)',
        
        // UI Elements
        // 'card': 'rgb(5 5 23 / 0.8)',
        'card': 'rgb(5 5 23 / 0.8)',
        'navbar-border': 'rgb(207 92 54 / 0.4)',
        'card-border': 'rgba(203,203,203,0.8)',
        
        // Interactive
        'primary': '#CF5C36',     // flame
        'secondary': '#EFC88B',   // sunset
        'accent': '#F4E3B2',      // vanilla
        
        // Status
        'success': '#4CAF50',
        'warning': '#EFC88B',     // sunset
        'error': '#CF5C36',       // flame
        'info': '#F4E3B2',        // vanilla
      },
      boxShadow: {
        'sm': '0 2px 4px rgb(5 5 23 / 0.3)',
        'md': '0 4px 6px rgb(5 5 23 / 0.4)',
        'lg': '0 10px 15px rgb(5 5 23 / 0.5)',
      },
      fontSize: {
        // Or define custom sizes:
        'xs': '0.75rem',
        'sm': '0.875rem',
        'md': '1rem',       // 16px
        'base': '1.125rem',    // 18px
        'lg': '1.25rem',
        'xl': '1.5rem',
        '2xl': '2rem'
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};

export default config;