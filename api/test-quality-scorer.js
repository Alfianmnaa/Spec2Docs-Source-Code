#!/usr/bin/env node
/**
 * Test quality scorer with a sample OpenAPI spec
 */

const { calculateQualityScore, getQualityGrade } = require("./src/utils/qualityScorer");

const sampleSpec = {
  openapi: "3.0.3",
  info: {
    title: "User Management API",
    version: "1.0.0",
    description: "This comprehensive API provides robust endpoints for managing user accounts, including registration, authentication, and profile management.",
    contact: {
      email: "api@example.com",
      url: "https://example.com/support",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://api.example.com/v1",
      description: "Production server",
    },
  ],
  paths: {
    "/users": {
      get: {
        summary: "Retrieve All Users",
        description: "Retrieves a comprehensive list of all registered user accounts. This endpoint supports pagination and filtering to efficiently manage large datasets.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved users",
            content: {
              "application/json": {
                example: [
                  {
                    id: "123",
                    name: "John Doe",
                    email: "john@example.com",
                  },
                ],
              },
            },
          },
          400: {
            description: "Bad request",
          },
          401: {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
      post: {
        summary: "Create New User",
        description: "Registers a new user account with the provided details. Validates email uniqueness and password strength before creation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Jane Doe",
                email: "jane@example.com",
                password: "SecurePass123!",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                example: {
                  id: "456",
                  name: "Jane Doe",
                  email: "jane@example.com",
                },
              },
            },
          },
          400: {
            description: "Validation error",
          },
          409: {
            description: "Email already exists",
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Retrieve User by ID",
        description: "Fetches detailed information for a specific user using their unique identifier.",
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
            description: "User found",
            content: {
              "application/json": {
                example: {
                  id: "123",
                  name: "John Doe",
                  email: "john@example.com",
                },
              },
            },
          },
          404: {
            description: "User not found",
          },
          401: {
            description: "Unauthorized",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
        required: ["id", "name", "email"],
      },
      UserInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
        required: ["name", "email", "password"],
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

console.log("🧪 Testing Quality Scorer");
console.log("=".repeat(60));

const result = calculateQualityScore(sampleSpec);
const grade = getQualityGrade(result.score);

console.log("\n📊 QUALITY SCORE RESULTS");
console.log("=".repeat(60));
console.log(`Overall Score: ${result.score}/100`);
console.log(`Grade: ${grade}`);
console.log(`\nSummary: ${result.summary}`);

console.log("\n📈 BREAKDOWN:");
console.log("=".repeat(60));
Object.entries(result.breakdown).forEach(([category, data]) => {
  const score = data.score;
  const maxScore = data.maxScore;
  const percentage = maxScore ? ((score / maxScore) * 100).toFixed(0) : 0;
  const bar = "█".repeat(Math.floor((score / maxScore) * 20));
  console.log(`${category.padEnd(20)} ${String(score).padStart(2)}/${String(maxScore).padStart(2)} (${String(percentage).padStart(3)}%) ${bar}`);
});

console.log("\n💡 SUGGESTIONS:");
console.log("=".repeat(60));
if (result.suggestions.length > 0) {
  result.suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
  });
} else {
  console.log("✅ No suggestions - documentation is excellent!");
}

console.log("\n" + "=".repeat(60));
console.log("✅ Quality Scorer Test Complete!");
