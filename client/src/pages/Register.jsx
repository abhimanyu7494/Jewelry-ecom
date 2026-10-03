import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ================= SEND OTP =================

  const handleSendOTP = async () => {
    setError("");
    setMessage("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;

    if (!fullName || !email || !phone || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (fullName.length < 3) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSendingOtp(true);

      const response = await api.post(
        "/auth/register/send-otp",
        {
          fullName,
          email,
          phone,
          password,
        }
      );

      if (response.data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp("");
        setMessage(
          `OTP has been sent to ${email}`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= VERIFY OTP =================

  const handleVerifyOTP = async () => {
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifyingOtp(true);

      const response = await api.post(
        "/auth/register/verify-otp",
        {
          email: formData.email.trim().toLowerCase(),
          otp,
        }
      );

      if (response.data.success) {
        setOtpVerified(true);
        setMessage("Email verified successfully.");
      }
    } catch (err) {
      setOtpVerified(false);

      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ================= COMPLETE REGISTRATION =================

  const handleCompleteRegistration = async () => {
    setError("");
    setMessage("");

    if (!otpVerified) {
      setError("Please verify your email first.");
      return;
    }

    try {
      setRegistering(true);

      const response = await api.post(
        "/auth/register/complete",
        {
          email: formData.email.trim().toLowerCase(),
        }
      );

      if (response.data.success) {
        setMessage(
          "Registration completed successfully. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-gradient-to-br from-[#fffdf7] via-[#f8f8f8] to-[#f3f3f3] px-4 py-10 sm:py-14">

      <div className="mx-auto w-full max-w-lg">

        {/* ================= HEADER ================= */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF8D8] via-[#D4AF37] to-[#9A761C] text-xl font-bold text-white shadow-[0_8px_25px_rgba(212,175,55,0.25)]">
            M
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join MyStore and enjoy a premium shopping experience.
          </p>

        </div>

        {/* ================= CARD ================= */}

        <div className="rounded-3xl border border-[#E8E1CC] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-8">

          {/* ================= FULL NAME ================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-[#333]">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={otpSent}
              placeholder="Enter your full name"
              autoComplete="name"
              className="w-full rounded-xl border border-[#DCDCDC] bg-white px-4 py-3 text-sm text-[#222] outline-none transition-all placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

          </div>

          {/* ================= EMAIL ================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-[#333]">
              Email Address
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent}
                placeholder="Enter your email"
                autoComplete="email"
                className="min-w-0 flex-1 rounded-xl border border-[#DCDCDC] bg-white px-4 py-3 text-sm text-[#222] outline-none transition-all placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp}
                  className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2c2c2c] disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                >
                  {sendingOtp ? "Sending..." : "Get OTP"}
                </button>
              )}

            </div>

            {otpSent && (
              <p className="mt-2 text-xs text-gray-500">
                OTP sent to your email address.
              </p>
            )}

          </div>

          {/* ================= PHONE ================= */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-[#333]">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={otpSent}
              placeholder="10-digit phone number"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              className="w-full rounded-xl border border-[#DCDCDC] bg-white px-4 py-3 text-sm text-[#222] outline-none transition-all placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

          </div>

          {/* ================= PASSWORD ================= */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-[#333]">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={otpSent}
                placeholder="Create a password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#DCDCDC] bg-white px-4 py-3 pr-12 text-sm text-[#222] outline-none transition-all placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <p className="mt-2 text-xs text-gray-400">
              Password must contain at least 6 characters.
            </p>

          </div>

          {/* ================= OTP ================= */}

          {otpSent && (
            <div className="mb-6 rounded-2xl border border-[#E9E0C7] bg-[#FFFDF6] p-4">

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-[#222]">
                    Email Verification
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit OTP sent to your email.
                  </p>
                </div>

                {otpVerified && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                    ✓
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                    setOtpVerified(false);
                    setError("");
                  }}
                  placeholder="Enter OTP"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={otpVerified}
                  className="min-w-0 flex-1 rounded-xl border border-[#DCDCDC] bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-[#222] outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 disabled:bg-green-50"
                />

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={
                    verifyingOtp ||
                    otp.length !== 6 ||
                    otpVerified
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all sm:w-28 ${
                    otpVerified
                      ? "bg-green-600"
                      : "bg-[#B28A22] hover:bg-[#967319]"
                  } disabled:cursor-not-allowed disabled:bg-gray-300`}
                >
                  {verifyingOtp
                    ? "Checking..."
                    : otpVerified
                    ? "Verified ✓"
                    : "Verify"}
                </button>

              </div>

            </div>
          )}

          {/* ================= MESSAGE ================= */}

          {message && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

              <span className="mt-0.5 font-bold">
                ✓
              </span>

              <p>{message}</p>

            </div>
          )}

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span className="mt-0.5 font-bold">
                !
              </span>

              <p>{error}</p>

            </div>
          )}

          {/* ================= COMPLETE REGISTRATION ================= */}

          <button
            type="button"
            onClick={handleCompleteRegistration}
            disabled={!otpVerified || registering}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
              otpVerified
                ? "bg-gradient-to-r from-[#B28A22] via-[#D4AF37] to-[#B28A22] text-white shadow-[0_8px_25px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(212,175,55,0.35)]"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
          >
            {registering
              ? "Creating Account..."
              : otpVerified
              ? "Complete Registration"
              : "Verify Email to Continue"}
          </button>

          {/* ================= LOGIN LINK ================= */}

          <p className="mt-6 text-center text-sm text-gray-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-[#A27B18] hover:text-[#7F600E]"
            >
              Login
            </Link>

          </p>

        </div>

        {/* ================= FOOTER TEXT ================= */}

        <p className="mt-6 text-center text-xs text-gray-400">
          Your information is securely protected.
        </p>

      </div>
    </div>
  );
};

export default Register;
