import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/Assignment8")
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("Error in connection ", error);
    });
};

export default connectDB;
