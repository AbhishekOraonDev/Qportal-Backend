// For checking if the user is in BlackList or not. 
// (BlackList = the expiered jwt token is stored into BlackList db)

import BlackList from "../Models/BlackList.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const checkBlackList = catchAsyncError(async(req, res, next) => {
    try{
        const token = req.cookies.access_token;
        if(!token) return next(new ErrorHandler("Your are logged out, please login to continue", 401));
    
        const checkBackList = await BlackList.findOne({ token: token});
        if(checkBackList) return next(new ErrorHandler("Your are logged out, please login to continue", 401));
        next();
    }catch(err){
        console.log("Error: ", err);
        next(new ErrorHandler(err.message||"internal server error", 500));
    }
})