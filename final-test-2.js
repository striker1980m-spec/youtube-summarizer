const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBO1dt_09s9940kqS1kZ7FzyoVlMqtQZfw";

async function finalTest() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    console.log("Testing new API key with gemini-flash-latest...");
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello! Please confirm you can read this message.");
    console.log("[SUCCESS] Response:", result.response.text());
  } catch (error) {
    console.error("[FAILED] Test error:", error.message);
  }
}

finalTest();
