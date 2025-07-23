import connectDB from "./DB/connectionDB.js"
import userRouter from "./modules/users/users.controller.js"
import noteRouter from "./modules/notes/notes.controller.js"
const bootstrap = (app,express)=>{
app.use(express.json())
connectDB()
app.use("/users",userRouter)
app.use("/notes",noteRouter)
app.use("{/*demo}",(req,res,next)=>{
    return res.status(404).send("page not found")
})
}
export default bootstrap