/**
 * Standardized success response helper.
 *
 * @example ApiResponse.success(res, 200, "Users retrieved", { users });
 * @example ApiResponse.success(res, 201, "User created", { user });
 */
export class ApiResponse {
  static success(res, statusCode = 200, message = "Success", data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
