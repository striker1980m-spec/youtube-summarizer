const API_KEY = "AIzaSyBkC8ML_Imyr1LWza1nLnGOVy1O4Iv5sWs";

async function checkRawApi() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    console.log("Fetching accessible models via REST API...");
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      if (data.models && data.models.length > 0) {
        console.log("[SUCCESS] Key is valid. Accessible models:");
        data.models.forEach(m => console.log(` - ${m.name}`));
      } else {
        console.log("[EMPTY] Key is valid, but NO models are accessible. This means the API is likely not enabled.");
      }
    } else {
      console.error("[ERROR] API Request Failed.");
      console.error("Status:", response.status);
      console.error("Data:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

checkRawApi();
