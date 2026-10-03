const bcrypt = require("bcryptjs");
const { Resend } = require("resend");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");

// ================= RESEND EMAIL =================

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= GENERATE OTP =================

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("======================================");
    console.log("Sending registration OTP...");
    console.log("From:", process.env.EMAIL_FROM);
    console.log("To:", normalizedEmail);
    console.log("======================================");

    // ================= SEND EMAIL =================

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [normalizedEmail],
      subject: "Your Registration OTP",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            padding: 30px;
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            color: #333333;
          "
        >

          <h2 style="color: #111827;">
            Registration Verification
          </h2>

          <p>
            Hello <strong>${fullName}</strong>,
          </p>

          <p>
            Thank you for registering with us.
          </p>

          <p>
            Your OTP for registration is:
          </p>

          <div
            style="
              margin: 25px 0;
              padding: 20px;
              background-color: #f3f4f6;
              text-align: center;
              border-radius: 8px;
            "
          >
            <h1
              style="
                margin: 0;
                letter-spacing: 10px;
                color: #2563eb;
                font-size: 36px;
              "
            >
              ${otp}
            </h1>
          </div>

          <p>
            This OTP will expire in
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request this registration,
            please ignore this email.
          </p>

          <p>
            Thank you.
          </p>

        </div>
      `,
    });

    // ================= EMAIL ERROR =================

    if (error) {
      console.error("======================================");
      console.error("RESEND EMAIL ERROR");
      console.error(error);
      console.error("======================================");

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    console.log("======================================");
    console.log("OTP EMAIL SENT SUCCESSFULLY");
    console.log("Email ID:", data?.id);
    console.log("======================================");

    // ================= DELETE OLD OTP =================

    await RegistrationOTP.deleteMany({
      email: normalizedEmail,
    });

    // ================= SAVE OTP =================

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
    console.error("======================================");
    console.error("SEND OTP ERROR");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("======================================");

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

    // Find OTP
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

    // Find verified registration
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

    // Check if email already exists
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

    // Create JWT
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
