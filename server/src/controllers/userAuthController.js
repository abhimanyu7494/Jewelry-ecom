const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 2525,
  secure: false, // Port 2525 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Production-friendly timeouts
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,

  tls: {
    minVersion: "TLSv1.2",
  },
});


const verifySMTPConnection = async () => {
  try {
    await transporter.verify();
    console.log("BREVO SMTP CONNECTION SUCCESSFUL");

  } catch (error) {
    console.error("BREVO SMTP CONNECTION FAILED");
  }
};

// Call once when server starts
if (process.env.NODE_ENV !== "test") {
  verifySMTPConnection();
}


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sendRegistrationOTP = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }


    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

  
    const otp = generateOTP();

  
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const hashedOTP = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    console.log("SENDING REGISTRATION OTP");


    await RegistrationOTP.deleteMany({
      email: normalizedEmail,
    });

 
    await RegistrationOTP.create({
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      otpHash: hashedOTP,
      expiresAt,
      isVerified: false,
    });

    const safeName = escapeHtml(normalizedName);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Registration OTP</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            font-family: Arial, Helvetica, sans-serif;
          "
        >

          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            "
          >

            <div
              style="
                padding: 24px;
                background: #2563eb;
                color: #ffffff;
                text-align: center;
              "
            >
              <h1 style="margin: 0; font-size: 24px;">
                Email Verification
              </h1>
            </div>

            <div style="padding: 32px; color: #333333;">

              <p>
                Hello <strong>${safeName}</strong>,
              </p>

              <p>
                Thank you for registering with us.
                Please use the OTP below to verify your email address.
              </p>

              <div
                style="
                  margin: 30px 0;
                  padding: 22px;
                  background: #f3f4f6;
                  border-radius: 10px;
                  text-align: center;
                "
              >

                <div
                  style="
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 10px;
                  "
                >
                  YOUR VERIFICATION CODE
                </div>

                <div
                  style="
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #2563eb;
                  "
                >
                  ${otp}
                </div>

              </div>

              <p>
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p style="color: #6b7280; font-size: 14px;">
                If you did not request this registration,
                you can safely ignore this email.
              </p>

              <p>
                Thank you.
              </p>

            </div>

            <div
              style="
                padding: 18px;
                background: #f9fafb;
                text-align: center;
                color: #9ca3af;
                font-size: 12px;
              "
            >
              This is an automated email. Please do not reply.
            </div>

          </div>

        </body>
      </html>
    `;

    const mailInfo = await transporter.sendMail({
      from: {
        name: process.env.SENDER_NAME || "Your App",
        address: process.env.SENDER_EMAIL,
      },

      to: normalizedEmail,

      subject: "Your Registration OTP",

      text: `
Hello ${normalizedName},

Your registration OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request this registration, please ignore this email.
      `.trim(),

      html: emailHtml,

      headers: {
        "X-Auto-Response-Suppress": "All",
      },
    });
    console.log("OTP EMAIL SENT SUCCESSFULLY");


    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("SEND OTP ERROR");

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


const verifyRegistrationOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedOTP = otp
      .toString()
      .trim();

    // OTP must be 6 digits
    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    const registrationData =
      await RegistrationOTP.findOne({
        email: normalizedEmail,
      });

    if (!registrationData) {
      return res.status(404).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP",
      });
    }

    if (
      registrationData.expiresAt < new Date()
    ) {
      await RegistrationOTP.deleteOne({
        _id: registrationData._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP",
      });
    }

    if (registrationData.isVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP has already been verified",
      });
    }


    const isOTPValid = await bcrypt.compare(
      normalizedOTP,
      registrationData.otpHash
    );

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

  
    registrationData.isVerified = true;

    await registrationData.save();

    console.log("Registration OTP verified:", normalizedEmail);

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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const registrationData =
      await RegistrationOTP.findOne({
        email: normalizedEmail,
        isVerified: true,
      });

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

  
    if (
      registrationData.expiresAt < new Date()
    ) {
      await RegistrationOTP.deleteOne({
        _id: registrationData._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "Verification session expired. Please register again",
      });
    }

 
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

    const user = await User.create({
      fullName: registrationData.fullName,
      email: registrationData.email,
      phone: registrationData.phone,
      password: registrationData.password,
      isEmailVerified: true,
    });

  
    await RegistrationOTP.deleteOne({
      _id: registrationData._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration completed successfully",

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error(
      "Complete Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before login",
      });
    }

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

 
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
        isEmailVerified:
          user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error(
      "User Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    console.error("Get Total Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch total users",
    });
  }
};


module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  completeRegistration,
  userLogin,
  getTotalUsers,
};

