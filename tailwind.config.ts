/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Make sure this path is valid in your project structure.
  ],
  theme: {
    extend: {
      dropShadow: {
        glowBlue: [
          '0px 0px 2px #000',
          '0px 0px 4px #000',
          '0px 0px 30px #0141ff',
          '0px 0px 100px #0141ff80',
        ],
        glowRed: [
          '0px 0px 2px #f00',
          '0px 0px 4px #000',
          '0px 0px 15px #ff000040',
          '0px 0px 30px #f00',
          '0px 0px 100px #ff000080',
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Add any other theme extensions from the Vercel project here if needed
    },
  },
  plugins: [
    // Add any plugins from both configurations if needed
  ],
};
