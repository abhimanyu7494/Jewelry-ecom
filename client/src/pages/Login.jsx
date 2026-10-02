import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
localStorage.setItem("admin", JSON.stringify(response.data.admin));

window.dispatchEvent(new Event("authChanged"));

navigate("/admin");

    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#FAFAF8] px-4 py-10 sm:px-6 sm:py-16">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Gold glow */}
        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[110px] sm:h-[550px] sm:w-[550px]" />

        {/* Silver glow */}
        <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-[#D9D9D9]/50 blur-[100px]" />

        <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#777 1px, transparent 1px), linear-gradient(90deg, #777 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

      </div>


      {/* ================= LOGIN CARD ================= */}

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-[#E2DED4] bg-white/95 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:rounded-[32px] sm:p-9"
      >

        {/* Top gold line */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* ================= HEADER ================= */}

        <div className="mb-7 text-center sm:mb-9">

          {/* Logo */}
          <div className="group relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-gradient-to-br from-[#FFFDF5] via-[#F8F8F6] to-[#E5E5E2] shadow-[0_8px_25px_rgba(212,175,55,0.12)] sm:mb-5 sm:h-16 sm:w-16">

            <div className="absolute inset-1 rounded-full border border-[#D4AF37]/20" />

            <span className="relative font-['Instrument_Serif'] text-2xl text-[#A17B20] sm:text-3xl">
              M
            </span>

          </div>


          {/* Brand */}
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#999999] sm:text-[10px]">
            My<span className="text-[#A17B20]">Store</span>
          </p>


          {/* Heading */}
          <h2 className="font-['Instrument_Serif'] text-4xl font-normal tracking-wide text-[#202020] sm:text-5xl">
            Welcome Back
          </h2>


          {/* Gold divider */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">

            <span className="h-px w-7 bg-[#D4AF37]/40" />

            <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]" />

            <span className="h-px w-7 bg-[#D4AF37]/40" />

          </div>


          <p className="mt-4 text-sm text-[#888888]">
            Sign in to access your dashboard
          </p>

        </div>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs">
              !
            </span>

            <p>{error}</p>

          </div>
        )}


        {/* ================= EMAIL ================= */}

        <div className="mb-4 sm:mb-5">

          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666] sm:text-[11px]">
            Email Address
          </label>

          <div className="group relative">

            {/* Email icon */}
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA] transition-colors duration-300 group-focus-within:text-[#B28A22] sm:left-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="M4 6h16v12H4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="m4 7 8 6 8-6"
              />
            </svg>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#E1DED7] bg-[#FAFAF8] py-3.5 pl-11 pr-4 text-sm text-[#222222] outline-none transition-all duration-300 placeholder:text-[#AAAAAA] hover:border-[#D2D0CB] focus:border-[#D4AF37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.08)] sm:py-4 sm:pl-12"
            />

          </div>

        </div>


        {/* ================= PASSWORD ================= */}

        <div className="mb-6 sm:mb-7">

          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666] sm:text-[11px]">
            Password
          </label>

          <div className="group relative">

            {/* Lock icon */}
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA] transition-colors duration-300 group-focus-within:text-[#B28A22] sm:left-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
                strokeWidth="1.7"
              />

              <path
                strokeLinecap="round"
                strokeWidth="1.7"
                d="M8 10V7a4 4 0 0 1 8 0v3"
              />
            </svg>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#E1DED7] bg-[#FAFAF8] py-3.5 pl-11 pr-4 text-sm text-[#222222] outline-none transition-all duration-300 placeholder:text-[#AAAAAA] hover:border-[#D2D0CB] focus:border-[#D4AF37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.08)] sm:py-4 sm:pl-12"
            />

          </div>

        </div>


        {/* ================= LOGIN BUTTON ================= */}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl border border-[#B28A22] bg-gradient-to-r from-[#B28A22] via-[#D4AF37] to-[#B28A22] px-5 py-3.5 font-['Instrument_Serif'] text-xl text-white shadow-[0_10px_25px_rgba(180,140,35,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(180,140,35,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
        >

          {/* Shine */}
          <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-all duration-700 group-hover:left-[120%]" />

          <span className="relative z-10 flex items-center justify-center gap-2">

            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging in...
              </>
            ) : (
              <>
                Login

                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M5 12h14m-6-6 6 6-6 6"
                  />
                </svg>
              </>
            )}

          </span>

        </button>


        {/* ================= BOTTOM ================= */}

        <div className="mt-6 flex items-center justify-center gap-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#AAAAAA] sm:mt-7 sm:text-[9px]">

          <span className="h-px flex-1 bg-[#E8E6E1]" />

          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rotate-45 bg-[#D4AF37]" />
            Secure Access
            <span className="h-1 w-1 rotate-45 bg-[#C0C0C0]" />
          </span>

          <span className="h-px flex-1 bg-[#E8E6E1]" />

        </div>

      </form>

    </div>
  );
}

export default Login;
