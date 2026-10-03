const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");


// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send OTP
const sendRegistrationOTP = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete previous OTP for this email
    await RegistrationOTP.deleteMany({
      email: email.toLowerCase(),
    });

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP data
    await RegistrationOTP.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      otp,
      expiresAt,
    });

    // Send email
    await transporter.sendMail({
      from: `"Your Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Registration OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Registration Verification</h2>

          <p>Hello ${fullName},</p>

          <p>Your OTP for registration is:</p>

          <h1 style="letter-spacing: 8px; color: #2563eb;">
            ${otp}
          </h1>

          <p>This OTP will expire in <b>10 minutes</b>.</p>

          <p>If you did not request this OTP, please ignore this email.</p>

          <p>Thank you.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const registrationData = await RegistrationOTP.findOne({
      email: email.toLowerCase(),
    });

    if (!registrationData) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    // Check OTP expiry
    if (registrationData.expiresAt < new Date()) {
      await RegistrationOTP.deleteOne({
        _id: registrationData._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Check OTP
    if (registrationData.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark OTP as verified
    registrationData.isVerified = true;
    await registrationData.save();

    return res.status(200).json({
      success: true,
      verified: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

const completeRegistration = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const registrationData = await RegistrationOTP.findOne({
      email: email.toLowerCase(),
      isVerified: true,
    });

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    // Double-check that email is not already registered
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      await RegistrationOTP.deleteOne({
        _id: registrationData._id,
      });

      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Create user
    const user = await User.create({
      fullName: registrationData.fullName,
      email: registrationData.email,
      phone: registrationData.phone,
      password: registrationData.password,
      isEmailVerified: true,
    });

    // Delete temporary registration data
    await RegistrationOTP.deleteOne({
      _id: registrationData._id,
    });

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Complete Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ================= USER LOGIN =================

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT token
    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      role: "user",
      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("User Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  completeRegistration,
  userLogin,
};



