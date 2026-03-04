/**
 * Quality Scoring Module for API Documentation
 * Menghitung skor kualitas dokumentasi OpenAPI (0-100)
 */

/**
 * Main function to calculate quality score
 * @param {Object} openApiSpec - OpenAPI 3.0.3 specification
 * @returns {Object} { score: number, breakdown: object, suggestions: array }
 */
exports.calculateQualityScore = (openApiSpec) => {
  const breakdown = {
    basicInfo: 0,
    endpoints: 0,
    descriptions: 0,
    examples: 0,
    schemas: 0,
    errorHandling: 0,
    security: 0,
  };

  const suggestions = [];
  const maxScores = {
    basicInfo: 15,
    endpoints: 20,
    descriptions: 25,
    examples: 15,
    schemas: 10,
    errorHandling: 10,
    security: 5,
  };

  // 1. Basic Info Quality (15 points)
  breakdown.basicInfo = scoreBasicInfo(openApiSpec.info, suggestions);

  // 2. Endpoints Completeness (20 points)
  breakdown.endpoints = scoreEndpoints(openApiSpec.paths, suggestions);

  // 3. Descriptions Quality (25 points)
  breakdown.descriptions = scoreDescriptions(openApiSpec, suggestions);

  // 4. Examples Quality (15 points)
  breakdown.examples = scoreExamples(openApiSpec.paths, suggestions);

  // 5. Schemas Quality (10 points)
  breakdown.schemas = scoreSchemas(openApiSpec.components?.schemas || {}, suggestions, openApiSpec);

  // 6. Error Handling (10 points)
  breakdown.errorHandling = scoreErrorHandling(openApiSpec, suggestions);

  // 7. Security (5 points)
  breakdown.security = scoreSecurity(openApiSpec, suggestions);

  // Calculate total score
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Format breakdown with maxScores for frontend display
  const formattedBreakdown = {};
  Object.keys(breakdown).forEach((key) => {
    formattedBreakdown[key] = {
      score: breakdown[key],
      maxScore: maxScores[key],
    };
  });

  return {
    score: Math.round(totalScore),
    breakdown: formattedBreakdown,
    maxScores,
    suggestions: suggestions.slice(0, 10), // Limit to top 10 suggestions
    summary: generateSummary(totalScore, breakdown),
  };
};

/**
 * Score basic info section
 */
function scoreBasicInfo(info, suggestions) {
  let score = 0;

  // Title (3 points)
  if (info.title && info.title.length > 5) {
    score += 3;
  } else {
    suggestions.push("Add a descriptive title to your API");
  }

  // Description (5 points)
  if (info.description && info.description.length > 50) {
    score += 5;
  } else if (info.description && info.description.length > 20) {
    score += 3;
    suggestions.push("Expand your API description with more details");
  } else {
    suggestions.push("Add a comprehensive description to your API");
  }

  // Version (2 points)
  if (info.version) {
    score += 2;
  }

  // Contact (3 points)
  if (info.contact && (info.contact.email || info.contact.url)) {
    score += 3;
  } else {
    suggestions.push("Add contact information for API support");
  }

  // License (2 points)
  if (info.license && info.license.name) {
    score += 2;
  } else {
    suggestions.push("Specify a license for your API");
  }

  return score;
}

/**
 * Score endpoints completeness
 */
function scoreEndpoints(paths, suggestions) {
  if (!paths || Object.keys(paths).length === 0) {
    suggestions.push("No endpoints found in the API");
    return 0;
  }

  let score = 0;
  const pathCount = Object.keys(paths).length;
  let operationCount = 0;
  let parametersCount = 0;
  let requestBodyCount = 0;

  Object.values(paths).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      operationCount++;
      if (operation.parameters && operation.parameters.length > 0) {
        parametersCount++;
      }
      if (operation.requestBody) {
        requestBodyCount++;
      }
    });
  });

  // Endpoint existence (5 points)
  if (pathCount > 0) score += 5;
  if (pathCount >= 5) score += 3;
  if (pathCount >= 10) score += 2;

  // Operations (5 points)
  if (operationCount >= pathCount) score += 5;

  // Parameters documentation (5 points)
  const paramRatio = parametersCount / operationCount;
  score += Math.round(paramRatio * 5);

  // Request bodies (5 points)
  if (requestBodyCount > 0) {
    const bodyRatio = requestBodyCount / operationCount;
    score += Math.round(bodyRatio * 5);
  }

  if (pathCount < 3) {
    suggestions.push("Add more endpoints to your API");
  }

  return Math.min(score, 20);
}

/**
 * Score descriptions quality
 */
function scoreDescriptions(spec, suggestions) {
  let score = 0;
  let totalDescriptions = 0;
  let goodDescriptions = 0;

  // Check path descriptions
  Object.values(spec.paths || {}).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      totalDescriptions++;

      // Summary (5 points per endpoint, max 10)
      if (operation.summary && operation.summary.length > 10) {
        score += 0.5;
      }

      // Description (10 points per endpoint, max 15)
      if (operation.description && operation.description.length > 30) {
        goodDescriptions++;
        if (operation.description.length > 100) {
          score += 1;
        } else {
          score += 0.5;
        }
      }
    });
  });

  const descRatio = totalDescriptions > 0 ? goodDescriptions / totalDescriptions : 0;

  if (descRatio < 0.5) {
    suggestions.push("Add detailed descriptions to more endpoints");
  } else if (descRatio < 0.8) {
    suggestions.push("Enhance descriptions for better clarity");
  }

  return Math.min(score, 25);
}

