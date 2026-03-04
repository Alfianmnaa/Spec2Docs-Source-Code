#!/usr/bin/env node
/**
 * Quick test of the working model
 */

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function quickTest() {
  console.log("🧪 Testing models/gemini-2.5-flash...");

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent("Say 'Hello, I am working!' in exactly those words.");
    const text = result.response.text();

    console.log("✅ SUCCESS!");
    console.log("Response:", text);
  } catch (error) {
    console.log("❌ FAILED");
    console.log("Error:", error.message);
  }
}

quickTest();
