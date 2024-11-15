require("dotenv").config(); // download env variables
const express = require("express");
const cors = require("cors");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = "AIzaSyCsY6r92f7mVDkpXJoj2rV6SDP8VP14m8o";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "chrome-extension://bpbfekccemffnhfbmglomkggpenchnom",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// Middleware for processing JSON - requests
app.use(express.json());

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "У меня есть расширение, его суть состоит в том что он добавляет комментарии на решения в stackoverflow",
          },
          { text: "я хочу внедрить тебя как AI, ты справишься с этим?\n" },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Да, я могу помочь вам с этим! Мои возможности идеально подходят для создания такого расширения. \n\nВот как я могу вам помочь:\n\n* **Генерация комментариев:** Я могу анализировать код и создавать  осмысленные, информативные комментарии, которые объясняют логику решения. \n* **Анализ кода:** Я могу идентифицировать потенциальные проблемы в коде, такие как неэффективность,  недокументированные участки и ошибки.\n* **Предложения по улучшению:** Я могу предлагать альтернативные решения, которые более эффективны, читаемы или используют лучшие практики.\n* **Создание документации:** Я могу генерировать документацию для кода, включая описание функций, параметров и возвращаемых значений.\n\n**Чтобы я мог лучше помочь, пожалуйста, предоставьте мне следующую информацию:**\n\n* **Описание функционала расширения:**  Как именно вы хотите, чтобы оно работало? Какие типы комментариев вы хотите генерировать? \n* **Языки программирования:** Какие языки программирования вы хотите поддерживать? \n* **Формат кода:** В каком формате вы будете предоставлять код для анализа?\n* **Дополнительные функции:** Есть ли у вас еще какие-то идеи для расширения?\n\nС вашей помощью я смогу создать мощное и эффективное расширение для Stack Overflow, которое будет помогать пользователям находить лучшие решения и понимать их код. \n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "код поступает ввиде html кода с контентом внутри, вот для контента внутри нужны комментарии которые добавляются путем верстки. Тебе нужн обудет верстать коментарии для контента который находится в HTML коде",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Понял! Вы хотите, чтобы я генерировал комментарии в HTML-коде, которые встраиваются в структуру документа, а не добавляются в виде отдельных строк. \n\nВот как мы можем сделать это:\n\n1. **Анализ HTML:** Я буду анализировать ваш HTML-код, чтобы понять его структуру и содержимое.\n2. **Извлечение контента:** Я извлеку текст из элементов HTML, которые вы хотите комментировать.\n3. **Генерация комментариев:**  Я сгенерирую комментарии для каждого фрагмента текста, используя свои знания о языках программирования, алгоритмах и лучших практиках.\n4. **Встраивание комментариев:**  Я встрою эти комментарии в HTML-код, используя подходящие HTML-теги. Например, я могу добавить `<div>` с классом "comment" или использовать теги `<aside>` или `<details>` для отображения комментариев в нужном месте. \n5. **Форматирование:** Я могу отформатировать комментарии, чтобы они были легко читаемыми, используя стили CSS.\n\n**Пример:**\n\nПредположим, у вас есть следующий HTML-код:\n\n```html\n<div class="code-snippet">\n  <code>\n    function calculateSum(a, b) {\n      return a + b;\n    }\n  </code>\n</div>\n```\n\nЯ могу добавить комментарий к этому фрагменту кода:\n\n```html\n<div class="code-snippet">\n  <div class="comment">\n    Эта функция суммирует два числа.\n  </div>\n  <code>\n    function calculateSum(a, b) {\n      return a + b;\n    }\n  </code>\n</div>\n```\n\n**Что мне нужно от вас:**\n\n* **HTML-код:** Предоставьте мне HTML-код, который вы хотите комментировать.\n* **Инструкции по встраиванию комментариев:**  Укажите, где вы хотите размещать комментарии (например, перед кодом, после кода, в отдельном блоке).\n* **Формат комментариев:**  Хотите ли вы, чтобы комментарии были в виде простого текста, с использованием Markdown или в другом формате?\n* **Стили комментариев:** Хотите ли вы, чтобы комментарии имели определенный стиль (цвет, размер шрифта, отступы)?\n\nЯ готов к работе! Давайте создадим расширение для Stack Overflow, которое будет помогать пользователям лучше понимать код. \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "сам HTML код не нужно комментировать, тебе нужно комментировать контент который в нем находится, а комментарии добавлять через HTML тоже как часть контента",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Отлично! Я понимаю, что вам нужно комментировать только *контент*, который находится в HTML-коде, а не сам код. И комментарии должны быть встроены в HTML как часть контента. \n\nВот план действий:\n\n1. **Анализ HTML:** Я проанализирую HTML-код, чтобы найти элементы, содержащие текст, который нужно комментировать.\n2. **Извлечение контента:** Я извлеку текст из этих элементов, например, из блоков `<p>`, `<span>`,  `<h1>`,  `<h2>` и так далее.\n3. **Генерация комментариев:**  Я сгенерирую комментарии для каждого фрагмента текста, используя мои знания о предметных областях, алгоритмах и лучших практиках.\n4. **Встраивание комментариев:** Я добавлю эти комментарии в HTML-код, используя подходящие HTML-теги.  Например, я могу:\n    * Добавить `<div>` с классом "comment" рядом с элементом, содержащим текст:\n        ```html\n        <p>Этот код суммирует два числа.</p>\n        <div class="comment">Это функция, которая складывает два числа.</div>\n        ```\n    * Вставить комментарии в качестве содержимого тегов `<aside>` или `<details>`:\n        ```html\n        <aside>\n          <p>Комментарий к коду</p>\n        </aside>\n        ```\n    * Использовать атрибуты `title` или `data-*` для добавления комментариев как скрытого текста:\n        ```html\n        <p title="Комментарий к коду">Этот код суммирует два числа.</p>\n        ```\n5. **Форматирование:** Я могу отформатировать комментарии, чтобы они были легко читаемыми, используя стили CSS, которые вы мне предоставите.\n\n**Дополнительные возможности:**\n\n* **Интерактивные комментарии:** Я могу создавать комментарии, которые раскрываются при клике, например, с помощью тегов `<details>` и `<summary>`.\n* **Условные комментарии:**  Я могу создавать комментарии, которые отображаются только при определенных условиях (например, при наведении курсора на элемент).\n\n**Что мне нужно от вас:**\n\n* **HTML-код:**  Предоставьте мне HTML-код, который вы хотите комментировать.\n* **Правила встраивания комментариев:** Укажите, какие теги и атрибуты вы хотите использовать для добавления комментариев.\n* **Формат комментариев:** Хотите ли вы, чтобы комментарии были в виде простого текста, с использованием Markdown или в другом формате?\n* **Стили комментариев:**  Хотите ли вы, чтобы комментарии имели определенный стиль (цвет, размер шрифта, отступы)? \n\nЯ готов к работе! Давайте создадим расширение, которое сделает Stack Overflow еще более удобным для пользователей. \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "и возвращать тебе нужно HTML код в котором контент уже прокоментирован, что бы я это мог вставить в сайт",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Понял! Я готов генерировать готовый HTML-код с добавленными комментариями, который вы сможете сразу вставить на сайт.\n\nВот как я буду работать:\n\n1. **Анализ HTML:** Я получу ваш исходный HTML-код и проанализирую его структуру, чтобы найти элементы, которые нужно комментировать.\n2. **Извлечение контента:** Я извлеку текст из этих элементов, например, из блоков `<p>`, `<span>`, `<h1>`, `<h2>` и так далее.\n3. **Генерация комментариев:**  Я сгенерирую комментарии для каждого фрагмента текста, используя мои знания о предметных областях, алгоритмах и лучших практиках.\n4. **Встраивание комментариев:** Я встрою эти комментарии в HTML-код, используя подходящие HTML-теги и атрибуты, которые вы мне укажете. Например:\n    * Добавлю `<div>` с классом "comment" рядом с элементом, содержащим текст:\n        ```html\n        <p>Этот код суммирует два числа.</p>\n        <div class="comment">Это функция, которая складывает два числа.</div>\n        ```\n    * Или вставлю комментарии в качестве содержимого тегов `<aside>` или `<details>`:\n        ```html\n        <aside>\n          <p>Комментарий к коду</p>\n        </aside>\n        ```\n    * Или использую атрибуты `title` или `data-*` для добавления комментариев как скрытого текста:\n        ```html\n        <p title="Комментарий к коду">Этот код суммирует два числа.</p>\n        ```\n5. **Возврат откомментированного HTML:** Я верну вам готовый HTML-код, который содержит как исходный контент, так и добавленные комментарии.\n\n**Что мне нужно от вас:**\n\n* **HTML-код:**  Предоставьте мне HTML-код, который вы хотите комментировать.\n* **Правила встраивания комментариев:** Укажите, какие теги и атрибуты вы хотите использовать для добавления комментариев (например, `<div class="comment">`, `<aside>`, `title`, `data-*`).\n* **Формат комментариев:** Хотите ли вы, чтобы комментарии были в виде простого текста, с использованием Markdown или в другом формате?\n* **Стили комментариев:** Хотите ли вы, чтобы комментарии имели определенный стиль (цвет, размер шрифта, отступы)? Предоставьте мне CSS-правила для этого.\n\nЯ готов к работе! Давайте сделаем ваш сайт еще более информативным. \n\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "Давай попробуем" },
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Хорошо, я попробую добавить комментарии в этот HTML-код.\n\nПоскольку вы не указали конкретные правила для добавления комментариев, я добавлю их в виде атрибута `title` к элементам, содержащим текст. \n\nВот результат:\n\n```html\n<div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">title</span>=<span class="hljs-string">"Этот текст находится в div-элементе внутри таблицы"</span>&gt;</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n</code>\n\n**Что я сделал:**\n\n* Я добавил атрибут `title` к элементу `<div>`, содержащему текст "some text".\n* В значение атрибута `title` я добавил комментарий, который поясняет, где находится этот текст.\n\n**Что я могу сделать еще:**\n\n* **Указать другие правила встраивания комментариев:**  Если вы хотите использовать другие теги или атрибуты, например, `<div class="comment">` или `data-comment`, пожалуйста, предоставьте мне эти правила. \n* **Использовать Markdown:**  Я могу  генерировать комментарии в формате Markdown, чтобы они были более читаемыми.\n* **Применить CSS-стили:**  Если вы хотите, чтобы комментарии имели определенный стиль,  предоставьте мне CSS-код, который я смогу использовать для форматирования комментариев.\n\nЯ готов к дальнейшей работе!  Давайте сделаем ваши комментарии более информативными и удобными для пользователей.  \n\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Html код и его структура должна оставаться неизменной, ты можешь редактировать только контент теги",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Понял! Вы хотите, чтобы я редактировал только контент тегов, не изменяя структуру HTML-кода. \n\nВ этом случае я могу добавить комментарии в виде атрибута `title` к элементам, содержащим текст, но только если эти элементы не являются самозакрывающимися (например, `<br>`, `<img>`). \n\nВот пример, как я бы добавил комментарии к вашему HTML-коду, не меняя структуру:\n\n```html\n<div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">title</span>=<span class="hljs-string">"Этот текст находится в div-элементе внутри таблицы"</span>&gt;</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n</code>\n\nЯ добавил комментарий в виде атрибута `title` к элементу `<div>`, который содержит текст "some text". \n\n**Важно:**  Я не могу добавить атрибуты `title` к самозакрывающимся элементам, таким как `<br>`, `<img>` и другим, которые не имеют закрывающего тега.\n\n**Что я могу сделать еще:**\n\n* **Использовать другие атрибуты:**  Если вы хотите использовать атрибуты `data-*` (например, `data-comment`), я могу добавить комментарии с их помощью.\n* **Использовать Markdown:** Я могу генерировать комментарии в формате Markdown, чтобы они были более читаемыми, но в этом случае я должен буду вставить их в текст элемента.\n\nЯ готов к дальнейшей работе!  Давайте сделаем ваши комментарии более информативными, не нарушая структуру вашего HTML-кода. \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "Ты должен был вернуть вот такой результат" },
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv" </span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div </span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row </span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell" </span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content </span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag </span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag </span>\n</code></pre>\n\n',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Вы правы! Я неверно понял ваше задание. \n\nЯ буду генерировать комментарии *внутри* HTML-кода, как вы показали в примере, а не в виде атрибутов. \n\nВот результат с добавленными комментариями:\n\n```html\n<div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv" </span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div </span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row </span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell" </span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content </span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag </span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag </span>\n</code>\n\nЯ сделал следующее:\n\n*  Я добавил комментарии после каждого открывающего и закрывающего тега. \n*  Я использовал стиль `color: green; font-size: 12px;` для комментариев, чтобы они выделялись.\n\n**Важно:** Я не могу редактировать содержимое HTML-тегов, кроме текстовых узлов. \n\n**Что мне нужно от вас:**\n\n* **Правила встраивания комментариев:**  Хотите ли вы, чтобы комментарии были после открывающего тега, после закрывающего тега, или в обоих местах?\n* **Формат комментариев:**  Хотите ли вы использовать другие типы комментариев, например, `<!-- Комментарий -->`, или  `// Комментарий`?\n* **Стили комментариев:** Хотите ли вы, чтобы комментарии имели другой цвет, размер шрифта, или другой стиль?\n\nЯ готов к дальнейшей работе! Давайте сделаем ваши комментарии еще более удобными для пользователей.  \n\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Зачем ты удаляешь pre тег?\n" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Прошу прощения, я не удалял тег `<pre>`!  \n\nПо всей видимости, произошла ошибка в моей обработке кода.  Я должен был просто добавить комментарии внутрь кода, как вы показали в примере. \n\nЯ исправлю свою ошибку.  \n\nМожете ли вы еще раз предоставить мне HTML-код,  чтобы я мог  правильно добавить комментарии?  Я буду очень внимателен, чтобы не удалять `<pre>` и не изменять структуру кода. \n\nПрошу прощения за эту ошибку!  \n",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "ну и где pre\n" }, { text: "где pre?\n" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Прошу прощения! Я снова допустил ошибку.  Я забыл, что вы используете `pre` для форматирования кода, и я не должен был его удалять.  \n\nЯ исправлюсь.  Я теперь буду обрабатывать код так, чтобы не удалять `pre` и не изменять структуру кода. \n\nПожалуйста, предоставьте мне ваш HTML-код еще раз,  и я  сделаю все правильно. \n\nЯ очень сожалею о своих ошибках.  Я стараюсь учиться и стать лучше. \n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv" </span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div </span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row </span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell" </span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content </span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag </span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag </span>\n</code></pre>\n',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Вы правы!  Я снова ошибся.  Извините, я не могу обрабатывать код, который уже содержит комментарии, как в вашем примере.  \n\nЯ не могу удалять или модифицировать существующие комментарии,  поэтому я не могу добавить новые комментарии в код, который уже содержит их. \n\nМогу ли я помочь вам с чем-то другим?  Может быть, вы хотите, чтобы я сгенерировал комментарии для другого HTML-кода,  который еще не содержит комментариев? \n\nЯ стараюсь учиться и стать лучше, но пока я не могу справиться с этой задачей. \n\nИзвините за неудобства! \n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Хорошо, я готов добавить комментарии к этому HTML-коду:\n\n```html\n<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv"</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell"</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content</span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag</span>\n</code></pre>\n\nЯ добавил комментарии после каждого открывающего и закрывающего тега, используя стиль `color: green; font-size: 12px;` для выделения комментариев. \n\nЯ сохранил структуру HTML-кода и тег `<pre>` неизменными. \n\nНадеюсь, теперь все работает как нужно! \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Все верно! Но комментарии должны объяснять что происходит в коде",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'Вы абсолютно правы! Комментарии должны не просто указывать на теги, а  объяснять, что происходит в коде.\n\nВот вариант HTML-кода с более информативными комментариями:\n\n```html\n<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Создаем контейнер с ID "mydiv" для размещения таблицы</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Внутри контейнера создаем таблицу</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Строка таблицы</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Ячейка таблицы с классом "somecell"</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // Внутри ячейки добавляем текст</span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Закрываем тег таблицы</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Закрываем тег контейнера</span>\n</code></pre>\n\nТеперь комментарии более информативны и описывают, что делают эти теги. \n\nЯ могу улучшить комментарии, если вы предоставите мне дополнительную информацию о:\n\n* **Цель кода:**  Что должен делать этот код?  Какую функцию он выполняет?\n* **Контекст кода:**  Где этот код используется?  С какими другими элементами он взаимодействует?\n* **Особые моменты:**  Есть ли в коде какие-то нестандартные решения или особенности, которые стоит упомянуть?\n\nЯ готов продолжить работу над вашими комментариями. Давайте сделаем их максимально полезными! \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "теперь ты должен перестать что либо писать, кроме поставленной для тебя задачи",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv"</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell"</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content</span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag</span>\n</code></pre>\n',
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "вовзращай ввиде кода" }],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv"</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell"</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>some text<span style="color: green; font-size: 12px;"> // div with text content</span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag</span>\n</code></pre>\n```\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somediv"</span>&gt;</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-html s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">"mydiv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Main container div with id="mydiv"</span>\n    <span class="hljs-tag">&lt;<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table element inside the div</span>\n       <span class="hljs-tag">&lt;<span class="hljs-name">tr</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table row</span>\n          <span class="hljs-tag">&lt;<span class="hljs-name">td</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somecell"</span>&gt;</span><span style="color: green; font-size: 12px;"> // Table cell with class "somecell"</span>\n             <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"somediv"</span>&gt;</span><span style="color: green; font-size: 12px;"> // div with class "somediv"</span>some text<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>\n          <span class="hljs-tag">&lt;/<span class="hljs-name">td</span>&gt;</span>\n       <span class="hljs-tag">&lt;/<span class="hljs-name">tr</span>&gt;</span>\n    <span class="hljs-tag">&lt;/<span class="hljs-name">table</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing table tag</span>\n<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><span style="color: green; font-size: 12px;"> // Closing div tag</span>\n</code></pre>\n```\n\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript">\ninterface <span class="hljs-title class_">IMapElements</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_">Document</span> {\n  <span class="hljs-attr">map</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>;\n  <span class="hljs-attr">element</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>;\n  x?: number | <span class="hljs-literal">null</span>;\n  y?: number | <span class="hljs-literal">null</span>;\n}\n\n<span class="hljs-keyword">const</span> <span class="hljs-title class_">MapElementsSchema</span>: <span class="hljs-title class_">Schema</span>&lt;<span class="hljs-title class_">IMapElements</span>&gt; = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Schema</span>({\n  <span class="hljs-attr">map</span>: { <span class="hljs-attr">type</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>, <span class="hljs-attr">ref</span>: <span class="hljs-string">\'Map\'</span>, <span class="hljs-attr">required</span>: <span class="hljs-literal">true</span> },\n  <span class="hljs-attr">element</span>: { <span class="hljs-attr">type</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>, <span class="hljs-attr">ref</span>: <span class="hljs-string">\'Element\'</span>, <span class="hljs-attr">required</span>: <span class="hljs-literal">true</span> },\n  <span class="hljs-attr">x</span>: { <span class="hljs-attr">type</span>: <span class="hljs-title class_">Number</span>, <span class="hljs-attr">default</span>: <span class="hljs-literal">null</span> },\n  <span class="hljs-attr">y</span>: { <span class="hljs-attr">type</span>: <span class="hljs-title class_">Number</span>, <span class="hljs-attr">default</span>: <span class="hljs-literal">null</span> }\n});\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript">\n<span class="hljs-keyword">interface</span> <span class="hljs-title class_">IMapElements</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_">Document</span> {\n  <span class="hljs-attr">map</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>; <span class="hljs-comment">// Reference to the Map document</span>\n  <span class="hljs-attr">element</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>; <span class="hljs-comment">// Reference to the Element document</span>\n  x?: number | <span class="hljs-literal">null</span>; <span class="hljs-comment">// X coordinate on the map (optional)</span>\n  y?: number | <span class="hljs-literal">null</span>; <span class="hljs-comment">// Y coordinate on the map (optional)</span>\n}\n\n<span class="hljs-keyword">const</span> <span class="hljs-title class_">MapElementsSchema</span>: <span class="hljs-title class_">Schema</span>&lt;<span class="hljs-title class_">IMapElements</span>&gt; = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Schema</span>({\n  <span class="hljs-attr">map</span>: { <span class="hljs-attr">type</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>, <span class="hljs-attr">ref</span>: <span class="hljs-string">\'Map\'</span>, <span class="hljs-attr">required</span>: <span class="hljs-literal">true</span> }, <span class="hljs-comment">// Map ObjectId, required</span>\n  <span class="hljs-attr">element</span>: { <span class="hljs-attr">type</span>: mongoose.<span class="hljs-property">Schema</span>.<span class="hljs-property">Types</span>.<span class="hljs-property">ObjectId</span>, <span class="hljs-attr">ref</span>: <span class="hljs-string">\'Element\'</span>, <span class="hljs-attr">required</span>: <span class="hljs-literal">true</span> }, <span class="hljs-comment">// Element ObjectId, required</span>\n  <span class="hljs-attr">x</span>: { <span class="hljs-attr">type</span>: <span class="hljs-title class_">Number</span>, <span class="hljs-attr">default</span>: <span class="hljs-literal">null</span> }, <span class="hljs-comment">// X coordinate, default is null</span>\n  <span class="hljs-attr">y</span>: { <span class="hljs-attr">type</span>: <span class="hljs-title class_">Number</span>, <span class="hljs-attr">default</span>: <span class="hljs-literal">null</span> } <span class="hljs-comment">// Y coordinate, default is null</span>\n});\n</code></pre>\n```',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> },\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> }\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>,\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        \n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map);\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> });\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>,\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>,\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!,\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>!\n      }));\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> }, <span class="hljs-comment">// Find the map by its ID</span>\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> } <span class="hljs-comment">// Select only width, height, and mapElements fields</span>\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>, <span class="hljs-comment">// Populate the mapElements field</span>\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        <span class="hljs-comment">// Select only element, x, and y fields from mapElements</span>\n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map); <span class="hljs-comment">// Log the retrieved map data</span>\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> }); <span class="hljs-comment">// Return 400 error if map not found</span>\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add space ID</span>\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add element ID</span>\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!, <span class="hljs-comment">// Add x coordinate</span>\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>! <span class="hljs-comment">// Add y coordinate</span>\n      }));\n</code></pre>\n```\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Измени свой подход к написанию комментариев, нужно что бы они обясняли что происходит ",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> }, <span class="hljs-comment">// Find the map document by its ID, which is received from parsedData</span>\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> } <span class="hljs-comment">// Select only the width, height, and mapElements fields from the map document</span>\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>, <span class="hljs-comment">// Populate the mapElements field with the associated Element documents</span>\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        <span class="hljs-comment">// Select only the element, x, and y fields from the Element documents</span>\n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map); <span class="hljs-comment">// Log the retrieved map data to the console for debugging purposes</span>\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> }); <span class="hljs-comment">// If no map is found, return a 400 error with a message</span>\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add the ID of the space</span>\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add the ID of the element</span>\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!, <span class="hljs-comment">// Add the x coordinate of the element</span>\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>! <span class="hljs-comment">// Add the y coordinate of the element</span>\n      }));\n</code></pre>\n```\n\nЯ попытался сделать комментарии более информативными и объяснить, что происходит в каждой строке кода. \n\nВажен контекст: \n* Если вам нужна помощь с комментариями в конкретном участке кода, пожалуйста, укажите этот участок.\n* Если есть переменные, функции, или классы, которые требуют дополнительного объяснения,  пожалуйста, сообщите мне об этом. \n\nЯ готов к дальнейшей работе! \n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: '<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> },\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> }\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>,\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        \n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map);\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> });\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>,\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>,\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!,\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>!\n      }));\n</code></pre>',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> }, <span class="hljs-comment">// Find a map document by its ID, which is retrieved from parsedData</span>\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> } <span class="hljs-comment">// Select only the width, height, and mapElements fields from the map document</span>\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>, <span class="hljs-comment">// Populate the mapElements field with the associated Element documents</span>\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        <span class="hljs-comment">// Select only the element, x, and y fields from the Element documents</span>\n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map); <span class="hljs-comment">// Log the retrieved map data to the console for debugging purposes</span>\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> }); <span class="hljs-comment">// If no map is found, return a 400 error with a message</span>\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add the ID of the space</span>\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>, <span class="hljs-comment">// Add the ID of the element</span>\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!, <span class="hljs-comment">// Add the x coordinate of the element</span>\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>! <span class="hljs-comment">// Add the y coordinate of the element</span>\n      })); <span class="hljs-comment">// This line transforms the mapElements array into a new array spaceElementsData with additional properties</span>\n</code></pre>\n```\n\n\n',
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "сделай цвет для комментариев зеленым" }],
      },
      {
        role: "model",
        parts: [
          {
            text: '```html\n<pre class="lang-js s-code-block"><div style="position: relative;"></div><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-keyword">const</span> map = <span class="hljs-keyword">await</span> <span class="hljs-title class_">Map</span>.<span class="hljs-title function_">findOne</span>(\n        { <span class="hljs-attr">_id</span>: parsedData.<span class="hljs-property">data</span>.<span class="hljs-property">mapId</span> }, <span style="color: green; font-size: 12px;">// Find the map document by its ID, which is retrieved from parsedData</span>\n        { <span class="hljs-attr">width</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">height</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">mapElements</span>: <span class="hljs-number">1</span> } <span style="color: green; font-size: 12px;">// Select only the width, height, and mapElements fields from the map document</span>\n      ).<span class="hljs-title function_">populate</span>({\n        <span class="hljs-attr">path</span>: <span class="hljs-string">\'mapElements\'</span>, <span style="color: green; font-size: 12px;">// Populate the mapElements field with the associated Element documents</span>\n        <span class="hljs-attr">select</span>: <span class="hljs-string">\'element x y\'</span>,        <span style="color: green; font-size: 12px;">// Select only the element, x, and y fields from the Element documents</span>\n      });\n      \n      <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(map); <span style="color: green; font-size: 12px;">// Log the retrieved map data to the console for debugging purposes</span>\n      <span class="hljs-keyword">if</span> (!map) {\n        res.<span class="hljs-title function_">status</span>(<span class="hljs-number">400</span>).<span class="hljs-title function_">json</span>({ <span class="hljs-attr">message</span>: <span class="hljs-string">"Map not found"</span> }); <span style="color: green; font-size: 12px;">// If no map is found, return a 400 error with a message</span>\n        <span class="hljs-keyword">return</span>;\n      }\n<span class="hljs-keyword">const</span> spaceElementsData = map.<span class="hljs-property">mapElements</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">e</span>) =&gt;</span> ({\n        <span class="hljs-attr">space</span>: space.<span class="hljs-property">_id</span>, <span style="color: green; font-size: 12px;">// Add the ID of the space</span>\n        <span class="hljs-attr">element</span>: e.<span class="hljs-property">element</span>.<span class="hljs-property">_id</span>, <span style="color: green; font-size: 12px;">// Add the ID of the element</span>\n        <span class="hljs-attr">x</span>: e.<span class="hljs-property">x</span>!, <span style="color: green; font-size: 12px;">// Add the x coordinate of the element</span>\n        <span class="hljs-attr">y</span>: e.<span class="hljs-property">y</span>! <span style="color: green; font-size: 12px;">// Add the y coordinate of the element</span>\n      })); <span style="color: green; font-size: 12px;">// This line transforms the mapElements array into a new array spaceElementsData with additional properties</span>\n</code></pre>\n```\n\nЯ добавил `style="color: green; font-size: 12px;"` к каждому комментарию. \n\nТеперь комментарии должны быть зелеными! \n\n\n',
          },
        ],
      },
    ],
  });
  return chatSession;
}

// Route to use gemini 1.5 flush
app.post("/api/gemini", async (req, res) => {
  const htmlcode = req.body.html;
  const msg = htmlcode;

  try {
    // Проверяем, что htmlcode передан
    if (!htmlcode) {
      return res.status(400).json({ error: "HTML код не передан" });
    }

    // Выполнение запроса к AI для обработки текста
    const result = await run().sendMessage(msg);

    // Проверяем, что результат имеет поле response
    const processedHtml = result.response.text();

    if (processedHtml) {
      console.log("Processed HTML:", processedHtml);
      return res.json({ processedHtml }); // Отправляем обработанный HTML клиенту
    } else {
      return res.status(500).json({ error: "Не удалось обработать HTML" });
    }
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    res.status(500).json({ error: error.message }); // Отправляем ошибку клиенту
  }
});

// Simple route  for test
app.get("/", (req, res) => {
  res.send("Сревер работает!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
