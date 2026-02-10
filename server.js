const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL =
  process.env.OFFICIAL_EMAIL || "jasmeen1941.be23@chitkara.eu.in";

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---------------- HEALTH API ----------------
app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

// ---------------- HELPERS ----------------
function sendError(res, message = "Invalid request") {
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
  for (let i = 0; i < n; i++) {
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
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function hcf(numbers) {
  return numbers.reduce((acc, num) => gcd(acc, num));
}

function lcm(numbers) {
  return numbers.reduce(
    (acc, num) => Math.abs((acc * num) / gcd(acc, num))
  );
}

// ---------------- GEMINI 2.5 FLASH ----------------
async function getGeminiSingleWord(question) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

    const model = process.env.GEMINI_MODEL || "gemini-1.0-pro";
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Answer with ONE WORD only. ${question}`
            }
          ]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  const text =
    response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Ensure single-word output
  return text.trim().split(/\s+/)[0];
}

// ---------------- BFHL API ----------------
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendError(res);
    }

    const keys = Object.keys(body);
    if (keys.length !== 1) {
      return sendError(res);
    }

    const key = keys[0];
    const value = body[key];
    const allowedKeys = ["fibonacci", "prime", "lcm", "hcf", "AI"];

    if (!allowedKeys.includes(key)) {
      return sendError(res);
    }

    let result;

    if (key === "fibonacci") {
      if (!isPositiveInteger(value)) return sendError(res);
      result = fibonacciSeries(value);

    } else if (key === "prime") {
      if (!Array.isArray(value) || value.length === 0 || !value.every(Number.isInteger)) {
        return sendError(res);
      }
      result = value.filter(isPrime);

    } else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0 || !value.every(Number.isInteger)) {
        return sendError(res);
      }
      result = lcm(value);

    } else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0 || !value.every(Number.isInteger)) {
        return sendError(res);
      }
      result = hcf(value);

    } else if (key === "AI") {
      if (typeof value !== "string" || !value.trim()) {
        return sendError(res);
      }
      try {
        result = await getGeminiSingleWord(value.trim());
        if (!result) return sendError(res);
      } catch {
        return sendError(res);
      }
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result
    });

  } catch {
    return sendError(res);
  }
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  return sendError(res);
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
