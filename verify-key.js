const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBkC8ML_Imyr1LWza1nLnGOVy1O4Iv5sWs";

async function checkApiKey() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    console.log("Checking API Key validity and available models...");
    
    // In the newer SDK, we might need to use a different way to list models if listModels isn't a direct method 
    // but usually it's available or we can test a simple request to a base model.
    // Let's try to list models if possible, otherwise test 'gemini-1.5-flash'.
    
    // Attempting to list models directly using the REST structure if the SDK method is tricky, 
    // but let's try the common SDK pattern first.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("[VALID] API Key is working. Response:", result.response.text());
  } catch (error) {
    console.error("[INVALID/ERROR] API Key Check Failed.");
    console.error("Message:", error.message);
    
    if (error.message.includes("API key not valid")) {
      console.log("Diagnosis: The API key is fundamentally invalid (typo or deleted).");
    } else if (error.message.includes("403") || error.message.includes("PERMISSION_DENIED")) {
      console.log("Diagnosis: API Key is valid, but the 'Generative Language API' is not enabled in Google Cloud Console.");
    } else if (error.message.includes("404") || error.message.includes("not found")) {
      console.log("Diagnosis: The key is valid but the specific model was not found. This often happens if the API is not fully provisioned.");
    }
  }
}

checkApiKey();
