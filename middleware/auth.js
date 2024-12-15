import Jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';
import { catchAsyncError } from './catchAsyncError.js';

export const authorization = catchAsyncError(async (req, res, next) =>{
    const token = req.cookies.access_token;
    if(!token) return next(new ErrorHandler("Session expiered", 403));
        
    try{
        const data = Jwt.verify(token, process.env.TOKEN_SING);
        if(!data) return next(new ErrorHandler("Error logging", 401));
        req.userId = data.userId;
        req.userRole = data.userRole;
        return next();
    }catch(err){
        next(new ErrorHandler(err.message||"Internal server error", 500))
    }
});