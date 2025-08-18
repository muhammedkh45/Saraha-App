import Router from "express";
import * as UC from "../users/users.service.js";
import * as UV from "../users/user.validation.js";
import { Authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import { userRole } from "../../DB/models/user.model.js";
import { authorization } from "../../middleware/authorization.js";
import * as Multer from "../../middleware/multer.js";
const userRouter = Router();
userRouter.post(
  "/signup",
  Multer.MulterRemote(/jpeg|jpg|png/).single("image"),
  validation(UV.signupSchema),
  UC.signUp
);
userRouter.post("/login", UC.login);
userRouter.post("/login-with-gmail", UC.loginWithGmail);
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
  validation(UV.updatePassswordSchema),
  Authentication,
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
  validation(UV.updateProfileSchema),
  Authentication,
  UC.updateProfile
);
userRouter.delete(
  "/freezeProfile/{:id}",
  validation(UV.freezeProfileSchema),
  Authentication,
  UC.freezeProfile
);
export default userRouter;
