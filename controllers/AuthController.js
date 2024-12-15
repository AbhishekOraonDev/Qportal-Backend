
import BlackList from '../Models/BlackList.js';
import { User } from '../Models/Users.js';
import { catchAsyncError } from '../middleware/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';


const logUser = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return next(new ErrorHandler("All fields are not provided", 400));

        // checking for existing token if any
        const existingToken = req.cookies.access_token;
        if(existingToken){
            try{
                Jwt.verify(existingToken, process.env.TOKEN_SING);
                return next(new ErrorHandler("User already logged in, Please logout first.", 403));
            }catch(err){
                console.log("Existing token invalid, allowing login.");
            }
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return next(new ErrorHandler("Wrong email or password", 401)); 

        // check the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return next(new ErrorHandler("Wrong email or password", 401));

        const name = user.firstName + " " + user.lastName;
        // Passwords match, generate JWT token
        const token = Jwt.sign(
            { // payload
                userId: user._id,
                userEmail: user.email,
                userRole: user.role,
                userName: name,
            }, 
            process.env.TOKEN_SING, // signature
            { expiresIn: "24h" }
        );

        const userData = {
            userEmail: user.email,
            userRole: user.role,
            userId: user._id.toString(),
            userName: name,
            token: token,
        }

        // Send response with token
        res.cookie("access_token", token, {
            // httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // Cookie expiry (24 hours)
        })
        .status(200).json({
            status: "success",
            data: userData,
            message: "Login Successful",
        });
    } catch (error) {
        console.error("Error Login user:", error);
        next(new ErrorHandler(error.message || "Internal server error", 500));
    }
});


// Controller to Logout user
const logoutUser = catchAsyncError(async(req, res, next) => {
    try{
        const token = req.cookies.access_token;
        if(!token) return next(new ErrorHandler("Something went wrong, missing parameters", 403));

        // blacklist the token
        const newBlackList = new BlackList({
            token: token,
        });
        
        await newBlackList.save();


        res.clearCookie('access_token', {
            httpOnly: true, // Match the attributes from when the cookie was set
            secure: process.env.NODE_ENV === 'production', // Ensure secure in production
            sameSite: 'strict',
        });

        // res.setHeader('Clear-site-Data', '"cookies"');
        res.status(200).json({
            status: "success",
            message: "You are successfully logged out",
        });

    }catch(err){
        console.log("Error: ", err);
        next(new ErrorHandler(err.message||"Internal server error", 500));
    }
    res.end();
})

export {logUser, logoutUser};