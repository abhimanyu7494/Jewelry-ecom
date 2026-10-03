const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");

// ================= OTP GENERATOR =================

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SMTP TRANSPORTER =================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ================= SMTP CONNECTION CHECK =================

transporter.verify((error, success) => {
  if (error) {
    console.error("========== SMTP VERIFY ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Response Code:", error.responseCode);
    console.error("=======================================");
  } else {
    console.log("SMTP SERVER READY:", success);
  }
});

// ================= SEND REGISTRATION OTP =================

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
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

    // OTP expiry - 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ================= SEND EMAIL FIRST =================

    console.log("Attempting to send OTP email...");
    console.log("SMTP User:", process.env.SMTP_USER);
    console.log("Receiver:", normalizedEmail);

    const mailInfo = await transporter.sendMail({
      from: `"Your Store" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Your Registration OTP",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: auto;
          "
        >
          <h2>Registration Verification</h2>

          <p>Hello ${fullName},</p>

          <p>Your OTP for registration is:</p>

          <h1
            style="
              letter-spacing: 8px;
              color: #2563eb;
              font-size: 36px;
            "
          >
            ${otp}
          </h1>

          <p>
            This OTP will expire in <b>10 minutes</b>.
          </p>

          <p>
            If you did not request this email, please ignore it.
          </p>

          <p>Thank you.</p>
        </div>
      `,
    });

    console.log("========== EMAIL SENT SUCCESSFULLY ==========");
    console.log("Message ID:", mailInfo.messageId);
    console.log("Accepted:", mailInfo.accepted);
    console.log("Rejected:", mailInfo.rejected);
    console.log("Response:", mailInfo.response);
    console.log("=============================================");

    // ================= SAVE OTP ONLY AFTER EMAIL SUCCESS =================

    // Delete previous OTP
    await RegistrationOTP.deleteMany({
      email: normalizedEmail,
    });

    // Save new OTP
    await RegistrationOTP.create({
      fullName,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      otp,
      expiresAt,
      isVerified: false,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("========== SEND OTP ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Response Code:", error.responseCode);
    console.error("Stack:", error.stack);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// ================= VERIFY REGISTRATION OTP =================

const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const registrationData = await RegistrationOTP.findOne({
      email: normalizedEmail,
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

// ================= COMPLETE REGISTRATION =================

const completeRegistration = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const registrationData = await RegistrationOTP.findOne({
      email: normalizedEmail,
      isVerified: true,
    });

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    // Double-check email
    const existingUser = await User.findOne({
      email: normalizedEmail,
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

// ================= EXPORT =================

module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  completeRegistration,
  userLogin,
};
