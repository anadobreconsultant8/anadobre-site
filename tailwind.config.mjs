/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Core blues
        'primary-darkest': '#021B3D',   // navbar bg, footer bg
        'primary-dark':    '#03306E',   // alias (same as primary, named semantically)
        'primary':         '#03306E',   // H1/H2/H3 titles, secondary buttons, logo text
        'primary-light':   '#2B6DB8',   // hover pe linkuri text
        'primary-hover':   '#023D8A',   // alias hover

        // CTA / interactive
        'accent':          '#E8593C',   // butoane CTA principale (coral)
        'accent-hover':    '#D04A2E',   // hover pe butoane CTA
        'accent-blue':     '#0249A5',   // albastru accent secundar

        // Backgrounds
        'bg-secondary':    '#EEF4FA',   // fundal secțiuni alternate
        'bg-tertiary':     '#D6E6F5',   // badge pills, borduri carduri

        // Accent decorativ (step numbers, checkmarks, iconuri mici)
        'accent-warm':     '#C9880C',

        // Text
        'text-primary':    '#1A1A2E',   // body text
        'text-secondary':  '#4A5568',   // descrieri, text secundar
        'text-tertiary':   '#8E99A4',   // meta, labels

        // Borders
        'border':          '#E2E8F0',

        // Status (mini-audit)
        'success':         '#1D9E75',
        'warning':         '#BA7517',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
