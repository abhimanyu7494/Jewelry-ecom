import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tejasLogo from "../assets/tejas.png";

function Navbar() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [account, setAccount] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // ================= CHECK AUTH =================

  const checkLogin = () => {
    const token = localStorage.getItem("token");

    const storedAdmin = localStorage.getItem("admin");
    const storedUser = localStorage.getItem("user");

    // ================= ADMIN =================

    if (token && storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);

        setAccountType("admin");
        setAccount(admin);
        setIsLoggedIn(true);

        return;
      } catch (error) {
        console.error("Invalid admin data");

        localStorage.removeItem("admin");
        localStorage.removeItem("token");
      }
    }

    // ================= USER =================

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setAccountType("user");
        setAccount(user);
        setIsLoggedIn(true);

        return;
      } catch (error) {
        console.error("Invalid user data");

        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // ================= NOT LOGGED IN =================

    setIsLoggedIn(false);
    setAccountType(null);
    setAccount(null);
  };

  // ================= AUTH LISTENER =================

  useEffect(() => {
    checkLogin();

    window.addEventListener("authChanged", checkLogin);
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("authChanged", checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  // ================= CLOSE DROPDOWN =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= LOGOUT =================

  const handleLogout = () => {
    // Common token
    localStorage.removeItem("token");

    // ================= ADMIN LOGOUT =================

    if (accountType === "admin") {
      localStorage.removeItem("admin");

      setIsLoggedIn(false);
      setAccountType(null);
      setAccount(null);
      setProfileOpen(false);

      window.dispatchEvent(new Event("authChanged"));

      navigate("/login");

      return;
    }

    // ================= USER LOGOUT =================

    if (accountType === "user") {
      localStorage.removeItem("user");

      setIsLoggedIn(false);
      setAccountType(null);
      setAccount(null);
      setProfileOpen(false);

      window.dispatchEvent(new Event("authChanged"));

      navigate("/");

      return;
    }

    // ================= FALLBACK =================

    localStorage.removeItem("admin");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setAccountType(null);
    setAccount(null);
    setProfileOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  // ================= ACCOUNT NAME =================

  const getAccountName = () => {
    if (!account) {
      return "Profile";
    }

    return (
      account.fullName ||
      account.name ||
      account.username ||
      account.email?.split("@")[0] ||
      "Profile"
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#D4AF37]/20 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">

      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-3 sm:h-[76px] sm:px-6 lg:px-8">

        {/* ================= LOGO ================= */}

        <Link
          to="/"
          className="group flex items-center"
        >
          <img
            src={tejasLogo}
            alt="Tejas Logo"
           className="h-16 w-auto max-w-[280px] scale-125 object-contain transition-all duration-300 group-hover:scale-130 sm:h-20 sm:max-w-[320px] sm:scale-125"

          />
        </Link>

        {/* ================= RIGHT SIDE ================= */}

        <div className="shrink-0">

          {/* ================= NOT LOGGED IN ================= */}

          {!isLoggedIn ? (
            <div className="flex items-center gap-2">

              {/* ================= LOGIN ================= */}

              <Link
                to="/login"
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-[#D4AF37] bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#8A6814] shadow-[0_2px_8px_rgba(212,175,55,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B28A22] hover:bg-[#FFFDF5] hover:text-[#6F520C] hover:shadow-[0_4px_14px_rgba(212,175,55,0.18)] sm:px-4 sm:py-2"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#FFF9E8] sm:h-6 sm:w-6">
                  <svg
                    className="h-2.5 w-2.5 text-[#B28A22] sm:h-3 sm:w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-5 5-5-5-5m5 5H3"
                    />
                  </svg>
                </span>

                <span className="relative z-10">
                  Login
                </span>
              </Link>

              {/* ================= REGISTRATION ================= */}

              <Link
                to="/register"
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-[#D4AF37] bg-[#D4AF37] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(212,175,55,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B28A22] hover:bg-[#B28A22] hover:shadow-[0_4px_14px_rgba(212,175,55,0.25)] sm:px-4 sm:py-2"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/10 sm:h-6 sm:w-6">
                  <svg
                    className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                </span>

                <span className="relative z-10">
                  Register
                </span>
              </Link>

            </div>
          ) : (

            /* ================= LOGGED IN ================= */

            <div
              className="relative"
              ref={profileRef}
            >

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group flex items-center gap-2 rounded-full border border-[#D6D6D6] bg-white px-2 py-1.5 shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_6px_22px_rgba(212,175,55,0.18)] sm:gap-3 sm:px-3 sm:py-2"
              >

                {/* Avatar */}

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F5E6A8] to-[#9B7820] text-xs font-bold text-white shadow-inner sm:h-9 sm:w-9 sm:text-sm">
                  {getAccountName().charAt(0).toUpperCase()}
                </div>

                {/* Name */}

                <div className="hidden text-left min-[430px]:block">
                  <p className="max-w-[120px] truncate text-xs font-semibold text-[#222] sm:max-w-[150px] sm:text-sm">
                    {getAccountName()}
                  </p>

                  <p className="text-[9px] uppercase tracking-wider text-[#999] sm:text-[10px]">
                    {accountType === "admin" ? "Admin" : "Account"}
                  </p>
                </div>

                {/* Arrow */}

                <svg
                  className={`h-3.5 w-3.5 text-[#888] transition-transform duration-300 sm:h-4 sm:w-4 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="m6 9 6 6 6-6"
                  />
                </svg>

              </button>

              {/* ================= DROPDOWN ================= */}

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-2xl border border-[#E3E3E3] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.13)]">

                  {/* ACCOUNT INFO */}

                  <div className="border-b border-[#EEEEEE] px-4 py-3">

                    <p className="text-xs uppercase tracking-[0.2em] text-[#999]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-[#222]">
                      {account?.email || getAccountName()}
                    </p>

                  </div>

                  {/* ================= ADMIN DASHBOARD ================= */}

                  {accountType === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#333] transition-all duration-200 hover:bg-[#FAF6E8] hover:text-[#A27B18]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F0D5] text-[#B28A22]">
                        ✦
                      </span>

                      Admin Dashboard
                    </Link>
                  )}

                  {/* ================= USER DASHBOARD ================= */}

                  {accountType === "user" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#333] transition-all duration-200 hover:bg-[#FAF6E8] hover:text-[#A27B18]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F0D5] text-[#B28A22]">
                        👤
                      </span>

                      My Dashboard
                    </Link>
                  )}

                  {/* ================= LOGOUT ================= */}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#555] transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F5F5]">
                      ↪
                    </span>

                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
