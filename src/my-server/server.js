import GPT4js from "gpt4js";
import express from "express";
import cors from "cors";

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
  const messaages = [
    {
      role: "system",
      content:
        "you are a programming assistant, your task is to write to me what the code I send you does",
    },
    {
      role: "user",
      content: `Your task is to explain in detail and at the same time easy to read what is happening in the code; there should not be too much text, but the content should not suffer. ${text}`,
    },
  ];

  (async () => {
    const provider = GPT4js.createProvider(options.provider);
    try {
      const text = await provider.chatCompletion(messaages, options);
      res.json({ text });
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
