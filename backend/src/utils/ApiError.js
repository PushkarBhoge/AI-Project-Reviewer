/**
 * Custom API error with HTTP status code.
 * Throw these in controllers and they'll be caught by the global error handler.
 *
 * @example throw new ApiError(404, "Project not found");
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
