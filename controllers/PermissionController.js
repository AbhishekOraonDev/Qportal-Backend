import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Permissions } from "../Models/Permission.js";
import ErrorHandler from "../utils/errorHandler.js";



const savePermission = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, permissionId, permissionName, isParent, parentId, isActive } = req.body;

        // required field validation
        if (!permissionId || !permissionName) {
            return next(new ErrorHandler("Please enter all the erquired  fields", 400));
        };

        // create permission object
        let permissionData = {
            permissionId,
            permissionName,
            isParent: isParent || false,
            parentId: isParent ? null : parentId,
            isActive,
        };

        // for new entry
        if (!_id || _id === null || _id == "undefined") {
            // checking for existing permission
            const permissionExists = await Permissions.findOne({
                $or: [{ permissionId }, { permissionName }],
            });
            if (permissionExists) {
                return next(new ErrorHandler("Permission already exists", 409));
            }

            permissionData.createdAt = new Date();

            const newPermission = await Permissions.create(permissionData);
            // await newPermission.save();

            return res.status(200).json({
                status: "success",
                message: "Permission successfuly added !",
                data: [newPermission],
            });
        }
        // for updating the old entry
        const permission = await Permissions.findById(_id);
        if (!permission) {
            return next(new ErrorHandler("Permission not found", 409));
        };

        permissionData.updatedAt = new Date();

        Object.assign(permission, permissionData);
        await permission.save();

        return res.status(200).json({
            status: "success",
            message: "Permission updated successfuly",
            data: [permission]
        });

    } catch (err) {
        console.error("Internal server error: ", err);
        next(new ErrorHandler(err.message || "Internal server error", 500));
    }
})

// fetch permissions
const getPermissions = catchAsyncError(async(req, res, next) => {
    try{
        const {_id, permissionId, permissionName, limit, page} = req.body;

        let query = {
            ...(_id ? {_id}:{}),
            ...(permissionId ? {permissionId}:{}),
            ...(permissionName ? {permissionName}:{}),
            ...(limit ? {limit}:{}),
            ...(page ? {page}:{})
        }

        // total permission count
        const totalPermissionCount = await Permissions.countDocuments(query);

        // permission data
        const permissionData = await Permissions.find(query).limit(Number(limit)).skip(Number(limit)*(Number(page)-1));

        // check for empty permission / no permission found
        if(permissionData.length === 0) return next(new ErrorHandler("No permission found", 404));

        // total pages
        const totalPages = Math.ceil(totalPermissionCount/Number(limit));

        res.status(200).json({
            status: "success",
            data: permissionData,
            pagination: {
                totalPermission: totalPermissionCount,
                currentPage: Number(page),
                pageSize: Number(limit)>totalPermissionCount ? totalPermissionCount : Number(limit),
                totalPages: totalPages,
            },
            message: "Permissions fetched successfuly",
        });
    }catch(err){
        console.error("Internal Server Error: ", err);
        next(new ErrorHandler(err.message || "Internal Server Error", 500));
    }
});



export {savePermission, getPermissions};