import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    permissionId: {
        type: String,
        required: [true, "Please provide permission Id"],
        unique: true
    },
    permissionName: {
        type: String,
        required: [true, "Please provide permission name"]
    },
    isParent: {
        type: Boolean,
        default: false
    },
    parentId: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


export const Permissions = mongoose.model("permissions", permissionSchema);