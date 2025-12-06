import User from "../models/User.js";
import jwt from "jsonwebtoken";

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
}

function sendTokenCookie(res, token) {
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}

export const signUp = async (req, res) => {
  try {
    const { userName, password, role } = req.body;

    if (!userName || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "UserName, Password and Role is required.",
      });
    }

    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "UserName already exists." });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 6 characters.",
      });
    }

    if (role !== "Super Admin" && role !== "Admin" && role !== "Operator") {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    const newUser = await User.create({
      userName,
      password,
      role,
    });

    const token = generateToken(newUser._id);
    sendTokenCookie(res, token);

    const user = newUser.toObject();
    delete user.password;

    res.status(201).json({
      success: true,
      message: "User signUp successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error in signUp controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "UserName and Password is required.",
      });
    }

    const existingUser = await User.findOne({ userName });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "UserName NOT found." });
    }

    if (!(await existingUser.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = generateToken(existingUser._id);
    sendTokenCookie(res, token);

    const user = existingUser.toObject();
    delete user.password;

    res.status(201).json({
      success: true,
      message: "User login successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "User logout successfully.",
    });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User fetched.",
      data: user,
    });
  } catch (error) {
    console.error("Error in getMe controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users fetched.",
      data: users,
    });
  } catch (error) {
    console.error("Error in getUsers controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
