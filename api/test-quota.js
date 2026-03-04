require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  "models/gemini-flash-latest",
  "models/gemini-2.0-flash", 
  "models/gemma-3-12b-it",
  "models/gemini-pro-latest"
];

async function testQuota() {
  console.log("Ì∑™ Testing which models have quota available...\n");
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hi");
      console.log(`‚úÖ ${modelName} - WORKING\n`);
      return modelName;
    } catch (error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        console.log(`‚ùå ${modelName} - Quota exceeded\n`);
      } else {
        console.log(`‚ùå ${modelName} - ${error.message.substring(0, 100)}...\n`);
      }
    }
  }
  console.log("‚ùå All models are over quota or unavailable");
}

testQuota();
