export const validateLoginInput = (payload: {
  email?: string;
  password?: string;
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
  };
};

export const validateRefreshInput = (payload: { refreshToken?: string }) => {
  if (!payload.refreshToken) {
    return {
      kind: "missing_refresh" as const,
      message: "Missing refresh token",
    };
  }
  return { kind: "ok" as const, refreshToken: payload.refreshToken };
};
