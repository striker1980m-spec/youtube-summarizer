const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Using model: gemini-1.5-flash");
    
    // Test a simple generation
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
    if (error.message.includes("not found")) {
      console.log("Attempting fallback to gemini-1.5-flash-latest...");
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await fallbackModel.generateContent("Hi");
        console.log("Success with gemini-1.5-flash-latest:", result.response.text());
      } catch (fError) {
        console.error("Fallback error:", fError.message);
      }
    }
  }
}

listModels();
