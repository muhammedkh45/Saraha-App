import Router from "express";
import * as UC from "../users/users.service.js";
import * as UV from "../users/user.validation.js";
import { Authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import { userRole } from "../../DB/models/user.model.js";
import { authorization } from "../../middleware/authorization.js";
const userRouter = Router();
userRouter.post("/signup", validation(UV.signupSchema), UC.signUp);
userRouter.post("/login", UC.login);
userRouter.post("/logout", Authentication, UC.logout);
userRouter.patch("/verify/:verficationToken/:refreshToken", UC.confirmEmail);
userRouter.patch("", Authentication, UC.updateLoggedInUser);
userRouter.delete("", Authentication, UC.deleteLoggedInUser);
userRouter.get(
  "",
  Authentication,
  authorization([userRole.user, userRole.admin]),
  UC.getProfile
);
userRouter.patch(
  "/updatePasssword",
  Authentication,
  validation(UV.updatePassswordSchema),
  UC.updatePassword
);
userRouter.patch(
  "/forgetPasssword",
  validation(UV.forgetPassswordSchema),
  UC.forgetPassword
);
userRouter.patch(
  "/resetPasssword",
  validation(UV.resetPassswordSchema),
  UC.resetPassword
);
userRouter.patch(
  "/updateProfile",
  Authentication,
  validation(UV.updateProfileSchema),
  UC.updateProfile
);
export default userRouter;
