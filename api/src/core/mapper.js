/**
 * Enhanced OpenAPI 3.0.3 Mapper
 * Mengubah daftar endpoint menjadi struktur OpenAPI yang lengkap
 * @param {string} title - Judul proyek dari user
 * @param {Array} endpoints - Hasil dari AST parser
 * @returns {Object} Complete OpenAPI 3.0.3 specification
 */
exports.mapToOpenAPI = (title, endpoints) => {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: title || "Spec2Docs Generated API",
      version: "1.0.0",
      description: "Auto-generated API Documentation with AI Enhancement",
      contact: {
        name: "API Support",
        email: "support@spec2docs.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [],
    paths: {},
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            code: {
              type: "string",
              description: "Error code",
              example: "ERR_001",
            },
            details: {
              type: "array",
              description: "Additional error details",
              items: { type: "string" },
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1, description: "Current page number" },
            limit: { type: "integer", example: 10, description: "Items per page" },
            total: { type: "integer", example: 100, description: "Total number of items" },
            pages: { type: "integer", example: 10, description: "Total number of pages" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      responses: {
        BadRequest: {
          description: "Invalid request parameters or body",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                message: "Validation failed",
                code: "VALIDATION_ERROR",
                details: ["Field 'name' is required", "Field 'email' must be a valid email"],
              },
            },
          },
        },
        Unauthorized: {
          description: "Authentication is required and has failed or has not been provided",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                message: "Authentication required",
                code: "UNAUTHORIZED",
              },
            },
          },
        },
        NotFound: {
          description: "The requested resource was not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                message: "Resource not found",
                code: "NOT_FOUND",
              },
            },
          },
        },
        InternalError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                message: "Internal server error",
                code: "INTERNAL_ERROR",
              },
            },
          },
        },
      },
    },
  };

  // Group endpoints by tags
  const tagSet = new Set();
  const pathMap = new Map();

  endpoints.forEach((ep) => {
    // Normalize path: Express (:id) to OpenAPI ({id})
    const normalizedPath = ep.path.replace(/:(\w+)/g, "{$1}");

    // Add tags
    if (ep.tags && ep.tags.length > 0) {
      ep.tags.forEach((tag) => tagSet.add(tag));
    }

    // Initialize path if not exists
    if (!pathMap.has(normalizedPath)) {
      pathMap.set(normalizedPath, {});
    }

    const methodLower = ep.method.toLowerCase();
    const resourceName = extractResourceName(normalizedPath);
    const schemaName = capitalize(resourceName);

    const operation = {
      summary: ep.summary || generateSummary(ep.method, normalizedPath),
      description: ep.description || generateDescription(ep.method, normalizedPath),
      tags: ep.tags || [capitalize(resourceName)],
      operationId: generateOperationId(ep.method, normalizedPath),
      parameters: [],
      responses: {},
    };

    // Generate appropriate success response based on method
    const hasPathParam = normalizedPath.includes("{");
    if (ep.method === "GET") {
      if (hasPathParam) {
        // GET by ID - return single object
        operation.responses["200"] = {
          description: `Successfully retrieved ${resourceName}`,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${schemaName}` },
              example: generateResourceExample(resourceName, "single"),
            },
          },
        };
      } else {
        // GET collection - return array with pagination
        operation.responses["200"] = {
          description: `Successfully retrieved list of ${resourceName}s`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: `#/components/schemas/${schemaName}` },
                  },
                  meta: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
              example: {
                data: [generateResourceExample(resourceName, "single")],
                meta: { page: 1, limit: 10, total: 1, pages: 1 },
              },
            },
          },
        };
      }
    } else if (ep.method === "POST") {
      operation.responses["201"] = {
        description: `${schemaName} created successfully`,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${schemaName}` },
            example: generateResourceExample(resourceName, "created"),
          },
        },
      };
    } else if (["PUT", "PATCH"].includes(ep.method)) {
      operation.responses["200"] = {
        description: `${schemaName} updated successfully`,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${schemaName}` },
            example: generateResourceExample(resourceName, "updated"),
          },
        },
      };
    } else if (ep.method === "DELETE") {
      operation.responses["200"] = {
        description: `${schemaName} deleted successfully`,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string", example: `${schemaName} deleted successfully` },
              },
            },
          },
        },
      };
    }

    // Add path parameters
    if (ep.parameters && ep.parameters.length > 0) {
      ep.parameters.forEach((param) => {
        operation.parameters.push({
          name: param.name,
          in: param.in,
          required: param.required !== false,
          schema: {
            type: param.type || "string",
          },
          description: param.description || `${param.in} parameter`,
        });
      });
    }

    // Add query parameters for GET requests
    if (ep.method === "GET") {
      operation.parameters.push(
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer", default: 1 },
          description: "Page number for pagination",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", default: 10 },
          description: "Number of items per page",
        }
      );
    }

    // Add request body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(ep.method)) {
      const inputSchemaName = `${schemaName}Input`;
      operation.requestBody = {
        required: true,
        description: ep.method === "POST" ? `Data for creating new ${resourceName}` : `Data for updating ${resourceName}`,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${inputSchemaName}` },
            example: generateResourceExample(resourceName, ep.method === "POST" ? "create" : "update"),
          },
        },
      };

      // Add input schema to components if not exists
      if (!spec.components.schemas[inputSchemaName]) {
        spec.components.schemas[inputSchemaName] = generateInputSchema(resourceName);
      }
    }

    // Add resource schema to components if not exists
    if (!spec.components.schemas[schemaName]) {
      spec.components.schemas[schemaName] = generateResourceSchema(resourceName);
    }

    // Add responses from detected status codes
    if (ep.responses && Object.keys(ep.responses).length > 0) {
      Object.entries(ep.responses).forEach(([code, response]) => {
        operation.responses[code] = {
          description: response.description || "Response",
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        };
      });
    }

    // Add common error responses using reusable components
    if (requiresAuth(ep)) {
      operation.security = [{ bearerAuth: [] }];
      operation.responses["401"] = { $ref: "#/components/responses/Unauthorized" };
    }

    // Add 404 for endpoints with path parameters (specific resource lookup)
    if (hasPathParam || ep.method === "DELETE") {
      operation.responses["404"] = { $ref: "#/components/responses/NotFound" };
    }

    // Add 400 for endpoints that accept request bodies
    if (["POST", "PUT", "PATCH"].includes(ep.method)) {
      operation.responses["400"] = { $ref: "#/components/responses/BadRequest" };
    }

    // Add 500 for all endpoints
    operation.responses["500"] = { $ref: "#/components/responses/InternalError" };

    pathMap.get(normalizedPath)[methodLower] = operation;
  });

  // Add tags to spec
  spec.tags = Array.from(tagSet).map((tag) => ({
    name: tag,
    description: `${tag} operations`,
  }));

  // Convert pathMap to paths object
  pathMap.forEach((methods, path) => {
    spec.paths[path] = methods;
  });

  return spec;
};

/**
 * Generate operationId from method and path
 */
function generateOperationId(method, path) {
  const segments = path.split("/").filter(Boolean);
  const resource = segments[0] || "resource";
  const action = method.toLowerCase();
  const hasParam = path.includes("{");

  if (hasParam) {
    return `${action}${capitalize(resource)}ById`;
  }

  return `${action}${capitalize(resource)}`;
}

/**
 * Extract resource name from path
 */
function extractResourceName(path) {
  const segments = path
    .split("/")
    .filter(Boolean)
    .filter((s) => !s.startsWith("{"));
  return segments[segments.length - 1] || segments[0] || "resource";
}

/**
 * Generate summary for operation
 */
function generateSummary(method, path) {
  const resource = extractResourceName(path);
  const hasParam = path.includes("{");

  const summaries = {
    GET: hasParam ? `Retrieve ${resource} by ID` : `List all ${resource}s`,
    POST: `Create new ${resource}`,
    PUT: `Update ${resource}`,
    PATCH: `Partially update ${resource}`,
    DELETE: `Delete ${resource}`,
  };

  return summaries[method] || `${method} ${resource}`;
}

/**
 * Generate description for operation
 */
function generateDescription(method, path) {
  const resource = extractResourceName(path);
  const hasParam = path.includes("{");

  const descriptions = {
    GET: hasParam ? `Retrieves detailed information about a specific ${resource} by its unique identifier.` : `Retrieves a paginated list of ${resource}s. Supports filtering and sorting through query parameters.`,
    POST: `Creates a new ${resource} with the provided data. Returns the created ${resource} with its assigned identifier.`,
    PUT: `Updates an existing ${resource} by replacing all of its properties with the provided data.`,
    PATCH: `Partially updates an existing ${resource} by modifying only the specified properties.`,
    DELETE: `Permanently deletes the specified ${resource}. This action cannot be undone.`,
  };

  return descriptions[method] || `Performs ${method} operation on ${resource}.`;
}

/**
 * Generate resource schema
 */
function generateResourceSchema(resourceName) {
  return {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "string",
        description: `Unique identifier for the ${resourceName}`,
        example: "507f1f77bcf86cd799439011",
      },
      name: {
        type: "string",
        description: `Name of the ${resourceName}`,
        example: `Sample ${capitalize(resourceName)}`,
      },
      description: {
        type: "string",
        description: `Detailed description of the ${resourceName}`,
        example: `This is a sample ${resourceName} for demonstration purposes`,
      },
      status: {
        type: "string",
        enum: ["active", "inactive", "pending"],
        description: `Current status of the ${resourceName}`,
        example: "active",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the resource was created",
        example: "2024-01-15T10:30:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Timestamp when the resource was last updated",
        example: "2024-01-20T14:45:00Z",
      },
    },
  };
}

/**
 * Generate input schema for create/update operations
 */
function generateInputSchema(resourceName) {
  return {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        description: `Name of the ${resourceName}`,
        example: `New ${capitalize(resourceName)}`,
      },
      description: {
        type: "string",
        description: `Detailed description of the ${resourceName}`,
        example: `Description for the new ${resourceName}`,
      },
      status: {
        type: "string",
        enum: ["active", "inactive"],
        description: `Initial status of the ${resourceName}`,
        example: "active",
      },
    },
  };
}

/**
 * Generate resource example
 */
function generateResourceExample(resourceName, context = "single") {
  const baseExample = {
    id: "507f1f77bcf86cd799439011",
    name: context === "created" ? `New ${capitalize(resourceName)}` : `Sample ${capitalize(resourceName)}`,
    description: `This is a sample ${resourceName}`,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  };

  if (context === "create" || context === "update") {
    // For input - remove id and timestamps
    const { id, createdAt, updatedAt, ...inputExample } = baseExample;
    return inputExample;
  }

  return baseExample;
}

/**
 * Check if endpoint requires authentication
 */
function requiresAuth(endpoint) {
  if (!endpoint.middlewares) return false;

  const authMiddlewares = ["protect", "authenticate", "auth", "requireAuth", "isAuthenticated"];
  return endpoint.middlewares.some((mw) => authMiddlewares.some((auth) => mw.toLowerCase().includes(auth.toLowerCase())));
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
