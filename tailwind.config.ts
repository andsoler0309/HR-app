// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: {
  plugins: any[];
  theme: {
    extend: {
      animation: { [key: string]: string };
      keyframes: { [key: string]: { [key: string]: { opacity: string | number } } };
      boxShadow: { md: string; sm: string; lg: string };
      fontSize: { xl: string; "2xl": string; sm: string; xs: string; lg: string; base: string; md: string };
      colors: {
        [key: string]: string;
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
        // Corporate HR color palette
        'corporate-navy': '#1e293b',     // Deep navy for professional look
        'corporate-blue': '#3b82f6',     // Modern blue for primary actions
        'corporate-gray': '#64748b',     // Professional gray
        'corporate-light': '#f8fafc',    // Clean light background
        'corporate-white': '#ffffff',    // Pure white
        'corporate-slate': '#475569',    // Medium slate for text
        'corporate-border': '#e2e8f0',   // Light borders
        
        // Semantic colors - Corporate theme
        background: '#f8fafc',           // Clean light background
        foreground: '#1e293b',           // Dark navy text
        
        // Text variations
        'text-secondary': '#64748b',     // Professional gray
        'text-muted': '#64748b', // Muted gray
        
        // UI Elements
        'card': '#ffffff',               // Clean white cards
        'card-foreground': '#1e293b',    // Dark navy text on cards
        'navbar-border': '#e2e8f0',      // Light border
        'card-border': '#e2e8f0',        // Consistent light borders
        
        // Interactive elements
        'primary': '#3b82f6',            // Professional blue
        'secondary': '#64748b',          // Professional gray
        'accent': '#06b6d4',             // Cyan accent for highlights
        
        // Status colors - Professional palette
        'success': '#10b981',            // Modern green
        'warning': '#f59e0b',            // Professional amber
        'error': '#ef4444',              // Clean red
        'info': '#06b6d4',
        'normal-black': '#000000',        // Pure black
        
        // Additional corporate colors
        'hover': '#f1f5f9',              // Light hover state
        'muted': '#f8fafc',              // Muted background
        'destructive': '#ef4444',        // Red for destructive actions
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
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