import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    firstName: {
        type: String,
        required: [true, "First name must be provided"],
        max: 30,
    },
    lastName: {
        type: String,
        required: [true, "Last name must be provided"],
        max: 30,
    },
    email: {
        type: String,
        required: [true, "Email must be provided"],
        index: { unique: true, message: "Email Already registered." },
        validate: validator.isEmail,
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number must be provided"]
    },
    gender: {
        type: String,
        required: [true, "Gender must be provided"],
    },
    role: {
        type: String,
        required: [true, "Login Type must be provided"]
    }, //for distinguishing teacher and student
    rollNumber: {
        type: String,
        index: { sparse: true }, // Allow multiple null values, avoid duplicate key errors
        default: null // Set default value to null
    },
    facultyCode: {
        type: String,
        index: { sparse: true }, // Allow multiple null values, avoid duplicate key errors
        default: null // Set default value to null
    },
    password: {
        type: String,
        required: [true, "Password must be provided"],
        select: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

//module.exports = mongoose.model("users", userSchema);
export const User = mongoose.model("users", userSchema);
