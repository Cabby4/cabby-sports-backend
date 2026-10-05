require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: "admin@cabbysports.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123456", 12);

    await User.create({
      name: "Cabby Sports Admin",
      email: "admin@cabbysports.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully.");
    console.log("Email: admin@cabbysports.com");
    console.log("Password: Admin@123456");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();