const API_KEY = "AIzaSyBO1dt_09s9940kqS1kZ7FzyoVlMqtQZfw";

async function checkRawApi() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    console.log("Fetching accessible models for the new key via REST API...");
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      if (data.models && data.models.length > 0) {
        console.log("[SUCCESS] Key is valid. Accessible models:");
        data.models.forEach(m => console.log(` - ${m.name}`));
      } else {
        console.log("[EMPTY] Key is valid, but NO models are accessible. This usually means the 'Generative Language API' is not enabled for this project.");
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