/**
 * Score examples quality based on coverage
 * Focus on percentage of operations with examples, not raw count
 */
function scoreExamples(paths, suggestions) {
  let totalOperations = 0;
  let opsWithRequestExample = 0;
  let opsWithResponseExample = 0;
  let opsWithBothExamples = 0;

  Object.values(paths || {}).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      totalOperations++;

      let hasRequestExample = false;
      let hasResponseExample = false;

      // Check request body examples (for POST/PUT/PATCH)
      if (operation.requestBody?.content?.["application/json"]?.example) {
        hasRequestExample = true;
        opsWithRequestExample++;
      }

      // Check success response examples (2xx codes)
      Object.entries(operation.responses || {}).forEach(([code, response]) => {
        if (code.startsWith("2") && response.content?.["application/json"]?.example) {
          hasResponseExample = true;
        }
      });

      if (hasResponseExample) {
        opsWithResponseExample++;
      }

      if (hasRequestExample && hasResponseExample) {
        opsWithBothExamples++;
      }
    });
  });

  if (totalOperations === 0) return 0;

  // Calculate coverage percentages
  const responseCoverage = opsWithResponseExample / totalOperations;
  const requestCoverage = opsWithRequestExample / totalOperations;
  const bothCoverage = opsWithBothExamples / totalOperations;

  // Scoring (15 points total):
  // - 7 points for response examples coverage
  // - 5 points for request examples coverage
  // - 3 bonus points if many operations have both
  let score = 0;
  score += responseCoverage * 7;
  score += requestCoverage * 5;
  score += bothCoverage * 3;

  // Generate specific suggestions
  if (responseCoverage === 0) {
    suggestions.push("Add response examples to all successful operations (200, 201, etc.)");
  } else if (responseCoverage < 0.5) {
    suggestions.push(`Add response examples to more endpoints (currently ${Math.round(responseCoverage * 100)}% coverage)`);
  }

  if (requestCoverage === 0 && opsWithRequestExample < totalOperations / 3) {
    suggestions.push("Add request body examples for POST, PUT, and PATCH operations");
  } else if (requestCoverage < 0.3) {
    suggestions.push("Include request examples for operations that accept request bodies");
  }

  return Math.min(Math.round(score), 15);
}

/**
 * Score schemas quality based on usage and structure
 * Schemas should be reusable DTOs, not just counted
 */
function scoreSchemas(schemas, suggestions, spec) {
  const schemaCount = Object.keys(schemas).length;
  let score = 0;

  if (schemaCount === 0) {
    suggestions.push("Define reusable schemas in components section for better API contract documentation");
    return 0;
  }

  // Analyze schema usage in paths
  let usedSchemas = new Set();
  let unusedSchemas = [];
  let schemasWithProperties = 0;
  let schemasWithRequired = 0;

  // Find which schemas are referenced in paths
  Object.values(spec.paths || {}).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      // Check request body
      const reqSchema = operation.requestBody?.content?.["application/json"]?.schema;
      if (reqSchema?.$ref) {
        const schemaName = reqSchema.$ref.split("/").pop();
        usedSchemas.add(schemaName);
      }

      // Check responses
      Object.values(operation.responses || {}).forEach((response) => {
        const resSchema = response.content?.["application/json"]?.schema;
        if (resSchema?.$ref) {
          const schemaName = resSchema.$ref.split("/").pop();
          usedSchemas.add(schemaName);
        }
        // Check array items
        if (resSchema?.properties?.data?.items?.$ref) {
          const schemaName = resSchema.properties.data.items.$ref.split("/").pop();
          usedSchemas.add(schemaName);
        }
      });
    });
  });

  // Analyze schema quality
  Object.entries(schemas).forEach(([name, schema]) => {
    // Check if schema is used
    if (!usedSchemas.has(name)) {
      unusedSchemas.push(name);
    }

    // Check if schema has properties (not empty)
    if (schema.properties && Object.keys(schema.properties).length > 0) {
      schemasWithProperties++;
    }

    // Check if schema has required fields
    if (schema.required && schema.required.length > 0) {
      schemasWithRequired++;
    }
  });

  // Scoring based on usage and quality (10 points total)
  const usageRatio = schemaCount > 0 ? usedSchemas.size / schemaCount : 0;
  const propertyRatio = schemaCount > 0 ? schemasWithProperties / schemaCount : 0;
  const requiredRatio = schemaCount > 0 ? schemasWithRequired / schemaCount : 0;

  // Score: 4 points for usage, 3 for properties, 3 for required fields
  score += usageRatio * 4;
  score += propertyRatio * 3;
  score += requiredRatio * 3;

  // Suggestions based on analysis
  if (unusedSchemas.length > 0) {
    suggestions.push(`Remove or reference unused schemas: ${unusedSchemas.slice(0, 3).join(", ")}`);
  }

  if (propertyRatio < 0.5) {
    suggestions.push("Add meaningful properties to schemas to define clear data contracts");
  }

  if (requiredRatio < 0.3) {
    suggestions.push("Specify required fields in schemas to improve API contract clarity");
  }

  if (usedSchemas.size < 2) {
    suggestions.push("Create reusable schemas for request/response bodies to avoid duplication");
  }

  return Math.min(Math.round(score), 10);
}

