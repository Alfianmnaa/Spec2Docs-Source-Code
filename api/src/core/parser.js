const acorn = require("acorn");
const walk = require("acorn-walk");
const fs = require("fs");
const path = require("path");

/**
 * Enhanced parser untuk menangani berbagai pola Express.js
 * Mendukung: router chains, middleware, request body, params, query
 */

/**
 * Melakukan parsing pada satu file JavaScript menggunakan AST
 * @param {string} filePath - Jalur file JS yang akan dianalisis
 * @returns {Object} { endpoints: Array, error: null | Object }
 */
exports.parseExpressFile = (filePath) => {
  try {
    const code = fs.readFileSync(filePath, "utf8");
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: "module",
      locations: true,
    });
    const endpoints = [];
    const middlewareMap = new Map();

    // First pass: Collect middleware definitions
    walk.simple(ast, {
      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (declaration.init && declaration.init.type === "ArrowFunctionExpression") {
            const name = declaration.id.name;
            middlewareMap.set(name, {
              params: extractFunctionParams(declaration.init.params),
              body: declaration.init.body,
            });
          }
        });
      },
    });

    // Second pass: Extract endpoints
    walk.simple(ast, {
      CallExpression(node) {
        const endpoint = extractEndpoint(node, middlewareMap);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      },
    });

    return { endpoints, error: null };
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error.message);

    // Extract line number from error if available
    let line = null;
    let errorType = "ParseError";

    if (error instanceof SyntaxError) {
      errorType = "SyntaxError";
      const lineMatch = error.message.match(/\((\d+):\d+\)/);
      if (lineMatch) line = parseInt(lineMatch[1]);
    }

    return {
      endpoints: [],
      error: {
        message: error.message,
        type: errorType,
        line: line,
        stack: error.stack,
      },
    };
  }
};

/**
 * Extract endpoint information from CallExpression node
 */
function extractEndpoint(node, middlewareMap) {
  if (node.callee.type !== "MemberExpression") return null;

  const method = node.callee.property.name;
  const validMethods = ["get", "post", "put", "delete", "patch", "all"];

  if (!validMethods.includes(method)) return null;

  // Get path (first argument)
  const pathNode = node.arguments[0];
  if (!pathNode) return null;

  let routePath = null;
  if (pathNode.type === "Literal") {
    routePath = pathNode.value;
  } else if (pathNode.type === "TemplateLiteral") {
    routePath = extractTemplateLiteral(pathNode);
  }

  if (!routePath) return null;

  const endpoint = {
    method: method.toUpperCase(),
    path: routePath,
    line: node.loc ? node.loc.start.line : null,
    middlewares: [],
    parameters: extractParameters(routePath),
    requestBody: null,
    responses: {},
    tags: inferTags(routePath),
    summary: generateSummary(method, routePath),
  };

  // Extract middlewares and handler
  for (let i = 1; i < node.arguments.length; i++) {
    const arg = node.arguments[i];

    if (arg.type === "Identifier") {
      // Named middleware
      endpoint.middlewares.push(arg.name);

      // Check if it's a known middleware with params
      if (middlewareMap.has(arg.name)) {
        const mw = middlewareMap.get(arg.name);
        if (mw.params.includes("body")) {
          endpoint.requestBody = { detected: true };
        }
      }
    } else if (arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression") {
      // Inline handler
      const handler = analyzeHandler(arg);
      if (handler.usesReqBody) endpoint.requestBody = { detected: true };
      if (handler.responses) endpoint.responses = handler.responses;
    }
  }

  return endpoint;
}

/**
 * Extract parameters from route path
 */
function extractParameters(routePath) {
  const params = [];
  const paramRegex = /:(\w+)/g;
  let match;

  while ((match = paramRegex.exec(routePath)) !== null) {
    params.push({
      name: match[1],
      in: "path",
      required: true,
      type: "string",
      description: `Path parameter: ${match[1]}`,
    });
  }

  return params;
}

/**
 * Extract template literal to string
 */
