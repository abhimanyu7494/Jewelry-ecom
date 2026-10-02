import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // ================= CHECK LOGIN =================
 useEffect(() => {
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");

    if (token) {
      setIsLoggedIn(true);

      if (storedAdmin) {
        try {
          setAdmin(JSON.parse(storedAdmin));
        } catch {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } else {
      setIsLoggedIn(false);
      setAdmin(null);
    }
  };

  // Initial check
  checkLogin();

  // Login ke baad update
  window.addEventListener("authChanged", checkLogin);

  // Dusre tab/window se login state change hone par
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
  localStorage.removeItem("token");
  localStorage.removeItem("admin");

  setIsLoggedIn(false);
  setAdmin(null);
  setProfileOpen(false);

  window.dispatchEvent(new Event("authChanged"));

  navigate("/login");
};


  // ================= ADMIN NAME =================
  const getAdminName = () => {
    if (!admin) return "Profile";

    return (
      admin.name ||
      admin.username ||
      admin.fullName ||
      admin.email?.split("@")[0] ||
      "Profile"
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#D4AF37]/20 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">

      {/* ================= NAVBAR ================= */}
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-3 sm:h-[76px] sm:px-6 lg:px-8">

        {/* ================= LEFT LOGO ================= */}
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
        >

          {/* Logo */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37] bg-gradient-to-br from-[#FFF8D8] via-[#D4AF37] to-[#9A761C] text-base font-bold text-white shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 sm:h-11 sm:w-11 sm:text-xl">

            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative z-10">
              M
            </span>
          </div>

          {/* Brand */}
          <div className="min-w-0 leading-none">

            <h1 className="whitespace-nowrap text-[18px] font-semibold tracking-wide text-[#171717] sm:text-2xl">
              My<span className="text-[#B28A22]">Store</span>
            </h1>

            <p className="mt-1 whitespace-nowrap text-[6px] font-medium uppercase tracking-[0.20em] text-[#8A8A8A] sm:text-[9px] sm:tracking-[0.3em]">
              Luxury Collection
            </p>

          </div>
        </Link>

        {/* ================= RIGHT SIDE ================= */}
        <div className="shrink-0">

          {!isLoggedIn ? (

            /* =================================================
               PREMIUM GOLD LOGIN BUTTON
            ================================================== */
            <Link
  to="/login"
  className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-[#D4AF37] bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#8A6814] shadow-[0_2px_8px_rgba(212,175,55,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B28A22] hover:bg-[#FFFDF5] hover:text-[#6F520C] hover:shadow-[0_4px_14px_rgba(212,175,55,0.18)] active:translate-y-0 sm:px-4 sm:py-2"
>
  {/* Golden shine */}
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

  {/* Icon */}
  <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#FFF9E8] sm:h-6 sm:w-6">
    <svg
      className="h-2.5 w-2.5 text-[#B28A22] transition-transform duration-300 group-hover:translate-x-0.5 sm:h-3 sm:w-3"
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


          ) : (

            /* ================= PROFILE ================= */
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
                  {getAdminName().charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="hidden text-left min-[430px]:block">
                  <p className="max-w-[100px] truncate text-xs font-semibold text-[#222] sm:max-w-[130px] sm:text-sm">
                    {getAdminName()}
                  </p>

                  <p className="text-[9px] uppercase tracking-wider text-[#999] sm:text-[10px]">
                    Account
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
                <div className="absolute right-0 mt-3 w-60 max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-2xl border border-[#E3E3E3] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.13)]">

                  <div className="border-b border-[#EEEEEE] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#999]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-[#222]">
                      {admin?.email || getAdminName()}
                    </p>
                  </div>

                  {/* Dashboard */}
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#333] transition-all duration-200 hover:bg-[#FAF6E8] hover:text-[#A27B18]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F0D5] text-[#B28A22]">
                      ✦
                    </span>

                    Dashboard
                  </Link>

                  {/* Logout */}
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
