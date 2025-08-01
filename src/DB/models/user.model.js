import mongoose, { model } from "mongoose";
export let userGender = {
  male: "male",
  female: "female",
};
export let userRole = {
  user: "user",
  admin: "admin",
};
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    age: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 18 && v <= 60;
        },
        message: (props) =>
          `${props.value} is not a valid age. Age must be between 18 and 60.`,
      },
    },
    gender: {
      type: String,
      enum: Object.values(userGender),
      default: userGender.male,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.user,
    },
    isConfimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: false,
  }
);

const userModel = mongoose.models.user || model("user", userSchema);
export default userModel;
