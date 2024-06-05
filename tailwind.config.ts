import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'spotify-green': '#1DB954',
        'spotify-green-dark': '#1aa34a',
        'gray-900': '#181818',
        'gray-800': '#282828',
        'gray-700': '#3e3e3e',
      }
    },
  },
  plugins: [],
};
export default config;
