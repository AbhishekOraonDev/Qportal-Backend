import express, { Router } from "express"
import {saveQuestionPaper} from "../controllers/QuestionPaperController.js";
import {getQuestionPaper} from "../controllers/QuestionPaperController.js";
import multer from 'multer';
const routes = express.Router();
// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update route to use multer middleware
routes.post('/addQuestionPaper', upload.single('file'), saveQuestionPaper);
routes.post('/questionPaperData', getQuestionPaper);

export default routes;