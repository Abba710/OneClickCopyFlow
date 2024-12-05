import GPT4js from "gpt4js"; // Importing GPT4js for interacting with the GPT-4 model.
import express, { json, response } from "express"; // Importing Express.js for building the web server and JSON middleware.
import cors from "cors"; // Importing CORS middleware to handle Cross-Origin Resource Sharing.
import { marked } from "marked"; // Importing 'marked' to convert Markdown responses to HTML.
import rateLimit from "express-rate-limit"; // Importing rate limiter to control request frequency and prevent abuse.
import cluster from "cluster"; // Importing the Cluster module for multi-core server management.
import os from "os"; // Importing the OS module to retrieve CPU information.
import Redis from "ioredis"; // Importing Redis client for caching data.
import axios from "axios";

const app = express();
const PORT = 5000;
const redis = new Redis();

const GPT4_PROVIDERS = [
  { site: "you", model: "gpt-4" },
  { site: "chatbase", model: "gpt-4" },
  { site: "bai", model: "gpt-4" },
];

const corsOptions = {
  origin: "chrome-extension://bpbfekccemffnhfbmglomkggpenchnom", // Allowing requests only from the specified Chrome extension.
  methods: ["GET", "POST"], // Permitting only GET and POST methods.
  allowedHeaders: ["Content-Type"], // Allowing the "Content-Type" header in requests.
};

const limiter = rateLimit({
  windowMs: 60 * 1000, // Setting a time window of 1 minute.
  max: 60, // Limiting the number of requests per window to 60.
  message: "Too many requests", // Message sent to the client when the rate limit is exceeded.
});

app.use(limiter); // Applying the rate-limiting middleware.
app.use(cors(corsOptions)); // Applying the CORS middleware.
app.use(express.json()); // Adding middleware to parse incoming JSON requests.

function createMessages(text) {
  return [
    {
      role: "system",
      content:
        "You are a programming assistant embedded in my extension. Your only task is to explain the provided code. Strictly follow these rules: " +
        "1. Focus only on explaining the functionality and key points of the code." +
        "3. Do not include unnecessary courtesies, unrelated comments, or excessive details." +
        "4. Add a line of exactly 63 underscores ('______________') at the end of every answer. After this line, include 1 empty line." +
        "5. Provide clear and concise explanations, ensuring accuracy.",
    },
    {
      role: "user",
      content: `In each of your answers, strictly follow the instructions, your task is to explain the code and nothing more!: ${text}`,
    },
  ];
}

async function tryGPT4Providers(text) {
  let responseText = null;
  let error = null;
  const messages = createMessages(text);

  for (const provider of GPT4_PROVIDERS) {
    try {
      const response = await axios.post(
        `http://localhost:3000/${provider.site}/v1/chat/completions`,
        {
          model: provider.model,
          messages: messages,
          temperature: 0.7,
        }
      );
      if (
        response.data &&
        response.data.choices &&
        response.data.choices[0].message.content
      ) {
        responseText = response.data.choices[0].message.content;
        return responseText;
      }
    } catch (e) {
      error = e;
      console.log(`Provider ${provider.site} failed, trying next one...`);
      continue;
    }
  }
  if (!responseText) {
    throw error || new Error("All providers failed");
  }
  return responseText;
}

// POST route to handle AI requests
app.post("/ai", async (req, res) => {
  const { code } = req.body; // Extracting the `code` object from the request body.
  const cacheKey = `ai:${code.text}`; // Creating a Redis cache key based on the input text.

  try {
    // Check if the response for this input is already cached
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      return res.json({ html: cachedResponse }); // Return cached response if available.
    }

    const text = code.text; // Extracting the text from the code object.
    const options = {
      provider: "Nextway", // Using the "Nextway" provider for GPT4js.
      model: "gpt-4o-free", // Specifying the model to use.
      codeModelMode: true, // Enabling code-specific mode for GPT.
      temperature: 0.7, // Setting the randomness of the model's responses.
    };

    const messages = createMessages(text);
    const provider = GPT4js.createProvider(options.provider); // Initializing the provider for GPT4js.

    // Sending a request to GPT with the messages and options
    const responseText = await provider.chatCompletion(messages, options);

    const markedHTML = marked(responseText || (await tryGPT4Providers(text))); // Converting the response from Markdown to HTML.

    // Caching the response in Redis with a 1-hour expiration time
    await redis.set(cacheKey, markedHTML, "EX", 60 * 60);

    // Sending the processed response back to the client
    res.json({ html: markedHTML });
    console.log("Response ready.");
  } catch (error) {
    console.error("Error processing request: ", error); // Logging any errors that occur.
    res.status(500).json({ error: "Internal server error" }); // Sending an error response to the client.
  }
});

// Simple route for testing server functionality
app.get("/", (req, res) => {
  res.send("Сревер работает!"); // Sending a simple message to indicate the server is running.
});

// Setting up a multi-core server using clustering
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length; // Determining the number of CPU cores.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Forking a worker process for each core.
  }

  // Restarting workers if they exit unexpectedly
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} ended. Reboot...`);
    cluster.fork();
  });
} else {
  // Starting the Express server in worker processes
  app.listen(PORT, () => {
    console.log(
      `Server started on http://localhost:${PORT}, PID: ${process.pid}`
    );
  });
}
