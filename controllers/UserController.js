//const Users = require('../Models/Users');
import { User } from '../Models/Users.js';
import { catchAsyncError } from '../middleware/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';


const saveUser = catchAsyncError(async (req, res, next) => {
    try{
        // object desturcting
        const {firstName, lastName, email, phoneNumber, gender, role, rollNumber, facultyCode, password, createdAt} = req.body;

        // Null Exception
        if(!firstName || !lastName || !email || !password || !phoneNumber || !role || !gender) 
            return next(new ErrorHandler("Please enter all required field", 400));

        //Check if User Already exists or not
        let userE = await User.findOne({email});
        if(userE)
            return next(new ErrorHandler("User Already exist", 403));
        
        //Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a newUser Object
        const userData = {
            userId: new mongoose.Types.ObjectId(),
            firstName,
            lastName,
            email, 
            phoneNumber, 
            gender,
            role,
            password: hashedPassword, 
            createdAt: createdAt || new Date(),
        };

        if(rollNumber){
            userData.rollNumber = rollNumber;
        }

        if(facultyCode){
            userData.facultyCode = facultyCode;
        }
        
        // console.log(userData);
        const newUser = await User.create(userData);
        let user = new User(newUser);

        await user.save();

        res.status(200).json({
            status: "success",
            data: [userData],
            message: "Thank You for Registering, your account has been created successfully."
        });
    } catch(error){
        console.error("Error saving user:", error);
        next(new ErrorHandler(error.message || "Internal server error", 500));
    }
});

const EditUser = catchAsyncError(async (req, res, next) => {
    try {
        // const userId = req.params.userId; // Correctly access userId from req.params
        const _id = req.userId;
        // object destructuring
        const { firstName, lastName, email, phoneNumber, gender, role, rollNumber, facultyCode, password } = req.body;

        // Check if User Already exists or not
        let user = await User.findOne({_id: _id}); // Find user by ID
        if (!user) return next(new ErrorHandler("User not found", 404));

        const updates = {firstName, lastName, email, phoneNumber, gender, role, rollNumber, facultyCode, password};

        Object.entries(updates).forEach(([key, value]) => {
            if(value) user[key]=value;
        })

        await user.save();

        res.status(200).json({
            status: "success",
            data: [user],
            message: "User profile updated successfully."
        });
    } catch (error) {
        // console.error("Error editing user:", error);
        next(new ErrorHandler(error.message || "Internal server error", 500));
    }
});


// Controller for get users
const getUser = catchAsyncError(async(req, res, next) => {
    try{
        const {_id, firstName, lastName, email, phone, limit, page} = req.body;

        const query = {
            ...(_id ? {_id}:{}),
            ...(firstName ? {firstName}:{}),
            ...(lastName ? {lastName}:{}),
            ...(email ? {email}:{}),
            ...(phone ? {phone}:{})
        };

        // Total user count
        const totalUserCount = await User.countDocuments(query);

        // User data
        const userData = await User.find(query).limit(Number(limit)).skip(Number(limit)*(Number(page)-1));

        if(userData.length === 0) return next(new ErrorHandler("No user found", 404));

        // Total page
        const totalPages = Math.ceil(totalUserCount/Number(limit));

        res.status(200).json({
            status: "success",
            data: userData,
            pagination: {
                totalUsers: totalUserCount,
                currentPage: Number(page),
                pageSize: (Number(limit)>totalUserCount ? totalUserCount : Number(limit)),
                totalPages: totalPages,
            },
            message: "User fetched successfully",
        });

    }catch(err){
        console.log("Error: Something went wrong, error - ", err);
        next(new ErrorHandler(err.message||"Internal server error", 500))
    }
})

export { saveUser, EditUser, getUser };

