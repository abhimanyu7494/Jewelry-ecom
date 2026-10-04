import { useEffect, useState } from "react";
import api from "../services/api";

import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setShowFilters(false);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);


  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sort]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (sort) {
        params.sort = sort;
      }

      const response = await api.get("/products", {
        params,
      });

      setProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSort("");
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);

    setTimeout(() => {
      document
        .getElementById("products-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const hasFilters = selectedCategory || sort;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#242424]">

      {/* =====================================================
          TOP SEARCH + FILTER BAR
      ===================================================== */}

      <section className="sticky top-[68px] z-40 border-b border-[#E8E5DD] bg-white/95 shadow-[0_5px_25px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:top-[76px]">



        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 sm:gap-3">

            {/* Filter Button - Left */}

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-300 sm:h-12 sm:px-5 ${
                showFilters || hasFilters
                  ? "border-[#D4AF37] bg-[#FFF9E8] text-[#9A7418]"
                  : "border-[#E3E0D8] bg-white text-[#555555] hover:border-[#D4AF37]/60 hover:text-[#9A7418]"
              }`}
            >

              {/* Filter Icon */}

              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M4 6h16M7 12h10m-7 6h4"
                />
              </svg>

              <span>Filter</span>

              {(selectedCategory || sort) && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-white">
                  {(selectedCategory ? 1 : 0) +
                    (sort ? 1 : 0)}
                </span>
              )}

            </button>

            {/* Search - Right */}

            <div className="relative min-w-0 flex-1">

              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999] sm:left-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="1.8"
                  d="m21 21-4.35-4.35m2.1-5.15a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E3E0D8] bg-[#FAFAF8] pl-10 pr-4 text-sm text-[#242424] outline-none transition-all duration-300 placeholder:text-[#AAAAAA] focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10 sm:h-12 sm:pl-11"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#EAE7DF] text-[#777777] transition hover:bg-[#D4AF37] hover:text-white"
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* =================================================
              FILTER DROPDOWN AREA
          ================================================= */}

          <div
            className={`grid transition-all duration-300 ${
              showFilters
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >

            <div className="overflow-hidden">

              <div className="grid gap-3 pb-2 pt-3 sm:grid-cols-2">

                {/* Category */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999999]">
                    Category
                  </label>

                  <div className="relative">

                    <select
                      value={selectedCategory}
                      onChange={(e) =>
                        setSelectedCategory(e.target.value)
                      }
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#E3E0D8] bg-white px-4 pr-10 text-sm text-[#444444] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                    >
                      <option value="">
                        All Categories
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]"
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

                  </div>
                </div>

                {/* Sort */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999999]">
                    Sort By
                  </label>

                  <div className="relative">

                    <select
                      value={sort}
                      onChange={(e) =>
                        setSort(e.target.value)
                      }
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#E3E0D8] bg-white px-4 pr-10 text-sm text-[#444444] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                    >
                      <option value="">
                        Default
                      </option>

                      <option value="price_asc">
                        Price: Low to High
                      </option>

                      <option value="price_desc">
                        Price: High to Low
                      </option>
                    </select>

                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]"
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

                  </div>
                </div>

              </div>

              {/* Clear */}

              {(search || selectedCategory || sort) && (
                <div className="flex justify-end pb-2">

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-[#A17B20] transition hover:text-[#7D5D12] hover:underline"
                  >
                    Clear all filters
                  </button>

                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section>

          <div className="mb-6 text-center sm:mb-8">

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A17B20] sm:text-xs">
              Explore
            </p>

            <h1 className="font-['Instrument_Serif'] text-4xl font-normal tracking-wide text-[#242424] sm:text-5xl lg:text-6xl">
              Our Categories
            </h1>

            <div className="mx-auto mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#D4AF37]/40" />
              <span className="h-1 w-1 rotate-45 bg-[#D4AF37]" />
              <span className="h-px w-8 bg-[#D4AF37]/40" />
            </div>

          </div>

          {categories.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto px-1 scrollbar-hide sm:gap-5">
  {categories.map((category) => (
    <div
      key={category._id}
      className="w-[160px] shrink-0 sm:w-[200px]"
    >
      <CategoryCard
        category={category}
        onClick={handleCategoryClick}
      />
    </div>
  ))}
</div>

          ) : (
            <div className="py-10 text-center text-sm text-[#999999]">
              No categories available
            </div>
          )}

        </section>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section
          id="products-section"
          className="mt-12 scroll-mt-32 sm:mt-16"
        >

          <div className="mb-6 text-center sm:mb-8">

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A17B20] sm:text-xs">
              Discover
            </p>

            <h2 className="font-['Instrument_Serif'] text-4xl font-normal tracking-wide text-[#242424] sm:text-5xl lg:text-6xl">
              Our Products
            </h2>

            <div className="mx-auto mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#D4AF37]/40" />
              <span className="h-1 w-1 rotate-45 bg-[#D4AF37]" />
              <span className="h-px w-8 bg-[#D4AF37]/40" />
            </div>

          </div>

          {/* Active Filter */}

          {(selectedCategory || sort || search) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8E5DD] bg-white px-4 py-3">

              <div className="flex flex-wrap items-center gap-2">

                {search && (
                  <span className="rounded-full bg-[#F4F2EC] px-3 py-1.5 text-xs text-[#666666]">
                    Search: {search}
                  </span>
                )}

                {selectedCategory && (
                  <span className="rounded-full bg-[#FFF8E5] px-3 py-1.5 text-xs text-[#9A7418]">
                    Category:{" "}
                    {
                      categories.find(
                        (category) =>
                          category._id === selectedCategory
                      )?.name
                    }
                  </span>
                )}

                {sort && (
                  <span className="rounded-full bg-[#F4F2EC] px-3 py-1.5 text-xs text-[#666666]">
                    {sort === "price_asc"
                      ? "Price: Low → High"
                      : "Price: High → Low"}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#A17B20] hover:underline"
              >
                Clear
              </button>

            </div>
          )}

          {/* Products */}

          {products.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E5DD] bg-white px-5 py-20 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F2EA] text-[#B08A25]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="m21 21-4.35-4.35m2.1-5.15a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z"
                  />
                </svg>
              </div>

              <p className="font-['Instrument_Serif'] text-3xl text-[#777777]">
                No products found
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-[#A17B20] hover:underline"
              >
                Clear filters
              </button>

            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default Home;
