import jwt from "jsonwebtoken";
export const verifyToken = async ({ payload, Signature }) => {
  return jwt.verify(payload, Signature);
};
