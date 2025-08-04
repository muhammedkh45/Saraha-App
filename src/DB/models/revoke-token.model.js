import mongoose, { model } from "mongoose";
const revokeTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },
    expireAt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const revokeTokenModel =
  mongoose.models.revokeToken || model("revokeToken", revokeTokenSchema);
export default revokeTokenModel;
