const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

function getApiKey() {
  try {
    const envPath = path.join(__dirname, ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API Key not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing available models...");
    // The SDK might not have a direct listModels, but we can fetch it via fetch if needed.
    // However, let's try some common variations first via generation test.
    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "models/gemini-1.5-flash",
      "models/gemini-pro"
    ];

    for (const m of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("Hi");
        console.log(`[SUCCESS] ${m} is available.`);
      } catch (e) {
        console.log(`[FAILED] ${m}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("General error:", error.message);
  }
}

run();
