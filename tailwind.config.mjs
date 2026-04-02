/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          gray: '#d1d1d1',
          teal: '#10b2ad',
          white: '#ffffff',
        },
      },
      fontFamily: {
        headline: ['Rufina', 'serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
