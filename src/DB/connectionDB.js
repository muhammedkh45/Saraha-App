import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve("src/config/.env") });
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
