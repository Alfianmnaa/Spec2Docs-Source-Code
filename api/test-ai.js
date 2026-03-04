#!/usr/bin/env node
/**
 * Simple script to test AI models without authentication
 * Run: node test-ai.js
 */

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro", "models/gemini-1.5-flash", "models/gemini-1.5-pro", "models/gemini-pro"];

const testPrompt = "Say 'Hello, I am working!' in exactly those words.";

async function testModels() {
  console.log("🧪 Testing Gemini AI models...");
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);
  console.log("API Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
  console.log("=".repeat(60));

  const results = [];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n📝 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const startTime = Date.now();
      const result = await model.generateContent(testPrompt);
      const responseTime = Date.now() - startTime;

      const text = result.response.text();

      results.push({
        model: modelName,
        status: "✅ SUCCESS",
        response: text,
        responseTime: `${responseTime}ms`,
        working: true,
      });

      console.log(`✅ ${modelName} - SUCCESS (${responseTime}ms)`);
      console.log(`   Response: ${text}`);
    } catch (error) {
      results.push({
        model: modelName,
        status: "❌ FAILED",
        error: error.message,
        working: false,
      });

      console.log(`❌ ${modelName} - FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }

  const workingModels = results.filter((r) => r.working);

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total tested: ${results.length}`);
  console.log(`Working: ${workingModels.length}`);
  console.log(`Failed: ${results.length - workingModels.length}`);

  if (workingModels.length > 0) {
    console.log("\n✅ WORKING MODELS:");
    workingModels.forEach((m) => console.log(`   - ${m.model} (${m.responseTime})`));
    console.log(`\n💡 RECOMMENDATION: Use "${workingModels[0].model}"`);
  } else {
    console.log("\n❌ No working models found!");
    console.log("💡 Check your API key and SDK version");
  }
}

testModels().catch(console.error);
