/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          900: "#0c4a6e"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(2, 8, 23, 0.08)"
      }
    }
  },
  plugins: []
};

