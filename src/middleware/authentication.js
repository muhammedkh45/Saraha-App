import { userModel } from "../DB/models/user.model.js";
import dotenv from "dotenv";
import path from "node:path";
import { verifyToken } from "../utils/token/verifyToken.js";
import revokeTokenModel from "../DB/models/revoke-token.model.js";
dotenv.config({ path: path.resolve("src/config/.env") });

export const Authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Error("Authorization header missing", { cause: 401 });
    }
    const [prefix, token] = authorization.split(" ");

    if (!prefix || !token) {
      throw new Error("Token not exist.", { cause: 401 });
    }
    let Signature;
    switch (prefix.toLowerCase()) {
      case "bearer":
        Signature = process.env.JWT_USER_SECRET;
        break;
      case "admin":
        Signature = process.env.JWT_ADMIN_SECRET;
        break;
      default:
        throw new Error("Invalid token prefix", { cause: 401 });
    }
    const decoded = await verifyToken({
      payload: token,
      Signature: Signature,
    });
    const revoked = await revokeTokenModel.findOne({ tokenId: decoded.jti });
    if (revoked) {
      throw new Error("User not loged in ", { cause: 401 });
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new Error("User not found", { cause: 404 });
    }
    req.user = user;
    req.decoded = decoded;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token", { cause: 401 });
    } else if (error.name === "TokenExpiredError") {
      throw new Error("Token expired", { cause: 401 });
    } else {
      throw new Error(error.message, { cause: error.cause });
    }
  }
};