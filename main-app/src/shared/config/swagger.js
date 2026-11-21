const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

// swagger-jsdoc uses glob patterns, which need forward slashes even on Windows
const docsGlob = path
  .join(__dirname, "..", "..", "modules", "**", "*.docs.js")
  .replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "E-Commerce Main App API",
      version: "1.0.0",
      description: "Products, Users, Cart and Orders modules",
    },
    servers: [{ url: "/api/v1", description: "Version 1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: {
                    type: "string",
                    example: "email must be a valid email",
                  },
                  in: { type: "string", example: "body" },
                },
              },
            },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
      },
      responses: {
        ValidationError: {
          description: "Request failed validation",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
            },
          },
        },
        Unauthorized: {
          description: "Missing, invalid or expired token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  apis: [docsGlob],
};

module.exports = swaggerJsdoc(options);
