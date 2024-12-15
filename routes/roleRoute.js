import express from "express";
import { getRole, saveRole } from "../controllers/RoleController.js";

const routes = express.Router();

routes.post('/saverole', saveRole);
routes.post('/getrole', getRole)


export default routes;