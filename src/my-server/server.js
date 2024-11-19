import GPT4js from "gpt4js";
import express, { json } from "express";
import cors from "cors";
import { marked } from "marked";

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

app.post("/ai", (req, res) => {
  const { code } = req.body;

  const text = code.text;
  const options = {
    provider: "Nextway",
    model: "gpt-4o-free",
    codeModelMode: true,
    temperature: 1,
  };

  const messages = [
    {
      role: "system",
      content:
        "You are a programming assistant embedded in my extension. Your task is to explain the provided code in a short, simple, and precise way. " +
        "Respond strictly to user requests without additional courtesy or unnecessary explanations. Do not repeat large sections of the code in your response. " +
        "Focus only on the key functionality and important points of the code.\n" +
        "Format your answers in Markdown when appropriate:\n" +
        "1. Use single backticks (`) for inline code.\n" +
        "2. For multi-line code, use triple backticks (```), and specify the language for syntax highlighting.\n" +
        "3. Add 1 indent at the end of the code and a long solid line '_' of 63 characters",
    },
    {
      role: "user",
      content: `Explain this code: ${text}`,
    },
  ];

  (async () => {
    const provider = GPT4js.createProvider(options.provider);
    try {
      const text = await provider.chatCompletion(messages, options);
      const markedHTML = marked(text);
      res.json({ html: markedHTML });
      console.log("ready");
    } catch (eror) {
      console.error("eror", eror);
    }
  })();
});

// Simple route  for test
app.get("/", (req, res) => {
  res.send("Сревер работает!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
