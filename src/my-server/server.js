import GPT4js from "gpt4js";
import express, { json } from "express";
import cors from "cors";
import { marked } from "marked";
import rateLimit from "express-rate-limit";
import cluster from "cluster";
import os from "os";
import Redis from "ioredis";

const app = express();
const PORT = 3000;
const redis = new Redis();

const corsOptions = {
  origin: "chrome-extension://bpbfekccemffnhfbmglomkggpenchnom",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests",
});

app.use(limiter);
app.use(cors(corsOptions));

// Middleware for processing JSON - requests
app.use(express.json());

app.post("/ai", async (req, res) => {
  const { code } = req.body;

  const cacheKey = `ai:${code.text}`;

  try {
    // Проверка наличия кэша в Redis
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      return res.json({ html: cachedResponse });
    }

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
          "Focus only on the key functionality and important points of the code.  " +
          "add a 63 simbols '______________' line at the end of every your answers, and after the line 1 empty line" +
          "do not write anything unnecessary other than explanations for the code",
      },
      {
        role: "user",
        content: `In each of your answers, strictly follow the instructions, your task is to explain the code and nothing more!: ${text}`,
      },
    ];

    const provider = GPT4js.createProvider(options.provider);

    // Запрос к GPT
    const responseText = await provider.chatCompletion(messages, options);
    const markedHTML = marked(responseText);

    // Сохранение результата в Redis с временем жизни 1 час
    await redis.set(cacheKey, markedHTML, "EX", 60 * 60);

    // Отправка ответа клиенту
    res.json({ html: markedHTML });
    console.log("Response ready.");
  } catch (error) {
    console.error("Error processing request: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Simple route  for test
app.get("/", (req, res) => {
  res.send("Сревер работает!");
});

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} ended. Reboot...`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log(
      `Server started on http://localhost:${PORT}, PID: ${process.pid}`
    );
  });
}
