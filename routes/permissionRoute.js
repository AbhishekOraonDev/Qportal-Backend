import express from "express"
import { getPermissions, savePermission } from "../controllers/PermissionController.js"

const routes = express.Router();

routes.post('/savepermission', savePermission);
routes.post('/getpermission', getPermissions);

export default routes;