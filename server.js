const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || "jasmeen1941.be23@chitkara.eu.in";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

function sendError(res, message) {
  return res.status(400).json({
    is_success: false,
    official_email: OFFICIAL_EMAIL,
    error: message
  });
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function fibonacciSeries(n) {
  const series = [];
  for (let i = 0; i < n; i += 1) {
    if (i === 0) series.push(0);
    else if (i === 1) series.push(1);
    else series.push(series[i - 1] + series[i - 2]);
  }
  return series;
}

function isPrime(num) {
  if (!Number.isInteger(num) || num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(num));
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = x % y;
    x = y;
    y = temp;
  }
  return x;
}

function hcf(numbers) {
  return numbers.reduce((acc, num) => gcd(acc, num));
}

function lcm(numbers) {
  return numbers.reduce((acc, num) => {
    if (acc === 0 || num === 0) return 0;
    return Math.abs((acc * num) / gcd(acc, num));
  });
}

async function getOpenAiSingleWord(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing OpenAI API key");
    err.code = "NO_API_KEY";
    throw err;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await axios.post(
    "https://api.openai.com/v1/responses",
    {
      model,
      input: `Answer with a single word only. Question: ${prompt}`
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  const text = response?.data?.output?.[0]?.content?.[0]?.text || "";
  const match = String(text).trim().match(/[A-Za-z0-9]+/);
  return match ? match[0] : "";
}

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendError(res, "Invalid request");
    }

    const keys = Object.keys(body);
    if (keys.length !== 1) {
      return sendError(res, "Invalid request");
    }

    const key = keys[0];
    const value = body[key];
    const allowedKeys = new Set(["fibonacci", "prime", "lcm", "hcf", "AI"]);

    if (!allowedKeys.has(key)) {
      return sendError(res, "Invalid request");
    }

    let result;

    if (key === "fibonacci") {
      if (!isPositiveInteger(value)) {
        return sendError(res, "Invalid request");
      }
      result = fibonacciSeries(value);
    } else if (key === "prime") {
      if (!Array.isArray(value) || value.length === 0 || !value.every((v) => Number.isInteger(v))) {
        return sendError(res, "Invalid request");
      }
      result = value.filter((num) => isPrime(num));
    } else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0 || !value.every((v) => Number.isInteger(v))) {
        return sendError(res, "Invalid request");
      }
      result = lcm(value);
    } else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0 || !value.every((v) => Number.isInteger(v))) {
        return sendError(res, "Invalid request");
      }
      result = hcf(value);
    } else if (key === "AI") {
      if (typeof value !== "string" || value.trim().length === 0) {
        return sendError(res, "Invalid request");
      }
      try {
        result = await getOpenAiSingleWord(value.trim());
        if (!result) {
          return sendError(res, "Invalid request");
        }
      } catch (err) {
        return sendError(res, "Invalid request");
      }
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result
    });
  } catch (err) {
    return sendError(res, "Invalid request");
  }
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, "Invalid request");
  }
  return sendError(res, "Invalid request");
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
