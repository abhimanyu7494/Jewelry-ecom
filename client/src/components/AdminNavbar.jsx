import { useLocation, useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const baseButton =
    "flex-1 whitespace-nowrap rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm md:px-6";

  const activeButton =
    "bg-gradient-to-r from-[#B88A16] via-[#D4AF37] to-[#B88A16] text-white shadow-[0_8px_25px_rgba(184,138,22,0.20)]";

  const inactiveButton =
    "border border-[#D4AF37]/40 bg-white text-[#A17B20] hover:border-[#D4AF37] hover:bg-[#FFF9E8]";

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <nav className="-mt-5 sm:-mt-6 md:-mt-7">
        <div className="mx-auto flex w-full max-w-5xl flex-row gap-2 sm:gap-3">
          
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className={`${baseButton} ${
              isActive("/admin") ? activeButton : inactiveButton
            }`}
          >
            Dashboard
          </button>

          {/* Collections */}
          <button
            type="button"
            onClick={() => navigate("/admin/collections")}
            className={`${baseButton} ${
              isActive("/admin/collections") ? activeButton : inactiveButton
            }`}
          >
            Manage Collections
          </button>

          {/* Products */}
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className={`${baseButton} ${
              isActive("/admin/products") ? activeButton : inactiveButton
            }`}
          >
            Manage Products
          </button>

          {/* Users */}
<button
  type="button"
  onClick={() => navigate("/admin/users")}
  className={`${baseButton} ${
    isActive("/admin/users")
      ? activeButton
      : inactiveButton
  }`}
>
  Manage Users
</button>


        </div>
      </nav>
    </div>
  );
}

export default AdminNavbar;
