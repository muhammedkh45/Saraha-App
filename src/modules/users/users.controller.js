import Router from "express"
import * as UC from "../users/users.service.js"
const userRouter = Router()
userRouter.post("/signup",UC.signUp)
userRouter.post("/login",UC.login)
userRouter.patch("",UC.updateLoggedInUser)
userRouter.delete("",UC.deleteLoggedInUser)
userRouter.get("",UC.getProfile)
export default userRouter