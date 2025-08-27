import mongoose from "mongoose";
const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("Error in connection ", error);
    });
};

export default connectDB;
