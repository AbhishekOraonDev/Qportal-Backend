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
    permissions: {
        View: {
            type: [String],
            default: []
        },
        Update: {
            type: [String],
            default: []
        },
        Delete: {
            type: [String],
            default: []
        },
        Create: {
            type: [String],
            default: []
        }
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