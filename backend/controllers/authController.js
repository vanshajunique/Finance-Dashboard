const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return res.status(201).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  return res.json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

const getCurrentUser = async (req, res) => {
  return res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