/**
 * Score error handling - check for comprehensive error documentation
 */
function scoreErrorHandling(spec, suggestions) {
  let totalOperations = 0;
  let opsWith4xx = 0;
  let opsWith5xx = 0;
  let opsWith400 = 0;
  let opsWith401 = 0;
  let opsWith404 = 0;
  let opsWith500 = 0;
  let opsWithErrorBody = 0;

  Object.values(spec.paths || {}).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      totalOperations++;
      const responseCodes = Object.keys(operation.responses || {});

      let has4xx = false;
      let has5xx = false;
      let hasErrorBody = false;

      responseCodes.forEach((code) => {
        const codeNum = parseInt(code);

        if (codeNum >= 400 && codeNum < 500) {
          has4xx = true;
          if (code === "400") opsWith400++;
          if (code === "401") opsWith401++;
          if (code === "404") opsWith404++;

          // Check if error response has proper body
          const response = operation.responses[code];
          if (response.content?.["application/json"]?.schema || response.$ref) {
            hasErrorBody = true;
          }
        }

        if (codeNum >= 500) {
          has5xx = true;
          if (code === "500") opsWith500++;

          const response = operation.responses[code];
          if (response.content?.["application/json"]?.schema || response.$ref) {
            hasErrorBody = true;
          }
        }
      });

      if (has4xx) opsWith4xx++;
      if (has5xx) opsWith5xx++;
      if (hasErrorBody) opsWithErrorBody++;
    });
  });

  if (totalOperations === 0) return 0;

  // Scoring (10 points total):
  // - 3 points for 4xx coverage
  // - 3 points for 5xx coverage
  // - 4 points for error response bodies
  let score = 0;
  score += (opsWith4xx / totalOperations) * 3;
  score += (opsWith5xx / totalOperations) * 3;
  score += (opsWithErrorBody / totalOperations) * 4;

  // Specific suggestions
  if (opsWith4xx === 0) {
    suggestions.push("Document client error responses (400, 401, 404) for your endpoints");
  } else if (opsWith4xx < totalOperations * 0.5) {
    suggestions.push("Add 4xx error responses to more endpoints to document validation and authentication failures");
  }

  if (opsWith5xx === 0) {
    suggestions.push("Document server error responses (500) for error handling transparency");
  }

  if (opsWithErrorBody < totalOperations * 0.3) {
    suggestions.push("Add response schemas or use $ref for error responses to define error structure");
  }

  // Check for specific common errors
  if (opsWith400 < totalOperations * 0.2) {
    suggestions.push("Add 400 Bad Request responses for endpoints that validate input");
  }

  if (opsWith404 < totalOperations * 0.3) {
    suggestions.push("Add 404 Not Found responses for resource lookup endpoints");
  }

  return Math.min(Math.round(score), 10);
}

/**
 * Score security
 */
function scoreSecurity(spec, suggestions) {
  let score = 0;

  // Check security schemes
  if (spec.components?.securitySchemes) {
    score += 3;
  } else {
    suggestions.push("Define security schemes if your API requires authentication");
  }

  // Check if security is applied to operations
  let securedOperations = 0;
  let totalOperations = 0;

  Object.values(spec.paths || {}).forEach((methods) => {
    Object.values(methods).forEach((operation) => {
      totalOperations++;
      if (operation.security && operation.security.length > 0) {
        securedOperations++;
      }
    });
  });

  if (securedOperations > 0) {
    score += 2;
    if (securedOperations > totalOperations * 0.5) {
      score += 0; // Already good
    }
  }

  return Math.min(score, 5);
}

/**
 * Generate summary text
 */
function generateSummary(totalScore, breakdown) {
  const weakPoints = [];

  Object.entries(breakdown).forEach(([key, value]) => {
    if (value < 5) {
      weakPoints.push(formatKey(key));
    }
  });

  if (totalScore >= 90) {
    return "Excellent documentation quality! Your API is well-documented.";
  } else if (totalScore >= 75) {
    return `Good documentation with room for improvement in: ${weakPoints.join(", ")}.`;
  } else if (totalScore >= 50) {
    return `Fair documentation. Focus on improving: ${weakPoints.join(", ")}.`;
  } else {
    return `Documentation needs significant improvement. Priority areas: ${weakPoints.join(", ")}.`;
  }
}

/**
 * Format key for display
 */
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get quality grade
 */
exports.getQualityGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 50) return "C-";
  if (score >= 40) return "D";
  return "F";
};
