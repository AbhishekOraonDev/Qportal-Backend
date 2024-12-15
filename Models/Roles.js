import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    roleId: {
        type: String,
        required: [true, "Please provide role Id"],
        unique: true
    },
    roleName: {
        type: String,
        required: [true, "Please provide role name"]
    },
    permissionIds: {
        type: [String], // An array to handle multiple permissions for a single role
        required: [true, "Please provide premissionId's"],
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
        index: { sparse: true },
        default: null,
    }
});

export const Roles = mongoose.model('roles', roleSchema);