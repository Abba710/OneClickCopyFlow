/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/popup/**/*.html", // Путь к HTML файлам
    "./src/popup/**/*.js", // Путь к JS файлам, если они есть
    "./src/popup/**/*.css", // Путь к CSS файлам
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
