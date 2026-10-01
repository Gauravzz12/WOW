import type { Config } from "tailwindcss";

const svgToDataUri = require("mini-svg-data-uri");
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Standard template backgrounds & text
    'bg-[#FDFBF7]', 'dark:bg-[#1C1613]',
    'text-[#3D2C24]', 'dark:text-[#F5EBE6]',
    'bg-[#F4F4F5]', 'dark:bg-[#0E0E11]',
    'text-[#18181B]', 'dark:text-[#F4F4F5]',
    'bg-[#EFF6FF]', 'dark:bg-[#070D18]',
    'text-[#1e3a5f]', 'dark:text-[#bfdbfe]',
    'bg-[#EBF7EE]', 'dark:bg-[#051109]',
    'text-[#064E22]', 'dark:text-[#6ee7b7]',
    'bg-[#F4ECD8]', 'dark:bg-[#1E1914]',
    'text-[#3E2723]', 'dark:text-[#EDE3D2]',
    'bg-neutral-100', 'dark:bg-black',
    'text-[#171717]', 'dark:text-[#f5f5f5]',
    'bg-[#FFF1F2]', 'dark:bg-[#200D13]',
    'text-[#4c0519]', 'dark:text-[#fecdd3]',
    'bg-[#ECE6D8]', 'dark:bg-[#151517]',
    'text-[#1a1a1a]', 'dark:text-[#e5e5e5]',
    // VIP template gradients & text
    'from-[#1C1304]', 'via-[#0E0A02]', 'to-[#2B1D06]',
    'text-[#FEF3C7]', 'dark:text-[#FEF3C7]',
    'from-[#290714]', 'via-[#140209]', 'to-[#3B0A1D]',
    'text-[#FFE4E6]', 'dark:text-[#FFE4E6]',
    'from-[#031326]', 'via-[#010914]', 'to-[#06203D]',
    'text-[#E0F2FE]', 'dark:text-[#E0F2FE]',
    'from-[#081C13]', 'via-[#040D09]', 'to-[#0E2C1E]',
    'text-[#ECFDF5]', 'dark:text-[#ECFDF5]',
    'from-[#0C0B12]', 'via-[#020204]', 'to-[#0A0910]',
    'text-[#F3E8FF]', 'dark:text-[#F3E8FF]',
    // Borders
    'border-amber-900/15', 'dark:border-amber-500/25',
    'border-neutral-300', 'dark:border-neutral-800',
    'border-blue-200', 'dark:border-blue-900/40',
    'border-emerald-300', 'dark:border-emerald-500/30',
    'border-amber-900/20', 'dark:border-amber-500/25',
    'border-rose-200', 'dark:border-rose-900/40',
    'border-neutral-400', 'dark:border-neutral-700',
    'border-amber-400/50', 'border-rose-400/50', 'border-cyan-400/50', 'border-emerald-400/50', 'border-purple-400/50',
    // Category badges
    'bg-rose-500/15', 'dark:bg-rose-400/20', 'text-rose-700', 'dark:text-rose-300', 'border-rose-500/30', 'dark:border-rose-400/40',
    'bg-amber-500/15', 'dark:bg-amber-400/20', 'text-amber-700', 'dark:text-amber-300', 'border-amber-500/30', 'dark:border-amber-400/40',
    'bg-purple-500/15', 'dark:bg-purple-400/20', 'text-purple-700', 'dark:text-purple-300', 'border-purple-500/30', 'dark:border-purple-400/40',
    'bg-teal-500/15', 'dark:bg-teal-400/20', 'text-teal-700', 'dark:text-teal-300', 'border-teal-500/30', 'dark:border-teal-400/40',
    'bg-blue-500/15', 'dark:bg-blue-400/20', 'text-blue-700', 'dark:text-blue-300', 'border-blue-500/30', 'dark:border-blue-400/40',
    'bg-cyan-500/15', 'dark:bg-cyan-400/20', 'text-cyan-700', 'dark:text-cyan-300', 'border-cyan-500/30', 'dark:border-cyan-400/40',
    'bg-red-500/15', 'dark:bg-red-400/20', 'text-red-700', 'dark:text-red-300', 'border-red-500/30', 'dark:border-red-400/40',
    'bg-violet-500/15', 'dark:bg-violet-400/20', 'text-violet-700', 'dark:text-violet-300', 'border-violet-500/30', 'dark:border-violet-400/40',
    // Creative premium template backgrounds, text, borders (k-p)
    'bg-[#0A0F1E]', 'text-[#a5f3fc]', 'border-cyan-400/40',
    'bg-[#0D0D0D]', 'text-[#39FF14]', 'border-[#39FF14]/50',
    'bg-[#1A0A00]', 'text-[#FFA07A]', 'border-orange-400/40',
    'bg-[#05071A]', 'text-[#E8DAFF]', 'border-violet-400/30',
    'bg-[#F5F0E8]', 'dark:bg-[#1C1A15]', 'text-[#5C4A32]', 'dark:text-[#D4B896]', 'border-amber-800/20', 'dark:border-amber-600/25',
    'bg-[#1A0A2E]', 'text-[#E9D5FF]', 'border-purple-400/40',
    // Font utilities
    'font-playfair', 'font-outfit', 'font-caveat', 'font-cinzel',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "rgb(var(--bg-default) / <alpha-value>)",
          muted: "rgb(var(--bg-muted) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        },
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        accent: {
          love: "#E11D48",
          celebration: "#F59E0B",
          confession: "#4F46E5",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
        caveat: ["var(--font-caveat)", "cursive"],
        cinzel: ["var(--font-cinzel)", "'Times New Roman'", "serif"],
        mono: ["var(--font-mono)", "'Courier New'", "monospace"],
      }
    },
  },
  plugins: [
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-grid": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};
export default config;