function extractTemplateLiteral(node) {
  if (node.quasis.length === 1 && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
  // For complex templates, return a placeholder
  return node.quasis[0].value.cooked || "/unknown";
}

/**
 * Extract function parameters
 */
function extractFunctionParams(params) {
  return params
    .map((p) => {
      if (p.type === "Identifier") return p.name;
      if (p.type === "ObjectPattern") {
        return p.properties.map((prop) => prop.key.name);
      }
      return null;
    })
    .flat()
    .filter(Boolean);
}

/**
 * Analyze handler function for request/response patterns
 */
function analyzeHandler(handlerNode) {
  const analysis = {
    usesReqBody: false,
    usesReqParams: false,
    usesReqQuery: false,
    responses: {},
  };

  walk.simple(handlerNode, {
    MemberExpression(node) {
      // Check for req.body, req.params, req.query
      if (node.object.type === "Identifier") {
        if (node.object.name === "req") {
          if (node.property.name === "body") analysis.usesReqBody = true;
          if (node.property.name === "params") analysis.usesReqParams = true;
          if (node.property.name === "query") analysis.usesReqQuery = true;
        }

        // Check for res.status() or res.json()
        if (node.object.name === "res") {
          if (node.property.name === "status" || node.property.name === "json") {
            // This is a response - we'll mark it
          }
        }
      }
    },
    CallExpression(node) {
      // Detect response patterns: res.status(200).json()
      if (node.callee.type === "MemberExpression") {
        const obj = node.callee.object;
        const method = node.callee.property.name;

        if (method === "status" && node.arguments[0]) {
          const statusArg = node.arguments[0];
          if (statusArg.type === "Literal") {
            analysis.responses[statusArg.value] = {
              description: getStatusDescription(statusArg.value),
            };
          }
        }
      }
    },
  });

  return analysis;
}

/**
 * Infer tags from route path
 */
function inferTags(routePath) {
  const segments = routePath.split("/").filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0].replace(/[{}:]/g, "");
    return [capitalize(firstSegment)];
  }
  return ["General"];
}

/**
 * Generate basic summary from method and path
 */
function generateSummary(method, path) {
  const action =
    {
      GET: "Retrieve",
      POST: "Create",
      PUT: "Update",
      PATCH: "Partially update",
      DELETE: "Delete",
    }[method.toUpperCase()] || "Process";

  const resource = path.split("/").filter(Boolean)[0] || "resource";
  return `${action} ${resource}`;
}

/**
 * Get HTTP status code description
 */
function getStatusDescription(code) {
  const descriptions = {
    200: "Successful operation",
    201: "Resource created successfully",
    204: "No content",
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Resource not found",
    500: "Internal server error",
  };
  return descriptions[code] || "Response";
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Scan folder recursively untuk menemukan semua file route
 * @param {string} folderPath - Root folder path
 * @returns {Object} { endpoints: Array, parsingResults: Object }
 */
exports.scanFolder = (folderPath) => {
  const allEndpoints = [];
  const parsingResults = {
    successful: [],
    failed: [],
    skipped: [],
  };

  const scanRecursive = (dir) => {
    try {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(folderPath, filePath);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Skip node_modules and hidden folders
          if (!file.startsWith(".") && file !== "node_modules") {
            scanRecursive(filePath);
          }
        } else if (file.endsWith(".js") || file.endsWith(".ts")) {
          // Parse JavaScript/TypeScript files
          const parseResult = exports.parseExpressFile(filePath);

          if (parseResult.error) {
            // Parsing failed
            parsingResults.failed.push({
              file: file,
              path: relativePath,
              error: parseResult.error.message,
              errorType: parseResult.error.type,
              line: parseResult.error.line,
              details: parseResult.error.stack,
            });
          } else if (parseResult.endpoints.length === 0) {
            // No endpoints found
            parsingResults.skipped.push({
              file: file,
              path: relativePath,
              reason: "NoRoutes",
            });
          } else {
            // Successfully parsed with endpoints
            parsingResults.successful.push({
              file: file,
              path: relativePath,
              endpointCount: parseResult.endpoints.length,
            });

            parseResult.endpoints.forEach((ep) => {
              ep.sourceFile = relativePath;
              allEndpoints.push(ep);
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
      parsingResults.failed.push({
        file: path.basename(dir),
        path: path.relative(folderPath, dir),
        error: error.message,
        errorType: "ScanError",
        line: null,
        details: error.stack,
      });
    }
  };

  scanRecursive(folderPath);

  return {
    endpoints: allEndpoints,
    parsingResults: parsingResults,
  };
};
