const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi Google AI pake API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
let WORKING_MODEL = null;

// Function to get or create model buat testing aja
function getModel() {
  if (WORKING_MODEL) {
    return genAI.getGenerativeModel({ model: WORKING_MODEL });
  }
  // Default to the best available model
  return genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
}

// Export function to set working model
exports.setWorkingModel = (modelName) => {
  WORKING_MODEL = modelName;
  console.log(`✅ AI Model set to: ${modelName}`);
};

/**
 * Helper Retry dengan Exponential Backoff
 * Berguna untuk menangani error 503 (Overloaded) atau 429 (Rate Limit)
 */
async function geminiRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const message = err?.message?.toLowerCase() || "";
      const isRetryable = message.includes("503") || message.includes("overloaded") || message.includes("429");

      if (isRetryable && i < retries - 1) {
        const wait = Math.pow(2, i) * 1000; // Jeda: 1s, 2s, 4s
        console.warn(`[AI Service] Attempt ${i + 1} gagal (Overload). Retry dalam ${wait}ms...`);
        await new Promise((res) => setTimeout(res, wait));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Fungsi Enrichment dengan Hierarki Model (2.5 -> 1.5)
 * Enhanced dengan prompt yang lebih baik dan handling
 */
exports.enrichWithAI = async (openApiSpec) => {
  const prompt = `You are an expert API documentation writer. Your task is to enhance this OpenAPI 3.0.3 specification.

CRITICAL INSTRUCTIONS:
1. Improve ONLY the 'summary' and 'description' fields for each endpoint
2. Write a comprehensive, professional narrative in 'info.description'
3. Add meaningful examples to request bodies and responses where missing
4. Ensure all descriptions are clear, concise, and professional
5. Maintain STRICT OpenAPI 3.0.3 format - do not modify structure
6. Return ONLY valid JSON, no markdown code blocks

GUIDELINES:
- Summaries: 3-7 words, action-oriented (e.g., "Retrieve user by ID")
- Descriptions: 2-3 sentences explaining purpose, behavior, and important details
- Info description: Professional overview of the entire API (3-5 sentences)
- Examples: Realistic and meaningful data

INPUT SPECIFICATION:
${JSON.stringify(openApiSpec, null, 2)}

OUTPUT: Return the complete enhanced OpenAPI JSON specification.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  // List of models to try in order of preference
  // Updated order: Use models with available quota first
  const modelsToTry = ["models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemma-3-12b-it", "models/gemini-flash-latest", "models/gemini-2.0-flash", "models/gemini-pro-latest", "models/gemini-2.5-pro"];

  let lastError = null;

  // Try each model until one succeeds
  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await geminiRetry(() => model.generateContent(prompt, { signal: controller.signal }));

      clearTimeout(timeoutId);
      const text = result.response.text();

      // Clean response - remove markdown code blocks if present
      let cleanedJson = text.trim();
      cleanedJson = cleanedJson.replace(/^```json\s*/i, "");
      cleanedJson = cleanedJson.replace(/^```\s*/i, "");
      cleanedJson = cleanedJson.replace(/\s*```$/i, "");
      cleanedJson = cleanedJson.trim();

      // Parse and validate
      const enhancedSpec = JSON.parse(cleanedJson);

      // Validate it's still OpenAPI
      if (!enhancedSpec.openapi || !enhancedSpec.info || !enhancedSpec.paths) {
        throw new Error("AI returned invalid OpenAPI structure");
      }

      console.log(`✅ AI Enhancement Successful with ${modelName}`);
      // Remember this model for future use
      WORKING_MODEL = modelName;
      return enhancedSpec;
    } catch (error) {
      console.warn(`❌ Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // All models failed
  console.error("❌ All AI models failed. Last error:", lastError?.message);
  // Return original spec as fallback
  return openApiSpec;
};

/**
 * Enhanced function untuk generate individual descriptions
 * Berguna jika AI penuh gagal, kita bisa enhance satu per satu
 */
exports.enhanceEndpointDescription = async (method, path, currentDesc) => {
  const prompt = `Write a professional 2-3 sentence description for this API endpoint:
Method: ${method}
Path: ${path}
Current: ${currentDesc || "No description"}

Requirements:
- Explain what it does
- Mention important parameters or behavior
- Be clear and concise
- Professional tone

Return ONLY the description text, no quotes or formatting.`;

  // Try models in order (with correct 'models/' prefix)
  const modelsToTry = ["models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemma-3-12b-it", "models/gemini-flash-latest", "models/gemini-2.0-flash", "models/gemini-pro-latest", "models/gemini-2.5-pro"];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await geminiRetry(() => model.generateContent(prompt));
      return result.response.text().trim();
    } catch (error) {
      console.warn(`Model ${modelName} failed for endpoint description`);
    }
  }

  // All models failed, return fallback
  console.error(`Failed to enhance ${method} ${path}`);
  return currentDesc || `${method} operation for ${path}`;
};
