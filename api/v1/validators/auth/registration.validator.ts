export const validateRegisterRequestOtpInput = (payload: {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}) => {
  if (!payload.email || !payload.password) {
    return {
      kind: "validation_error" as const,
      message: "Missing email or password",
    };
  }

  return {
    kind: "ok" as const,
    email: payload.email.toLowerCase().trim(),
    password: payload.password,
    fullName: payload.fullName,
    phone: payload.phone,
  };
};

export const validateVerifyRegisterOtpInput = (payload: {
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
