import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Modules } from "../Models/Modules.js";
import ErrorHandler from "../utils/errorHandler.js";


const createModules = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, moduleId, moduleName, isActive } = req.body;

        if (!moduleId || !moduleName) {
            return next(new ErrorHandler("Please provide all the required fields", 400));
        }

        // create role object
        const  moduleData = {
            moduleId,
            moduleName,
            isActive,
        };

        // for new entry
        if (!_id || _id === null || _id == "undefined") {
            // checking for existing role
            const moduleExists = await Modules.findOne({
                $or: [{ moduleId }, { moduleName }],
            });

            if (moduleExists) {
                return next(new ErrorHandler("Module already exists", 409));
            }

            moduleData.createdAt = new Date();

            const newModuleData = await Modules.create(moduleData);

            return res.status(200).json({
                status: "success",
                data: [newModuleData],
                message: "Module created successfuly",
            });
        }

        // for updating 
        const module = await Modules.findById(_id);
        if (!module) {
            return next(new ErrorHandler("Module not found", 409));
        }

        moduleData.updatedAt = new Date();

        Object.assign(module, moduleData);
        await Modules.save();

        return res.status(200).json({
            status: "success",
            data: [module],
            message: "Module updated successfuly",
        });

    } catch (err) {
        console.error("Internal server error: ", err);
        next(new ErrorHandler(err.message || "Internal server error", 500));
    }
});


const getModules = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, moduleId, moduleName, active, limit, page } = req.body;

        const query = {
            ...(_id ? { _id } : {}),
            ...(moduleId ? { moduleId } : {}),
            ...(moduleName ? { moduleName } : {}),
            ...(active ? { active } : {}),
        };

        const totalModules = await Modules.countDocuments(query);

        const moduleData = await Modules.find(query).limit(Number(limit)).skip(Number(limit) * (Number(page) - 1));

        if (!moduleData && moduleData.length === 0) return next(new ErrorHandler("Modules not found", 404));

        const totalPages = Math.ceil(totalModules / Number(limit));

        res.status(200).json({
            status: "success",
            data: moduleData,
            pagination: {
                totalRole: totalModules,
                currentPage: Number(page),
                pageSize: totalModules < Number(limit) ? totalModules : Number(limit),
                totalPages: totalPages,
            },
            message: "Modules fetched successfuly"
        });

    } catch (err) {
        console.error("Internal server error: ", err);
        next(new ErrorHandler(err.message || "Internal server error", 500));
    }
})

export  {getModules, createModules};