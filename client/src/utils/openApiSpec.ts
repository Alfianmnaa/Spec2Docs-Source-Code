// OpenAPI 3.0.3 Specification Utility
export const createOpenApiSpec = () => ({
  openapi: "3.0.3",
  info: {
    title: "User Management API",
    description:
      "A comprehensive RESTful API for user management operations. This API provides endpoints for creating, reading, updating, and deleting user accounts, as well as authentication and authorization features. Built with Express.js and documented automatically by Spec2Docs with AI-powered narrative enhancement.",
    version: "1.0.0",
    contact: {
      name: "API Support Team",
      email: "support@spec2docs.dev",
      url: "https://spec2docs.dev/support",
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
    {
      url: "https://staging-api.example.com/v1",
      description: "Staging server",
    },
    {
      url: "http://localhost:3000/v1",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Users",
      description: "User management operations",
    },
    {
      name: "Authentication",
      description: "Authentication and authorization endpoints",
    },
  ],
  paths: {
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Retrieves a paginated list of all users in the system. Supports filtering by role, status, and search query. Results are sorted by creation date in descending order by default.",
        operationId: "getUsers",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number for pagination (starts from 1)",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of items per page (max 100)",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
          },
          {
            name: "role",
            in: "query",
            description: "Filter users by role",
            required: false,
            schema: {
              type: "string",
              enum: ["admin", "user", "moderator"],
              example: "user",
            },
          },
          {
            name: "status",
            in: "query",
            description: "Filter users by account status",
            required: false,
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
              example: "active",
            },
          },
          {
            name: "search",
            in: "query",
            description: "Search users by name or email",
            required: false,
            schema: {
              type: "string",
              example: "john",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved users list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/Pagination",
                    },
                  },
                },
                example: {
                  success: true,
                  data: [
                    {
                      id: "usr_123abc",
                      email: "john.doe@example.com",
                      name: "John Doe",
                      role: "user",
                      status: "active",
                      avatar: "https://example.com/avatars/john.jpg",
                      createdAt: "2024-01-15T10:30:00Z",
                      updatedAt: "2024-01-20T14:45:00Z",
                    },
                  ],
                  pagination: {
                    currentPage: 1,
                    totalPages: 5,
                    totalItems: 47,
                    itemsPerPage: 10,
                    hasNext: true,
                    hasPrev: false,
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      post: {
        tags: ["Users"],
        summary: "Create a new user",
        description: "Creates a new user account with the provided details. The email address must be unique across all users. A verification email will be sent to the provided email address.",
        operationId: "createUser",
        requestBody: {
          required: true,
          description: "User data for creating a new account",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserCreate",
              },
              example: {
                email: "jane.smith@example.com",
                password: "SecurePass123!",
                name: "Jane Smith",
                role: "user",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "User created successfully. Verification email sent.",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  success: false,
                  error: {
                    code: "EMAIL_EXISTS",
                    message: "A user with this email address already exists",
                  },
                },
              },
            },
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Retrieves detailed information about a specific user by their unique identifier. Returns the full user profile including metadata.",
        operationId: "getUserById",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Unique user identifier",
            required: true,
            schema: {
              type: "string",
              pattern: "^usr_[a-zA-Z0-9]+$",
              example: "usr_123abc",
            },
          },
        ],
        responses: {
          "200": {
            description: "User found and returned successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/UserDetail",
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Updates an existing user's information. Only provided fields will be updated (partial update supported). Email changes require re-verification.",
        operationId: "updateUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Unique user identifier",
            required: true,
            schema: {
              type: "string",
              pattern: "^usr_[a-zA-Z0-9]+$",
              example: "usr_123abc",
            },
          },
        ],
        requestBody: {
          required: true,
          description: "User data to update",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserUpdate",
              },
              example: {
                name: "John D. Smith",
                avatar: "https://example.com/avatars/john-new.jpg",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "User updated successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Permanently removes a user from the system. This action cannot be undone. All associated data will be deleted according to our data retention policy.",
        operationId: "deleteUser",
        parameters: [
          {
            name: "id",
            in: "path",
            description: "Unique user identifier",
            required: true,
            schema: {
              type: "string",
              pattern: "^usr_[a-zA-Z0-9]+$",
              example: "usr_123abc",
            },
          },
        ],
        responses: {
          "204": {
            description: "User deleted successfully (no content returned)",
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticates a user with email and password. Returns access and refresh tokens on successful authentication.",
        operationId: "login",
        requestBody: {
          required: true,
          description: "Login credentials",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
              example: {
                email: "john.doe@example.com",
                password: "SecurePass123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      properties: {
                        user: {
                          $ref: "#/components/schemas/User",
                        },
                        tokens: {
                          $ref: "#/components/schemas/AuthTokens",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  success: false,
                  error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                  },
                },
              },
            },
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "User registration",
        description: "Registers a new user account. A verification email will be sent to complete the registration process.",
        operationId: "register",
        requestBody: {
          required: true,
          description: "Registration data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
              example: {
                email: "newuser@example.com",
                password: "SecurePass123!",
                name: "New User",
                acceptTerms: true,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Registration successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Registration successful. Please check your email to verify your account.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/BadRequest",
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description: "Refreshes an expired access token using a valid refresh token.",
        operationId: "refreshToken",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Valid refresh token",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/AuthTokens",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            $ref: "#/components/responses/InternalError",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique user identifier",
            example: "usr_123abc",
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
            example: "john.doe@example.com",
          },
          name: {
            type: "string",
            description: "User's full name",
            example: "John Doe",
          },
          role: {
            type: "string",
            enum: ["admin", "user", "moderator"],
            description: "User's role in the system",
            example: "user",
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended"],
            description: "Account status",
            example: "active",
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "URL to user's avatar image",
            example: "https://example.com/avatars/john.jpg",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
            example: "2024-01-15T10:30:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
            example: "2024-01-20T14:45:00Z",
          },
        },
      },
      UserDetail: {
        allOf: [
          {
            $ref: "#/components/schemas/User",
          },
          {
            type: "object",
            properties: {
              emailVerified: {
                type: "boolean",
                description: "Whether email is verified",
                example: true,
              },
              lastLoginAt: {
                type: "string",
                format: "date-time",
                description: "Last login timestamp",
                example: "2024-01-20T08:00:00Z",
                nullable: true,
              },
              preferences: {
                type: "object",
                properties: {
                  theme: {
                    type: "string",
                    enum: ["light", "dark", "system"],
                    example: "dark",
                  },
                  language: {
                    type: "string",
                    example: "en",
                  },
                  notifications: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        ],
      },
      UserCreate: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User's email address (must be unique)",
            example: "jane.smith@example.com",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            description: "Password (min 8 characters, must contain uppercase, lowercase, number, and special character)",
            example: "SecurePass123!",
          },
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "User's full name",
            example: "Jane Smith",
          },
          role: {
            type: "string",
            enum: ["admin", "user", "moderator"],
            default: "user",
            description: "User's role (defaults to 'user')",
            example: "user",
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "URL to user's avatar image",
            example: "https://example.com/avatars/jane.jpg",
          },
        },
      },
      UserUpdate: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "New email address (requires re-verification)",
            example: "john.new@example.com",
          },
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "Updated full name",
            example: "John D. Smith",
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "New avatar URL",
            example: "https://example.com/avatars/john-new.jpg",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            description: "Account status (admin only)",
            example: "active",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            format: "password",
            description: "User's password",
            example: "SecurePass123!",
          },
          rememberMe: {
            type: "boolean",
            default: false,
            description: "Extend token expiration",
            example: true,
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "name", "acceptTerms"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Email address for the new account",
            example: "newuser@example.com",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            description: "Account password",
            example: "SecurePass123!",
          },
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            description: "User's full name",
            example: "New User",
          },
          acceptTerms: {
            type: "boolean",
            description: "Must be true to accept terms of service",
            example: true,
          },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            description: "JWT access token (expires in 15 minutes)",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzYWJjIiwiaWF0IjoxNjQyNDIwMDAwLCJleHAiOjE2NDI0MjA5MDB9...",
          },
          refreshToken: {
            type: "string",
            description: "Refresh token (expires in 7 days)",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzYWJjIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE2NDI0MjAwMDAsImV4cCI6MTY0MzAyNDgwMH0...",
          },
          expiresIn: {
            type: "integer",
            description: "Access token expiration time in seconds",
            example: 900,
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          currentPage: {
            type: "integer",
            description: "Current page number",
            example: 1,
          },
          totalPages: {
            type: "integer",
            description: "Total number of pages",
            example: 5,
          },
          totalItems: {
            type: "integer",
            description: "Total number of items",
            example: 47,
          },
          itemsPerPage: {
            type: "integer",
            description: "Items per page",
            example: 10,
          },
          hasNext: {
            type: "boolean",
            description: "Whether there's a next page",
            example: true,
          },
          hasPrev: {
            type: "boolean",
            description: "Whether there's a previous page",
            example: false,
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Error code for programmatic handling",
                example: "VALIDATION_ERROR",
              },
              message: {
                type: "string",
                description: "Human-readable error message",
                example: "The request data is invalid",
              },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: {
                      type: "string",
                      example: "email",
                    },
                    message: {
                      type: "string",
                      example: "Invalid email format",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request - Invalid input data",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "The request data is invalid",
                details: [
                  {
                    field: "email",
                    message: "Invalid email format",
                  },
                ],
              },
            },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized - Authentication required",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Authentication is required to access this resource",
              },
            },
          },
        },
      },
      NotFound: {
        description: "Not Found - Resource does not exist",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "The requested resource was not found",
              },
            },
          },
        },
      },
      InternalError: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
            example: {
              success: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred. Please try again later.",
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
      },
    },
  },
});

