import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { createToken } from "../middlewares/createToken.js";

const maxAge = 24 * 60 * 60; // 1 day in seconds

// Function to validate password complexity
const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  return password.length >= 8 && passwordRegex.test(password);
};

// Register a new user
const signup = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Fill in all the details to create an account" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username is already taken." });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email is already registered" });
      }
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = createToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log in an existing user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const auth = await bcrypt.compare(password, user.password);

      if (auth) {
        const token = createToken(user._id);

        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json(user);
      } else {
        res.status(401).json({ error: "Incorrect password" });
      }
    } else {
      res.status(401).json({ error: "No user with that email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to assign a role to a user
const assignRole = asyncHandler(async (req, res) => {
  const { adminId, userId } = req.params;
  const { role } = req.body;

  try {
    const requestingAdmin = await User.findById(adminId);

    if (!requestingAdmin || requestingAdmin.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. Only admins can assign roles." });
    }

    const validRoles = ["Admin", "Editor", "Support"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { signup, login, assignRole };
