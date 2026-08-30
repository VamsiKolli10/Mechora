jest.mock("../../../utils/logger", () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const logger = require("../../../utils/logger");
const {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} = require("../../../middleware/errorHandler");

const createApp = () => {
  const app = express();
  app.use(requestIdMiddleware);
  app.get(
    "/operational",
    asyncHandler(async () => {
      throw new AppError("Product is unavailable.", {
        statusCode: 409,
        code: "PRODUCT_UNAVAILABLE",
      });
    })
  );
  app.get(
    "/internal",
    asyncHandler(async () => {
      throw new Error("database password appeared in an internal failure");
    })
  );
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe("central error handling", () => {
  beforeEach(() => jest.clearAllMocks());

  test("formats safe operational errors", async () => {
    const response = await request(createApp())
      .get("/operational")
      .set("X-Request-Id", "request-123")
      .expect(409);

    expect(response.body).toEqual({
      error: {
        code: "PRODUCT_UNAVAILABLE",
        message: "Product is unavailable.",
        request_id: "request-123",
      },
    });
    expect(response.headers["x-request-id"]).toBe("request-123");
    expect(logger.warn).toHaveBeenCalled();
  });

  test("masks unexpected internal errors while logging server details", async () => {
    const response = await request(createApp()).get("/internal").expect(500);

    expect(response.body.error.message).toBe("An internal server error occurred.");
    expect(JSON.stringify(response.body)).not.toContain("database password");
    expect(logger.error).toHaveBeenCalledWith(
      "An unexpected error occurred.",
      expect.objectContaining({
        statusCode: 500,
        stack: expect.stringContaining("database password"),
      })
    );
  });

  test("returns a consistent response for unknown routes", async () => {
    const response = await request(createApp()).get("/missing").expect(404);

    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(response.body.error.request_id).toBeDefined();
  });
});
