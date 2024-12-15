import express from "express"
import { getNotes } from "../controllers/NotesController.js"
import { saveNotes } from "../controllers/NotesController.js"
import multer from "multer"

const routes = express.Router();

//setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

// routes
routes.post('/addNotes', upload.single('file'), saveNotes);
routes.post('/getnotes', getNotes);

export default routes;