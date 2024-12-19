import express from "express"
import { getModules, createModules } from "../controllers/ModuleController.js"


const routes = express.Router();

routes.post('/createModules', createModules);
routes.post('/getModules', getModules);

export default routes;