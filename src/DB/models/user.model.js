import mongoose, { model } from "mongoose";
export let userGender = {
  male: "male",
  female: "female",
};
export let userRole = {
  user: "user",
  admin: "admin",
};
export let userProviders = {
  system: "system",
  google: "google",
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
      required: function () {
        return this.provide == userProviders.system ? true : false;
      },
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
    otp: {
      type: String,
    },
    isDeleted: Boolean,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    image: String,
    provide: {
      type: String,
      enum: Object.values(userProviders),
    },
  },
  {
    strict: false,
  }
);

export const userModel = mongoose.models.user || model("user", userSchema);
