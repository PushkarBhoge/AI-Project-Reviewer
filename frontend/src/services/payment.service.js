import api from "@/lib/api";

export const paymentService = {
  createCheckoutSession: (data) => api.post("/payments/create-checkout-session", data),
};
