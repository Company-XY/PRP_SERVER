import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";



//Get all users
// public route
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res
        .status(404)
        .json({ message: "There are no users in the database" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



