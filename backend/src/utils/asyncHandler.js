/**
 * Wraps an async route handler to catch errors and forward to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 *
 * @example router.get("/", asyncHandler(myController));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
