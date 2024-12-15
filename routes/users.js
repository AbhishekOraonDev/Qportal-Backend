//const express = require("express");
import express from "express";
import {EditUser, saveUser} from "../controllers/UserController.js";
import { getUser } from "../controllers/UserController.js";
import { logoutUser, logUser } from "../controllers/AuthController.js";
// import { Profile } from "../controllers/profile.js";
import { authorization } from "../middleware/auth.js";
import { checkBlackList } from "../middleware/checkBlacklist.js";
const router = express.Router();

router.post("/CreateUser", saveUser);  // For Signup
router.post("/getUser", logUser);  // for Login
router.post("/profile",checkBlackList, authorization, getUser); // For Profile Details
router.get("/logout", checkBlackList, logoutUser); // For Logout
router.put("/editUser", authorization, EditUser);

export default router;
