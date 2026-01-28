import {
  deleteOtp,
  deletePendingRegistration,
  deleteResetPasswordOtp,
  deleteResetPasswordToken,
  deleteRefreshToken,
  deleteRegisterOtp,
  deleteUserRefreshToken,
  getOtp,
  getPendingRegistration,
  getResetPasswordEmailByToken,
  getResetPasswordOtp,
  getRefreshToken,
  getRegisterOtp,
  setOtp,
  setPendingRegistration,
  setResetPasswordOtp,
  setResetPasswordToken,
  setRefreshToken,
  setRegisterOtp,
} from "../../../../utils/redis.client";

export const isRedisErrorMessage = (message: string) =>
  /redis|ioredis|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNRESET|WRONGPASS|NOAUTH|TLS|CERT/i.test(
    message,
  );

export {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshToken,
  setOtp,
  getOtp,
  deleteOtp,
  setPendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
  setRegisterOtp,
  getRegisterOtp,
  deleteRegisterOtp,
  setResetPasswordOtp,
  getResetPasswordOtp,
  deleteResetPasswordOtp,
  setResetPasswordToken,
  getResetPasswordEmailByToken,
  deleteResetPasswordToken,
};
