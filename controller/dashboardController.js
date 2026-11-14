const userModel = require("../model/userModel");

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

const getAllUserController = async (req, res) => {
  try {
    const loggedinUserId = req.user.id
    const loggedinUser = await userModel.findById(loggedinUserId)
    const searchQuery = req.query.search ? req.query.search.trim() : '';
    const roleQuery = req.query.role ? req.query.role.trim() : '';
    const limit = 4
    const page = req.query.page === undefined ? 1 : Number(req.query.page)
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      })
    }
    const filter = {
      _id: {
        $ne: loggedinUserId
      }
    }
    if (roleQuery) {
      filter.role = roleQuery;
    }
    if (searchQuery) {
      const searchRegex = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.$or = [{
          username: {
            $regex: searchRegex,
            $options: 'i'
          }
        },
        {
          email: {
            $regex: searchRegex,
            $options: 'i'
          }
        }
      ];
    }
    const [users, totalUsers] = await Promise.all([
      userModel.find(filter).skip((page - 1) * limit).limit(limit),
      userModel.countDocuments(filter),
    ])

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users: users.map(formatUser),
        length: users.length,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
      loggedinuser: loggedinUser
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const getSingleUserController = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User get successfully",
      data: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "user not found",
      id: userId
    });
  }
};

const approveUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const newStatus = !existingUser.status;
    const user = await userModel.findByIdAndUpdate(
      userId, {
        status: newStatus
      }, {
        returnDocument: 'after',
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: `User status updated successfully`,
      data: user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await userModel.findByIdAndDelete(userId);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

}

module.exports = {
  getAllUserController,
  getSingleUserController,
  approveUserController,
  deleteUserController
}