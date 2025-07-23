import mongoose, { model } from "mongoose";
const noteSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        validate:{
            validator: function(v) {
                return v !== v.toUpperCase();
            },
            message: props => `${props.value} is all uppercase title!`
        }
    },
    content:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
},{
    timestamps:true
});

const noteModel = mongoose.models.note || model("note", noteSchema);
export default noteModel;