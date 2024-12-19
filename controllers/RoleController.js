import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Roles } from "../Models/Roles.js";
import { User } from "../Models/Users.js";
import ErrorHandler from "../utils/errorHandler.js";

// save and create role
const saveRole = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, roleId, roleName, permissions, isActive } = req.body;

        if (!roleId || !roleName || !permissions) {
            return next(new ErrorHandler("Please provide all the required fields", 400));
        }

        // create role object
        let roleData = {
            roleId,
            roleName,
            permissions,
            isActive,
        };

        // for new entry
        if (!_id || _id === null || _id == "undefined") {
            // checking for existing role
            const roleExists = await Roles.findOne({
                $or: [{ roleId }, { roleName }],
            });

            if (roleExists) {
                return next(new ErrorHandler("Role already exists", 409));
            }

            roleData.createdAt = new Date();

            const newRoleData = await Roles.create(roleData);

            return res.status(200).json({
                status: "success",
                message: "Role created successfuly",
                data: [newRoleData],
            });
        }

        // for updating 
        const role = await Roles.findById(_id);
        if (!role) {
            return next(new ErrorHandler("Role not found", 409));
        }

        roleData.updatedAt = new Date();

        Object.assign(role, roleData);
        await role.save();

        return res.status(200).json({
            status: "success",
            message: "Role updated successfuly",
            data: [role]
        });

    } catch (err) {
        console.error("Internal Server Error: ", err);
        next(new ErrorHandler(err.message || "Internal server error", 500))
    }
})

// fetch created role
const getRole = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, roleId, roleName, limit, page } = req.body;


        const query = {                                                       // query object for filteration
            ...(_id ? { _id } : {}),
            ...(roleId ? { roleId } : {}),
            ...(roleName ? { roleName } : {})
        };


        const totalRoleCount = await Roles.countDocuments(query);            // total role count

        const roleData = await Roles.aggregate([
            {
                $match: query,                                              // Filter based on query
            },
            {
                $addFields: {
                    permissionsArray: {
                        $objectToArray: "$permissions",                    // Converts the permission object to array
                    },
                },
            },
            {
                $unwind: "$permissionsArray",                               // Unwind permiossion Array
            },
            {
                $lookup: {
                    from: "modules",                                        // Foreign collection
                    localField: "permissionsArray.v",                       // Array elements of module ID's
                    foreignField: "moduleId",                               // Feild in forign collection 
                    as: "permissionsArray.modules",                         // joined data feilds                         
                },
            },
            {
                $group: {
                    _id: "$_id",
                    roleId: { $first: "$roleId" },
                    roleName: { $first: "$roleName" },
                    permissions: {
                        $push: {
                            key: "$permissionsArray.k",                     // Permission Key (View, Update, etc.)
                            modules: "$permissionsArray.modules",           // Corresponding module values
                        },
                    },
                    isActive: { $first: "$isActive" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                },
            },
            {
                $project: {
                    _id: 1,
                    roleId: 1,
                    roleName: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    permissions: {
                        $arrayToObject: {
                            $map: {
                                input: "$permissions",
                                as: "perm",
                                in: {
                                    k: "$$perm.key",
                                    v: {
                                        $map: {
                                            input: "$$perm.modules",
                                            as: "module",
                                            in: {
                                                moduleId: "$$module.moduleId",
                                                moduleName: "$$module.moduleName",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }
        ]).limit(Number(limit)).skip(Number(limit)*(Number(page) - 1));


        if (roleData.length === 0) return next(new ErrorHandler("No role found", 404));                 // checking for empty record

        const totalPages = Math.ceil(totalRoleCount / Number(limit));                                   // total pages

        res.status(200).json({
            status: "success",
            data: roleData,
            pagination: {
                totalRole: totalRoleCount,
                currentPage: Number(page),
                pageSize: totalRoleCount < Number(limit) ? totalRoleCount : Number(limit),
                totalPages: totalPages,
            },
            message: "Roles fetched successfuly",
        });
    } catch (err) {
        console.error("Internal server error: ", err);
        next(new ErrorHandler(err.message || "Internal server error", 500));
    }
});


const userRoleMapping = catchAsyncError(async(req, res, next) => {
    try{
        const {_id, roleId} = req.body;

        const user = await User.findById(_id);
        if(!user) return next(new ErrorHandler("User not found", 404));

        user.updatedAt = new Date();

        Object.assign(user, {role: [roleId]});
        await user.save();

        return res.status(200).json({
            status: "success",
            data: [user],
            message: "Role mapped to user successfuly",
        });


    }catch(err){
        console.error("Internal Server Error, err: ", err);
        next(new ErrorHandler(err.message || "Internal Server Error", 500));
    }
});

export { saveRole, getRole, userRoleMapping };