import jwt from "jsonwebtoken";
export const generateToken = async ({ payload, Signature, options } = {}) => {  
  return jwt.sign(payload, Signature, options);
};
