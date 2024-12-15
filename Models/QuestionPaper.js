import mongoose from "mongoose";

const questionPaperSchema = new mongoose.Schema(
    {
        course: {
            type: String,
            required: [true, "Please enter course "],
        },
        department: {
            type: String,
            required: [true, "Please enter department"],
        },
        semester: {
            type: String,
            required: [true, "Please enter semester"],
        },
        year: {
            type: String,
            required: [true, "Please enter year"],
        },
        examType: {
            type: String,
            required: [true, "Please enter exam type"],
        },
        paperCode: {
            type: String,
            required: [true, "Please enter paper code"],
            max: 50,
        },
        paperName: {
            type: String,
            required: [true, "Please enter paper name"],
            max: 50,
        },
        questionPaper: {
            type: String,
            required: [true, "Please provide question paper"],
        },
        createdAt: {
            type: Date,
            index: { sparse: true }, // Allow multiple null values, avoid duplicate key errors
            default: null // Set default value to null
        },
        updatedAt: {
            type: Date,
            index: { sparse: true }, // Allow multiple null values, avoid duplicate key errors
            default: null // Set default value to null
        }
    }
);

export const Paper =  mongoose.model("questionPapers", questionPaperSchema);