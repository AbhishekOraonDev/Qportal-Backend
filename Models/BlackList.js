import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            ref: "User"
        },
    },
    { timestamps: true}
);

export default mongoose.model("blacklist", blackListSchema);