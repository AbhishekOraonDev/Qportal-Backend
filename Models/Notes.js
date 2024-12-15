import mongoose, { Mongoose } from "mongoose";

const notesSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: [true, "Please provide subject name."]
        },
        year: {
            type: String,
            required: [true, "Please provide year."]
        },
        semester: {
            type: String,
            required: [true, "Please provide semester."]
        },
        department: {
            type: String,
            required: [true, "Please provide department."]
        },
        course: {
            type: String,
            required: [true, "Please provide course."]
        },
        byName: {
            type: String,
            max: 30
        },
        noteFile: {
            type: String,
            // required: [true, "Please provide notes"]
        },
        createdAt: {
            type: Date,
            index: {sparse: true},
            default: null
        },
        updatedAt: {
            type: Date,
            index: { sparse: true },
            default: null,
        }
    }
);

export const Notes = mongoose.model("notes", notesSchema);