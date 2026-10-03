import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAF8] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-[#E5E1D7] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:p-8">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B28A22]">
              MyStore Account
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202020] sm:text-4xl">
              Welcome, {user?.fullName || "User"} 👋
            </h1>

            <p className="mt-2 text-sm text-[#888]">
              Manage your profile, orders and account from here.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            Logout
          </button>

        </div>

        {/* ================= CARDS ================= */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* PROFILE */}

          <div className="rounded-3xl border border-[#E5E1D7] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#9B7820] text-lg font-bold text-white">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h2 className="font-semibold text-[#222]">
                  My Profile
                </h2>

                <p className="text-xs text-[#999]">
                  Personal information
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4 text-sm">

              <div>
                <p className="text-xs uppercase tracking-wider text-[#999]">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-[#333]">
                  {user?.fullName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#999]">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-[#333]">
                  {user?.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#999]">
                  Phone
                </p>

                <p className="mt-1 font-medium text-[#333]">
                  {user?.phone || "-"}
                </p>
              </div>

            </div>

          </div>

          {/* ORDERS */}

          <div className="rounded-3xl border border-[#E5E1D7] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF4DD] text-xl text-[#B28A22]">
              🛍
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#222]">
              My Orders
            </h2>

            <p className="mt-2 text-sm text-[#888]">
              Your orders will appear here after you purchase products.
            </p>

            <div className="mt-6 rounded-xl bg-[#FAFAF8] p-4">
              <p className="text-2xl font-semibold text-[#222]">
                0
              </p>

              <p className="text-xs uppercase tracking-wider text-[#999]">
                Total Orders
              </p>
            </div>

          </div>

          {/* ACCOUNT */}

          <div className="rounded-3xl border border-[#E5E1D7] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F5] text-xl">
              ⚙
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#222]">
              Account
            </h2>

            <p className="mt-2 text-sm text-[#888]">
              Manage your account and personal information.
            </p>

            <button
              onClick={() => navigate("/user-dashboard")}
              className="mt-6 w-full rounded-xl border border-[#D4AF37] bg-[#FFFDF5] px-4 py-3 text-sm font-medium text-[#9A741B] transition hover:bg-[#FAF3D7]"
            >
              View Account
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
