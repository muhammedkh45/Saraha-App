import userModel from "../../DB/models/user.model.js"
import bcrypt from "bcryptjs"
import CryptoJS from "crypto-js"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
import { userRole } from "../../DB/models/user.model.js";
import { emailtemp } from "../../../service/VerficationEmail.js";
import { sendEmail } from "../../../service/sendemail.js";
dotenv.config();
const secret = process.env.JWT_SECRET;
export const signUp = async (req,res,next)=>{
    try {
        const {name,email,password,cPassword,phone,age,gender,role} = req.body
        if(password!==cPassword)
            return res.status(400).json({message:"Password not matching Confirmed password"})
        const user = await userModel.findOne({email},)
        if(user)
            return res.status(409).json({message:"Email already exists."})
        const hash = bcrypt.hashSync(password,10)
        const ciphertext = CryptoJS.AES.encrypt(phone,secret).toString();
        const verficationToken = jwt.sign({email},secret,{expiresIn:'3m'})
        const html = emailtemp(`http://localhost:3000/users/verify/${verficationToken}`)
        const isSent = await sendEmail({to:email,html:html})
        if(!isSent){
            return res.status(400).json({message:"Failed to send Verfication email"})
        }
        const userData = {
            name,
            email,
            password: hash,
            phone: ciphertext,
            age,
        };
        if (gender) userData.gender = gender;
        if (role) userData.role = role;
        const newUser = await userModel.create(userData)
        return res.status(201).json({message:"User added successfully."})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
} 
export const login = async (req,res,next) =>{
    try {
        const {email,password} = req.body
        const user = await userModel.findOne({email,isConfimed:true})
        if(!user){
            return res.status(409).json({message:"invalid email or password."})
        }
        const match = bcrypt.compareSync(password,user.password)
        if(!match){
            return res.status(409).json({message:"invalid email or password."})
        }
        const token = jwt.sign({id:user._id, email:email},user.role === userRole.user ? process.env.JWT_USER_SECRET:process.env.JWT_ADMIN_SECRET ,{expiresIn:"1h"})        
        return res.status(200).json({message:"Login Successfull" ,token:token})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const updateLoggedInUser = async (req,res,next)=>{
    try {
        const {name,email,age} = req.body
        if(await userModel.findOne({email})){
            return res.status(409).json({message:"Email already Exist"})
        }
        await userModel.updateOne({_id :req.user._id},{name:name,email:email,age:age})
        return res.status(201).json({message:"User updated"})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}

export const deleteLoggedInUser = async (req,res,next)=>{
    try {
        await userModel.deleteOne(req.user._id)
        return res.status(201).json({message:"User deleted"})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getProfile = async (req,res,next)=>{
    try {
        const phone = CryptoJS.AES.decrypt(req.user.phone,secret).toString(CryptoJS.enc.Utf8)
        const password = ""
        return res.status(200).json({...req.user._doc,phone,password})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const confirmEmail = async (req,res,next)=>{
    try {
        const {token} =req.params
        if (!token) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        const decoded = jwt.verify(token,secret)
        const user = await userModel.findOne({email:decoded.email,isConfimed:false})
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        await userModel.updateOne({isConfimed:true})
        return res.status(200).json({message:"User confirmed successfully", user})
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