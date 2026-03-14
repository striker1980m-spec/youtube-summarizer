const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCH9ohfffAFGa5eS0mT-ckdHPBS1ce0Sak";

async function verifyNewKey() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    console.log("Testing the new API key with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi, are you working now?");
    console.log("[SUCCESS] Response:", result.response.text());
  } catch (error) {
    console.error("[FAILED] Error:", error.message);
  }
}

verifyNewKey();
