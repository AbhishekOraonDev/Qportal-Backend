import dotenv from 'dotenv';
dotenv.config();
import { Paper } from "../Models/QuestionPaper.js";
import uploadS3 from "../config/S3_Storage.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";


// Question Paper save controller 
const saveQuestionPaper = catchAsyncError(async (req, res, next) => {
    try {
        // Object destructuring
        const { course, department, semester, year, examType, paperCode, paperName, id } = req.body;

        if (!course || !department || !semester || !year || !examType || !paperCode || !paperName) {
            return next(new ErrorHandler("Please enter all the required fields", 400));
        };

        //For new entry 
        if (!id || id === null || id == "undefined") {
            if (!req.file) {
                return next(new ErrorHandler("Please upload a file", 400));
            }

            const uploadResult = await uploadS3(req.file.buffer, req.file.originalname, "QuestionPaper");

            const qPaperData = {
                course,
                department,
                semester,
                year,
                examType,
                paperCode,
                paperName,
                questionPaper: uploadResult,
                createdAt: new Date(),
            };

            let paperQ = await Paper.findOne({ paperCode });
            if (paperQ) {
                return next(new ErrorHandler("Question paper already exists", 409));
            }


            const newQuestionPaper = await Paper.create(qPaperData);

            await newQuestionPaper.save();

            res.status(200).json({
                status: "success",
                message: "Question Paper successfully added",
                data: [newQuestionPaper],
            });
        }else{   // For updating the old entry

            let paperQ = await Paper.findById(id);
            if (!paperQ) {
                return next(new ErrorHandler("Question Paper not found", 409));
            }

            let uploadResult = null;

            if (req.file) {
                uploadResult = await uploadS3(req.file.buffer, req.file.originalname);
            }

            const qPaperData = {
                course,
                department,
                semester,
                year,
                examType,
                paperCode,
                paperName,
                ...(uploadResult && {questionPaper: uploadResult}),
                updatedAt: new Date(),
            };

            Object.assign(paperQ, qPaperData);
            await paperQ.save();

            res.status(200).json({
                status: "success",
                message: "Question Paper successfully updated",
                data: [paperQ],
            });
        }
    } catch (error) {
        console.log("Error saving queation paper: ", error);
        next(new ErrorHandler(error.message||"Error saving queation paper", 500));
    }
});

// Viwe question paper data
const getQuestionPaper = catchAsyncError(async(req, res, next) => {
    try{
        const {_id, course, department, semester, year, examType, paperCode, paperName, limit, page} = req.body;
        // const query = _id ? {_id}: {};
        let query = {
            ...(course ? {course}: {}),
            ...(department ? {department}: {}),
            ...(semester ? {semester}: {}),
            ...(year ? {year}: {}),
            ...(examType ? {examType}: {}),
            ...(paperCode ? {paperCode}: {}),
            ...(paperName ? {paperName}: {}),
            ...(_id ? {_id}: {})
        }

        // Total paper count
        const totalPaperDataCount = await Paper.countDocuments(query);
        // console.log(totalPaperDataCount);

        // const paperData = await Paper.find(query).sort({'date': -1}).limit(Number(limit)).skip(Number(limit)*Number(page)-1);
        const paperData = await Paper.find(query).limit(Number(limit)).skip(Number(limit)*(Number(page)-1));
        // .sort({'date': -1}).limit(Number(limit)).skip(Number(limit)*Number(page)-1);
        
        if(paperData.length === 0) return next(new ErrorHandler("No papers found", 404));

        // Total pages
        const totalPages = Math.ceil(totalPaperDataCount/Number(limit));
        

        res.status(200).json({
            status: "success",
            data: paperData,
            pagination: {
                totalPapers: totalPaperDataCount,
                currentPage: Number(page),
                pageSize: totalPaperDataCount<Number(limit) ? totalPaperDataCount : Number(limit),
                totalPages: totalPages,
            },
            message: "Question paper successfully fetched.",
        });
    }catch(err){
        console.error("Error fetching data: ", err);
        next(new ErrorHandler(err.message||"Internal server error", 500));
    }
})


export {saveQuestionPaper, getQuestionPaper};