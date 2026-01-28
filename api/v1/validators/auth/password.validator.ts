export const validateForgotPasswordRequestOtpInput = (payload: {
  email?: string;
}) => {
  if (!payload.email) {
    return { kind: "validation_error" as const, message: "Missing email" };
  }

  return { kind: "ok" as const, email: payload.email.toLowerCase().trim() };
};

export const validateVerifyResetPasswordOtpInput = (payload: {
  email?: string;
  otp?: string;
}) => {
  if (!payload.email || !payload.otp) {
    return {
      kind: "validation_error" as const,
      message: "Missing email or otp",
    };
  }

  return {
    kind: "ok" as const,
    email: payload.email.toLowerCase().trim(),
    otp: payload.otp,
  };
};

export const validateResetPasswordInput = (payload: {
  resetToken?: string;
  newPassword?: string;
}) => {
  if (!payload.resetToken || !payload.newPassword) {
    return {
      kind: "validation_error" as const,
      message: "Missing resetToken or newPassword",
    };
  }

  return {
    kind: "ok" as const,
    resetToken: payload.resetToken,
    newPassword: payload.newPassword,
  };
};
