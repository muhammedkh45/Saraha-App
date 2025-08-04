import bcrypt from "bcryptjs";
export const hash = async ({plainText, saltRounds}) => {
  return bcrypt.hashSync(plainText, +saltRounds);
};
