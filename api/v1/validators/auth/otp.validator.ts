export const validateRequestOtpInput = (payload: { userId?: string }) => {
  if (!payload.userId) {
    return { kind: "unauthorized" as const, message: "Unauthorized" };
  }

  return { kind: "ok" as const, userId: payload.userId };
};

export const validateVerifyOtpInput = (payload: {
  userId?: string;
  otp?: string;
}) => {
  if (!payload.userId) {
    return { kind: "unauthorized" as const, message: "Unauthorized" };
  }

  if (!payload.otp) {
    return { kind: "validation_error" as const, message: "Missing otp" };
  }

  return { kind: "ok" as const, userId: payload.userId, otp: payload.otp };
};
