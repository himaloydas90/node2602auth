const userModel = require("../model/userModel");

function formatUser(user){
  return{
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
    const users = await userModel.find({
      _id: {$ne: loggedinUserId}
    })
    res.status(200).json({
        success: true,
        message: "Users get successfully",
        data: {
          users: users.map(formatUser),
          length: users.length
        },
        loggedinuser: loggedinUser
    })
  } catch (error) {
      res.send("catch error")
    
  }
};


module.exports = {
    getAllUserController
}