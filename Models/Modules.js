import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: [true, "Please provide role Id"],
        unique: true
    },
    moduleName: {
        type: String,
        required: [true, "Please provide role name"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        index: { sparse: true },
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null,
    }
});

export const Modules = mongoose.model('modules', moduleSchema);