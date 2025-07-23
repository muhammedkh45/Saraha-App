import Router from "express"
import * as UC from "../users/users.service.js"
import { Authentication } from "../../middleware/authentication.js"
const userRouter = Router()
userRouter.post("/signup",UC.signUp)
userRouter.post("/login",UC.login)
userRouter.patch("",Authentication,UC.updateLoggedInUser)
userRouter.get("/verify/:token",UC.confirmEmail)
userRouter.delete("",Authentication,UC.deleteLoggedInUser)
userRouter.get("",Authentication,UC.getProfile)
export default userRouter