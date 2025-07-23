import jwt from "jsonwebtoken"
import userModel from "../../DB/models/user.model.js"
import noteModel from "../../DB/models/note.model.js"
import mongoose from "mongoose"
export const addNote = async (req,res,next)=>{
    try {
        const {title,content} = req.body
        await noteModel.create({title,content,userId:req.user._id})
        return res.status(201).json({message:"Note created."})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
} 

export const updateNote = async (req,res,next)=>{
    try {
        const {title,content} = req.body
        const {noteId} = req.params
        const note = await noteModel.findById(noteId,"-__v")
        if(!note){
            return res.status(404).json({message:"Note not exsits "})
        }
        if(req.user._id.toString() !== note.userId.toString())
        {
            return res.status(401).json({message:"You are not the owner"})
        }
        const updatedNote= await noteModel.findByIdAndUpdate(noteId,{title:title,content:content}).select('-__v')
        return res.status(200).json({message:"Updated",updatedNote})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
} 
export const replaceNote = async (req,res,next)=>{
    try {
        const {title,content,userId} = req.body
        const {noteId} = req.params
        const note = await noteModel.findById(noteId,"-__v")        
        if(!note){
            return res.status(404).json({message:"Note not exsits "})
        }
        if(req.user._id.toString() !== note.userId.toString())
        {
            return res.status(401).json({message:"You are not the owner"})
        }
        const updatedNote= await noteModel.findByIdAndUpdate(noteId,{title:title,content:content,userId:userId}).select('-__v')
        return res.status(200).json({updatedNote})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
} 
export const updateAllTitle = async(req,res,next)=>{
    try {
        const {title} = req.body
        if(!await noteModel.find({userId:req.user._id})){
            return res.status(404).json({message:"No notes found"})
        }
        const notes = await noteModel.updateMany({userId:req.user._id},{title:title})
        return res.status(200).json({message:"All notes updated",notes:notes})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const deleteNote = async (req,res,next)=>{
    try {
        const {noteId} = req.params
        const note = await noteModel.findById(noteId,"-__v")
        if(!note){
            return res.status(404).json({message:"Note not exsits "})
        }
        if(req.user._id.toString() !== note.userId.toString())
        {
            return res.status(401).json({message:"You are not the owner"})
        }
        const deletedNote= await noteModel.findByIdAndDelete(noteId).select('-__v')
        return res.status(200).json({message:"deleted",deletedNote})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
        
    }
}
export const getNoteByID = async (req,res,next)=>{
    try {
        const {noteId} = req.params
        const note = await noteModel.findById(noteId)
        if(!note){
            return res.status(404).json("Note not found")
        }
        if(req.user._id.toString() !== note.userId.toString()){
            return res.status(401).json("you are not the owner")
        }
        return res.status(200).json(note)
    } catch (error) {
                return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getNoteBycontent = async (req,res,next)=>{
    try {
        const {content} = req.query
        const notes = await noteModel.find({
            userId: req.user._id, 
            content: {$regex:content,$options:'i'}
        })
        if(!notes || notes.length ==0){
            return res.status(404).json("No note found")
        }
        return res.status(200).json(notes)
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getNoteWithUser = async (req,res,next)=>{
    try {
        const notes = await noteModel.find({userId: req.user._id},{title:1,createdAt:1,_id:0}).populate([{
            path:"userId",
            select:"email -_id"
        }])
        if(!notes || notes.length ==0){
            return res.status(404).json("No note found")
        }
        return res.status(200).json(notes)
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const DeleteAllNotes = async (req,res,next)=>{
    try {
        const notes = await noteModel.deleteMany({userId: req.user._id})
        if(!notes || notes.deletedCount ==0){
            return res.status(404).json("No note found")
        }
        return res.status(200).json({message:"Deleted"})
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getNotebyTitle = async (req,res,next)=>{
    try {
        const {title} = req.query
        const notes = await noteModel.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(req.user._id),
                title: { $regex: title, $options: "i" }
            }
        },
        {
            $project: {
                title: 1,
                userId: 1,
                createdAt: 1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user" 
        },
        {
            $project: {
                _id: 0,
                title: 1,
                createdAt: 1,
                "user.name": 1,
                "user.email": 1
            }
        }
    ]);
        if(!notes || notes.length ==0){
            return res.status(404).json("No note found")
        }
        return res.status(200).json(notes)
    } catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}
export const getPaginatedNotes= async(req,res,next)=>{
    try {

        const page = parseInt(req.query.page) || 1

        const limit = parseInt(req.query.limit) || 10

        const skip = (page - 1) * limit;

        const notes = await noteModel.find({userId:req.user._id})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select("-__v")

        const total = await noteModel.countDocuments();
        if(!notes || notes.length==0){
            return res.status(404).json({message:"No notes found."})
        }
        return res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        results: notes
    });
    } 
    catch (error) {
        return res.status(500).json({message:"Error occurred", err: error.message || "An unexpected error occurred."});
    }
}