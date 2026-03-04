require('dotenv').config();
const { enrichWithAI } = require('./src/core/aiService');

const testSpec = {
  openapi: "3.0.3",
  info: {
    title: "Test API",
    version: "1.0.0",
    description: "Basic"
  },
  paths: {
    "/test": {
      get: {
        summary: "Get test",
        description: "Gets test data",
        responses: {
          200: { description: "OK" }
        }
      }
    }
  }
};

console.log("í·ª Testing AI enrichment with Gemma model...\n");

enrichWithAI(testSpec)
  .then(result => {
    console.log("\nâœ… SUCCESS! AI enrichment is working!");
    console.log("\nEnriched description:", result.info.description);
    console.log("\nEnriched endpoint:", result.paths["/test"].get.description);
  })
  .catch(err => {
    console.error("\nâŒ FAILED:", err.message);
  });
