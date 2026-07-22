import api from "@/lib/api";

export const paymentService = {
  createOrder: (data) => api.post("/payments/create-order", data),
  createCheckoutSession: (data) => api.post("/payments/create-order", data),
  verifyPayment: (data) => api.post("/payments/verify-payment", data),
};
