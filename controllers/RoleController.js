import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Roles } from "../Models/Roles.js";
import ErrorHandler from "../utils/errorHandler.js";

// save and create role
const saveRole = catchAsyncError(async (req, res, next) => {
    try {
        const { _id, roleId, roleName, permissionIds, isActive } = req.body;

        if (!roleId || !roleName || !permissionIds) {
            return next(new ErrorHandler("Please provide all the required fields", 400));
        }

        // create role object
        let roleData = {
            roleId,
            roleName,
            permissionIds,
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

        // query object for filteration
        const query = {
            ...(_id ? { _id } : {}),
            ...(roleId ? { roleId } : {}),
            ...(roleName ? { roleName } : {})
        };

        // total role count
        const totalRoleCount = await Roles.countDocuments(query);

        // role data
        // const roleData = await Roles.find(query)

        const roles = await Roles.aggregate([
            {
                $lookup:                                  // joining Roles and permission to get permission data
                {
                    from: 'permissions',
                    localField: 'permissionIds',
                    foreignField: 'permissionId',
                    as: 'permissionIds'
                }

            }
        ]).limit(Number(limit)).skip(Number(limit)*(Number(page) - 1));

        const roleData = roles.map(role => ({
            ...role,
            permissionIds: role.permissionIds.map(permission => ({
                permissionId: permission.permissionId,
                permissionName: permission.permissionName,
                isParent: permission.isParent,
                parentId: permission.parentId,
                isActive: permission.isActive
            }))
        }))

        // checking for empty record
        if (roleData.length === 0) return next(new ErrorHandler("No role found", 404));

        // total pages
        const totalPages = Math.ceil(totalRoleCount / Number(limit));

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


export { saveRole, getRole };