export const convertToYaml = (spec: any): string => {
  // Validate spec has required fields
  if (!spec || !spec.info || !spec.info.title) {
    console.error("Invalid spec for YAML conversion:", spec);
    return "# Invalid OpenAPI Specification\n# Missing required fields (info.title)\n";
  }

  const info = spec.info || {};
  const contact = info.contact || {};
  const license = info.license || {};
  const servers = spec.servers || [];
  const tags = spec.tags || [];

  return `openapi: ${spec.openapi || "3.0.3"}
info:
  title: ${info.title || "Untitled API"}
  description: >
    ${info.description || "No description provided"}
  version: ${info.version || "1.0.0"}
  contact:
    name: ${contact.name || "API Support"}
    email: ${contact.email || "support@example.com"}
    url: ${contact.url || "https://example.com"}
  license:
    name: ${license.name || "MIT"}
    url: ${license.url || "https://opensource.org/licenses/MIT"}

servers:
${servers.length > 0 ? servers.map((s: any) => `  - url: ${s.url || ""}\n    description: ${s.description || ""}`).join("\n") : "  - url: http://localhost:3000\n    description: Local server"}

tags:
${tags.length > 0 ? tags.map((t: any) => `  - name: ${t.name || ""}\n    description: ${t.description || ""}`).join("\n") : "  - name: default\n    description: Default tag"}

paths:
  /users:
    get:
      tags: [Users]
      summary: List all users
      description: >
        Retrieves a paginated list of all users in the system.
        Supports filtering by role, status, and search query.
      operationId: getUsers
      parameters:
        - name: page
          in: query
          description: Page number for pagination (starts from 1)
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of items per page (max 100)
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
        - name: role
          in: query
          description: Filter users by role
          schema:
            type: string
            enum: [admin, user, moderator]
        - name: status
          in: query
          description: Filter users by account status
          schema:
            type: string
            enum: [active, inactive, suspended]
      responses:
        '200':
          description: Successfully retrieved users list
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'
      security:
        - bearerAuth: []

    post:
      tags: [Users]
      summary: Create a new user
      description: >
        Creates a new user account with the provided details.
        Email must be unique. Verification email will be sent.
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
            example:
              email: jane.smith@example.com
              password: SecurePass123!
              name: Jane Smith
              role: user
      responses:
        '201':
          description: User created successfully
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email already exists
      security:
        - bearerAuth: []

  /users/{id}:
    get:
      tags: [Users]
      summary: Get user by ID
      operationId: getUserById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            pattern: ^usr_[a-zA-Z0-9]+$
      responses:
        '200':
          description: User found
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

    put:
      tags: [Users]
      summary: Update user
      operationId: updateUser
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: User updated successfully
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

    delete:
      tags: [Users]
      summary: Delete user
      operationId: deleteUser
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: User deleted successfully
        '404':
          $ref: '#/components/responses/NotFound'
      security:
        - bearerAuth: []

  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
        '401':
          description: Invalid credentials

  /auth/register:
    post:
      tags: [Authentication]
      summary: User registration
      operationId: register
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: Registration successful
        '409':
          description: Email already registered

  /auth/refresh:
    post:
      tags: [Authentication]
      summary: Refresh access token
      operationId: refreshToken
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken:
                  type: string
      responses:
        '200':
          description: Token refreshed successfully
        '401':
          description: Invalid or expired refresh token

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: usr_123abc
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]
        status:
          type: string
          enum: [active, inactive, suspended]
        createdAt:
          type: string
          format: date-time

    UserCreate:
      type: object
      required: [email, password, name]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
          minLength: 8
        name:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]
          default: user

    UserUpdate:
      type: object
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        avatar:
          type: string
          format: uri

    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    RegisterRequest:
      type: object
      required: [email, password, name, acceptTerms]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        name:
          type: string
        acceptTerms:
          type: boolean

    AuthTokens:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        expiresIn:
          type: integer

    Pagination:
      type: object
      properties:
        currentPage:
          type: integer
        totalPages:
          type: integer
        totalItems:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

    Error:
      type: object
      properties:
        success:
          type: boolean
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string

  responses:
    BadRequest:
      description: Bad Request
    Unauthorized:
      description: Unauthorized
    NotFound:
      description: Not Found
    InternalError:
      description: Internal Server Error

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT`;
};
