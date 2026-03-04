#!/usr/bin/env node
/**
 * List available Gemini models
 * Run: node list-models.js
 */

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log("🔍 Listing available Gemini AI models...");
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);
  console.log("=".repeat(60));

  try {
    // The SDK might not have a direct listModels method, so we'll try different approaches

    // Approach 1: Try to access the models via API call
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("\n✅ Available Models:");
    console.log("=".repeat(60));

    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`\n${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName || "N/A"}`);
        console.log(`   Description: ${model.description || "N/A"}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(", ") || "N/A"}`);
      });

      console.log("\n" + "=".repeat(60));
      console.log("📝 Models supporting 'generateContent':");
      const contentModels = data.models.filter((m) => m.supportedGenerationMethods?.includes("generateContent"));
      contentModels.forEach((m) => {
        console.log(`   - ${m.name}`);
      });

      if (contentModels.length > 0) {
        console.log(`\n💡 TRY THIS MODEL: "${contentModels[0].name}"`);
      }
    } else {
      console.log("No models found in response");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Error listing models:", error.message);
    console.error("\nFull error:", error);
  }
}

listModels().catch(console.error);
