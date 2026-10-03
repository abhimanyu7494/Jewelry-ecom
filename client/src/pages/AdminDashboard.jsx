import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

function AdminDashboard() {
  const navigate = useNavigate();

  const [totalCollections, setTotalCollections] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Dashboard Stats
  // =========================

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [categoriesResponse, productsResponse] =
        await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);

      const categories = categoriesResponse.data;
      const products = productsResponse.data;

      // Total Collections
      setTotalCollections(categories.length);

      // Total Products
      setTotalProducts(products.length);

      // Total Stock
      const stock = products.reduce(
        (total, product) =>
          total + Number(product.stock || 0),
        0
      );

      setTotalStock(stock);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard stats:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Classes
  // =========================

  const statCard =
    "group cursor-pointer rounded-[24px] border border-[#E7E2D8] bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]";

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-3 py-5 text-[#222] sm:px-6 sm:py-8 lg:px-8">

      <AdminNavbar />

      {/* =========================
          Background
      ========================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#C0C0C0]/10 blur-[110px]" />

      </div>

      <div className="relative z-10">

        <div className="mx-auto max-w-7xl">

          {/* =========================
              Header
          ========================= */}

          <div className="mb-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
              Admin
            </p>

            <h1 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
              Dashboard
            </h1>

            <div className="mt-3 h-px w-12 bg-[#D4AF37]" />

            <p className="mt-3 text-sm text-[#888]">
              Overview of your store inventory and collections.
            </p>

          </div>


          {/* =========================
              STAT CARDS
          ========================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">


            {/* =========================
                COLLECTIONS
            ========================= */}

            <div
              onClick={() =>
                navigate("/admin/collections")
              }
              className={statCard}
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">
                    Collections
                  </p>

                  <h2 className="mt-3 font-['Instrument_Serif'] text-4xl text-[#222]">
                    {loading
                      ? "..."
                      : totalCollections}
                  </h2>

                  <p className="mt-1 text-xs text-[#999]">
                    Total categories
                  </p>

                </div>


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF9E8] text-[#B88A16]">

                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                    />

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 8h8M8 12h8M8 16h5"
                    />

                  </svg>

                </div>

              </div>


              <div className="mt-5 h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />

              <p className="mt-3 text-xs font-medium text-[#A17B20] transition group-hover:translate-x-1">
                Manage Collections →
              </p>

            </div>


            {/* =========================
                PRODUCTS
            ========================= */}

            <div
              onClick={() =>
                navigate("/admin/products")
              }
              className={statCard}
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">
                    Products
                  </p>

                  <h2 className="mt-3 font-['Instrument_Serif'] text-4xl text-[#222]">
                    {loading
                      ? "..."
                      : totalProducts}
                  </h2>

                  <p className="mt-1 text-xs text-[#999]">
                    Total products
                  </p>

                </div>


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F4EA] text-[#B88A16]">

                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    />

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 8h8M8 12h8M8 16h5"
                    />

                  </svg>

                </div>

              </div>


              <div className="mt-5 h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />

              <p className="mt-3 text-xs font-medium text-[#A17B20] transition group-hover:translate-x-1">
                Manage Products →
              </p>

            </div>


            {/* =========================
                TOTAL STOCK
            ========================= */}

            <div
              onClick={() =>
                navigate("/admin/products")
              }
              className={statCard}
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">
                    Inventory
                  </p>

                  <h2 className="mt-3 font-['Instrument_Serif'] text-4xl text-[#222]">
                    {loading
                      ? "..."
                      : totalStock}
                  </h2>

                  <p className="mt-1 text-xs text-[#999]">
                    Total stock units
                  </p>

                </div>


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F3EF] text-[#A17B20]">

                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                    />

                    <path
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7.5 12 12l8-4.5M12 12v9"
                    />

                  </svg>

                </div>

              </div>


              <div className="mt-5 h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />

              <p className="mt-3 text-xs font-medium text-[#A17B20] transition group-hover:translate-x-1">
                Manage Inventory →
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
