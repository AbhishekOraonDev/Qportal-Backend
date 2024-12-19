import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    permissionId: {
        type: String,
        required: [true, "Please provide permission Id"],
        unique: true
    },
    ModuleId: {
        type: String,
        required: [true, "Please provide module Id"]
    },
    Action: {
        type: String,
        enum: [{1: "View"} , {2: "Update"}, {3: "Delete"}, {4: "Create"}],
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null,
    }
})


export const Permissions = mongoose.model("permissions", permissionSchema);