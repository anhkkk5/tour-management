import User from "../../models/user/user.model";

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email: email.toLowerCase().trim() });
};

export const findActiveUserByEmail = async (email: string) => {
  return await User.findOne({
    email: email.toLowerCase().trim(),
    deleted: false,
  });
};

export const findActiveUserByEmailWithPasswordHash = async (email: string) => {
  return await User.findOne({
    email: email.toLowerCase().trim(),
    deleted: false,
  }).select("+passwordHash");
};

export const findActiveUserById = async (userId: string) => {
  return await User.findOne({ _id: userId, deleted: false });
};

export const saveUser = async (user: any) => {
  return await user.save();
};
