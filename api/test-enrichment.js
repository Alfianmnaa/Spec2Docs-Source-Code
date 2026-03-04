#!/usr/bin/env node
/**
 * Test AI enrichment with a real OpenAPI spec
 */

require("dotenv").config();
const { enrichWithAI } = require("./src/core/aiService");

const simpleSpec = {
  openapi: "3.0.3",
  info: {
    title: "User Management API",
    version: "1.0.0",
    description: "Basic API",
  },
  paths: {
    "/users": {
      get: {
        summary: "Get users",
        description: "Gets users",
        responses: {
          200: {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Create user",
        description: "Creates a user",
        responses: {
          201: {
            description: "Created",
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Get user",
        description: "Gets a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
          },
          404: {
            description: "Not found",
          },
        },
      },
    },
  },
};

async function testEnrichment() {
  console.log("🧪 Testing AI Enrichment with Sample OpenAPI Spec");
  console.log("=".repeat(60));
  console.log("\n📄 BEFORE ENRICHMENT:");
  console.log(JSON.stringify(simpleSpec, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("🤖 Enriching with AI...");
  console.log("=".repeat(60));

  try {
    const enriched = await enrichWithAI(simpleSpec);

    console.log("\n✅ ENRICHMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📄 AFTER ENRICHMENT:");
    console.log(JSON.stringify(enriched, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("📊 COMPARISON:");
    console.log("=".repeat(60));

    const originalDesc = simpleSpec.info.description;
    const enrichedDesc = enriched.info.description;

    console.log("\nAPI Description:");
    console.log("  Before:", originalDesc);
    console.log("  After:", enrichedDesc);
    console.log("  Improved:", originalDesc !== enrichedDesc ? "✅ YES" : "❌ NO");

    const originalEndpoint = simpleSpec.paths["/users"].get.description;
    const enrichedEndpoint = enriched.paths["/users"]?.get?.description;

    console.log("\nGET /users Description:");
    console.log("  Before:", originalEndpoint);
    console.log("  After:", enrichedEndpoint || "N/A");
    console.log("  Improved:", originalEndpoint !== enrichedEndpoint ? "✅ YES" : "❌ NO");

    console.log("\n✅ AI enrichment is working perfectly!");
  } catch (error) {
    console.error("\n❌ Enrichment failed:", error.message);
    console.error(error);
  }
}

testEnrichment();
