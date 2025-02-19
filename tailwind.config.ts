import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode palette
        dark: {
          bg: {
            primary: '#111827',    // Gray-900
            secondary: '#1f2937',  // Gray-800
            tertiary: '#374151',   // Gray-700
          },
          text: {
            primary: '#f9fafb',    // Gray-50
            secondary: '#e5e7eb',  // Gray-200
            tertiary: '#9ca3af',   // Gray-400
            muted: '#6b7280',      // Gray-500
          },
          border: '#374151',       // Gray-700
          accent: {
            blue: '#3b82f6',
            green: '#10b981',
            red: '#ef4444',
            yellow: '#f59e0b',
          }
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
