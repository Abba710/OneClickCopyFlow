/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/popup/**/*.html", // Путь к HTML файлам
    "./src/popup/**/*.js", // Путь к JS файлам, если они есть
    "./src/popup/**/*.css", // Путь к CSS файлам
  ],
  theme: {
    extend: {
      colors: {
        "scroll-thumb": "#888", // Цвет ползунка
        "scroll-track": "#f1f1f1", // Цвет области прокрутки
        "scroll-thumb-hover": "#555", // Цвет ползунка при наведении
      },
      spacing: {
        "scrollbar-width": "8px", // Ширина полосы прокрутки
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addComponents }) {
      addComponents({
        ".scrollbar": {
          /* Стиль для полосы прокрутки */
          "&::-webkit-scrollbar": {
            width: "var(--scrollbar-width)", // Тонкая полоса прокрутки
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--scroll-thumb)", // Цвет ползунка
            borderRadius: "4px", // Скругление углов
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "var(--scroll-thumb-hover)", // Цвет ползунка при наведении
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "var(--scroll-track)", // Цвет области прокрутки
            borderRadius: "4px",
          },
        },
      });
    },
  ],
};
