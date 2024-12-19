import express from "express";
import { getRole, saveRole, userRoleMapping } from "../controllers/RoleController.js";

const routes = express.Router();

routes.post('/saverole', saveRole);
routes.post('/getrole', getRole);
routes.post('/userRoleMapping', userRoleMapping);


export default routes;