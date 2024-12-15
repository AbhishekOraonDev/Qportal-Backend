import { Notes } from "../Models/Notes.js";
import uploadS3 from "../config/S3_Storage.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

// fetching notes
const getNotes = catchAsyncError(async (req, res, next) => {
    try{
        const {_id, subject, year, semester, department, course, limit, page} = req.body;
        let query = {
            ...(subject ? { subject: { $regex: subject, $options: 'i' } } : {}),  // Subject is implemented with LIKE operation
            ...(year ? {year}:{}),
            ...(semester ? {semester}:{}),
            ...(department ? {department}:{}),
            ...(course ? {course}:{}),
            ...(_id ? {_id}:{})
        };

        // total notes count for pagination
        const totalNotes = await Notes.countDocuments(query);

        // get the Notes data
        const notesData = await Notes.find(query).limit(Number(limit)).skip(Number(limit)*(Number(page)-1));
        // console.log("Notes List: ", notesData);
        // if(notesData.length === 0) return next(new ErrorHandler("No notes found", 404));

        const totalNotesPages = Math.ceil(totalNotes/Number(limit));

        res.status(200).json({
            status: "success",
            data: notesData,
            pagination: {
                totalNotes: totalNotes,
                currentPage: Number(page),
                pageSize: Number(limit),
                totalNotesPages: totalNotesPages,
            },
            message: "Notes fetched successfully",
        });
    }catch(error){
        console.error("Error Fetching error: ", error);
        next(new ErrorHandler(error.message||"Internal server error", 500));
    }
});

// Saving notes
const saveNotes = catchAsyncError( async (req, res, next) =>{
    try{
        const {subject, year, semester, department, course, byName, id} = req.body;

        if(!subject || !year || !semester || !department || !course ){
            return next(new ErrorHandler("Please enter all the required fields.", 400));
        };

        // For new entry
        if(!id || id === null || id == "undefined") {

            if(!req.file) {
                return next( new ErrorHandler("Please enter notes file.", 400));
            }

            const uploadNotes = await uploadS3(req.file.buffer, req.file.originalname, "Notes");
            console.log(uploadNotes);
            const qNotes = {
                subject,
                year,
                semester,
                department,
                course,
                byName,
                noteFile: uploadNotes,
                createdAt: new Date(),
            };

            let NotesQ = await Notes.findOne({subject, year, semester, department, course});
            if(NotesQ){
                return next( new ErrorHandler("This note alredy exists.", 409));
            };

            const newNotesQ = await Notes.create(qNotes);
            const saveNewnotes = await newNotesQ.save();
            if(!saveNewnotes) return next(new ErrorHandler("Something went wrong", 501));

            res.status(200).json({
                status: "success",
                data: [newNotesQ],
                message: "Question paper successfully added",
            });

        }else{ //for updating the old notes entry

            let notesQ = await Notes.findById(id);
            if(!notesQ){
                return next( new ErrorHandler("Notes not found.", 409));
            };

            let uploadNotes = null;

            if(req.file){
                uploadNotes = await uploadS3(req.file.buffer, req.file.originalname, "Notes");
                if(!uploadNotes) return next(new ErrorHandler("Something went wrong", 401));
            }

            const updatedNotesData = {
                subject,
                year,
                semester,
                department,
                course,
                byName,
                ...(uploadNotes && {noteFile: uploadNotes}),
                updatedAt: new Date(),
            }

            Object.assign(notesQ, updatedNotesData);
            const saveNotes = await notesQ.save();
            if(!saveNotes) return next(new ErrorHandler("Something went wrong", 401));
            res.status(200).json({
                status: "success",
                data: [notesQ],
                message: "Notes updated successfully",
            });
        }

    }catch(error){
        console.error("Error saving notes: ", error);
        next(new ErrorHandler(error.message||"Internal server error", 500));
    }
})


export { getNotes, saveNotes };