import userModel from "../../DB/models/user.model.js"
import bcrypt from "bcryptjs"
import CryptoJS from "crypto-js"
import jwt from "jsonwebtoken"
export const signUp = async (req,res,next)=>{
    try {
        const {name,email,password,cPassword,phone,age} = req.body
        if(password!==cPassword)
            return res.status(400).json({message:"Password not matching Confirmed password"})
        const user = await userModel.findOne({email},)
        if(user)
            return res.status(409).json({message:"Email already exists."})
        const hash = bcrypt.hashSync(password,10)
        const ciphertext = CryptoJS.AES.encrypt(phone,"phone_123").toString();
        const newUser = await userModel.create({name,email,password:hash,phone:ciphertext,age})
        return res.status(201).json({message:"User added successfully."})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
} 
export const login = async (req,res,next) =>{
    try {
        const {email,password} = req.body
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(409).json({message:"invalid email or password."})
        }
        const match = bcrypt.compareSync(password,user.password)
        if(!match){
            return res.status(409).json({message:"invalid email or password."})
        }
        const token = jwt.sign({id:user._id, email:email},"userSecret",{expiresIn:"1h"})
        return res.status(200).json({message:"Login Successfull" ,token:token})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const updateLoggedInUser = async (req,res,next)=>{
    try {
        const {authorization} = req.headers
        const decoded = jwt.verify(authorization,"userSecret")
        const user = await userModel.findById(decoded.id)
        const {name,email,age} = req.body
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        if(await userModel.findOne({email})){
            return res.status(409).json({message:"Email already Exist"})
        }
        await userModel.updateOne({_id :user._id},{name:name,email:email,age:age})
        return res.status(201).json({message:"User updated"})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}

export const deleteLoggedInUser = async (req,res,next)=>{
    try {
        const {authorization} = req.headers
        const decoded = jwt.verify(authorization,"userSecret")
        const user = await userModel.findOneAndDelete(decoded.id)
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        return res.status(201).json({message:"User deleted"})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getProfile = async (req,res,next)=>{
    try {
        const {authorization} = req.headers
        const decoded = jwt.verify(authorization,"userSecret")
        const user = await userModel.findById(decoded.id).select('-password -__v').lean()
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        const phone = CryptoJS.AES.decrypt(user.phone,"phone_123").toString(CryptoJS.enc.Utf8)
        const password =""
        return res.status(200).json({...user,phone,password})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}