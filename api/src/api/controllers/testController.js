const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Test endpoint to find working Gemini model
 */
exports.testAI = async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const modelsToTest = ["models/gemini-2.5-flash", "models/gemini-flash-latest", "models/gemini-2.0-flash", "models/gemini-pro-latest", "models/gemini-2.5-pro"];

  const results = [];
  const testPrompt = "Say 'Hello, I am working!' in exactly those words.";

  console.log("🧪 Testing Gemini AI models...");
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);

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
    workingModels.forEach((m) => console.log(`   - ${m.model}`));
  }

  res.json({
    success: true,
    message: `Tested ${results.length} models, ${workingModels.length} working`,
    workingModels: workingModels.map((m) => m.model),
    allResults: results,
    recommendation: workingModels.length > 0 ? `Use model: "${workingModels[0].model}"` : "No working models found. Check API key and SDK version.",
  });
};

/**
 * Test AI enrichment with a simple OpenAPI spec
 */
exports.testEnrichment = async (req, res) => {
  const { enrichWithAI } = require("../../core/aiService");

  const simpleSpec = {
    openapi: "3.0.3",
    info: {
      title: "Test API",
      version: "1.0.0",
      description: "A simple test API",
    },
    paths: {
      "/test": {
        get: {
          summary: "Test endpoint",
          description: "A test endpoint",
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
    },
  };

  try {
    console.log("🧪 Testing AI enrichment...");
    const enriched = await enrichWithAI(simpleSpec);

    res.json({
      success: true,
      message: "AI enrichment test completed",
      original: simpleSpec,
      enriched: enriched,
      wasEnriched: JSON.stringify(simpleSpec) !== JSON.stringify(enriched),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI enrichment test failed",
      error: error.message,
    });
  }
};
