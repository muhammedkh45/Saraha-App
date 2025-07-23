import jwt from "jsonwebtoken"
import userModel from "../DB/models/user.model.js"
import dotenv from 'dotenv';
dotenv.config();

export const Authentication = async (req,res,next)=>{
    try {
        const {authorization} =req.headers
        if (!authorization) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        const [prefix,token] = authorization.split(" ") 
        
        if(!prefix || !token ){
            return res.status(401).json({message:"Token not exist."})
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
                return res.status(401).json({ message: "Invalid token prefix" });
        }
        const decoded = jwt.verify(token,Signature)
        
        const user = await userModel.findById(decoded.id)
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        req.user = user
        return next()
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else {
            return res.status(500).json({ message: "Error occurred", err: error.message || "An unexpected error occurred." });
        }
    }
}
