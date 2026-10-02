import { useEffect, useState } from "react";
import api from "../services/api";
import { useEffect, useRef, useState } from "react";


function AdminDashboard() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // =========================
  // Category states
  // =========================

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryPreview, setCategoryPreview] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);
  const [categoryUploading, setCategoryUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const productFormRef = useRef(null);

  // =========================
  // Product states
  // =========================

  const [productForm, setProductForm] = useState({
    category: "",
    name: "",
    stock: 0,
    buyPrice: "",
    sellPrice: "",
    image: "",
    allPosition: "",
    categoryPosition: "",
  });

  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [productUploading, setProductUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // =========================
  // Product Filters
  // =========================

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSort, setProductSort] = useState("");

  // =========================
  // Initial Categories
  // =========================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // Fetch Products
  // =========================

  useEffect(() => {
    fetchProducts();
  }, [productSearch, productCategory, productSort]);

  // =========================
  // Categories
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setCategoryFile(file);
    setCategoryPreview(URL.createObjectURL(file));
  };

  const uploadCategoryImage = async () => {
    if (!categoryFile) {
      return categoryImage;
    }

    const formData = new FormData();
    formData.append("image", categoryFile);

    setCategoryUploading(true);

    try {
      const response = await api.post("/upload/image", formData);

      return response.data.imageUrl;
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Category image upload failed"
      );

      return null;
    } finally {
      setCategoryUploading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrl = await uploadCategoryImage();

      if (!imageUrl) {
        alert("Please upload category image");
        return;
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, {
          name: categoryName,
          image: imageUrl,
        });
      } else {
        await api.post("/categories", {
          name: categoryName,
          image: imageUrl,
        });
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Category operation failed"
      );
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryImage(category.image);
    setCategoryPreview(category.image);
    setCategoryFile(null);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage("");
    setCategoryPreview("");
    setCategoryFile(null);
  };

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "This will permanently delete this category and all products inside it. Are you sure?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${id}`);

      await fetchCategories();
      await fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  // =========================
  // Products
  // =========================

  const fetchProducts = async () => {
    try {
      const params = {};

      if (productSearch.trim()) {
        params.search = productSearch.trim();
      }

      if (productCategory) {
        params.category = productCategory;
      }

      if (productSort) {
        params.sort = productSort;
      }

      const response = await api.get("/products", {
        params,
      });

      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setProductFile(file);
    setProductPreview(URL.createObjectURL(file));
  };

  const uploadProductImage = async () => {
    if (!productFile) {
      return productForm.image;
    }

    const formData = new FormData();
    formData.append("image", productFile);

    setProductUploading(true);

    try {
      const response = await api.post(
        "/upload/image",
        formData
      );

      return response.data.imageUrl;
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Product image upload failed"
      );

      return null;
    } finally {
      setProductUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrl = await uploadProductImage();

      if (!imageUrl) {
        alert("Please upload product image");
        return;
      }

      const data = {
        ...productForm,

        image: imageUrl,

        stock: Number(productForm.stock),
        buyPrice: Number(productForm.buyPrice),
        sellPrice: Number(productForm.sellPrice),

        allPosition:
          productForm.allPosition === ""
            ? null
            : Number(productForm.allPosition),

        categoryPosition:
          productForm.categoryPosition === ""
            ? null
            : Number(productForm.categoryPosition),
      };

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct._id}`,
          data
        );
      } else {
        await api.post("/products", data);
      }

      resetProductForm();
      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Product operation failed"
      );
    }
  };

 const editProduct = (product) => {
  setEditingProduct(product);

  setProductForm({
    category: product.category?._id || "",
    name: product.name,
    stock: product.stock,
    buyPrice: product.buyPrice,
    sellPrice: product.sellPrice,
    image: product.image,
    allPosition: product.allPosition ?? "",
    categoryPosition: product.categoryPosition ?? "",
  });

  setProductPreview(product.image);
  setProductFile(null);

  // Edit form par smoothly scroll karo
  setTimeout(() => {
    productFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 50);
};


  const resetProductForm = () => {
    setEditingProduct(null);

    setProductForm({
      category: "",
      name: "",
      stock: 0,
      buyPrice: "",
      sellPrice: "",
      image: "",
      allPosition: "",
      categoryPosition: "",
    });

    setProductPreview("");
    setProductFile(null);
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // =========================
  // Stock
  // =========================

 const updateStock = async (id, action) => {
  // UI ko immediately update karo
  setProducts((prevProducts) =>
    prevProducts.map((product) => {
      if (product._id !== id) return product;

      const newStock =
        action === "increase"
          ? product.stock + 1
          : Math.max(0, product.stock - 1);

      return {
        ...product,
        stock: newStock,
      };
    })
  );

  try {
    await api.patch(`/products/${id}/stock`, {
      action,
    });
  } catch (error) {
    // API fail ho to latest data wapas fetch kar lo
    fetchProducts();

    alert(
      error.response?.data?.message ||
        "Failed to update stock"
    );
  }
};


  // =====================================================
  // POSITION OPTIONS
  // =====================================================

  const getAllPositionOptions = () => {
    const totalProducts = products.length;

    const maxPosition = editingProduct
      ? Math.max(totalProducts, editingProduct.allPosition || 0)
      : totalProducts + 1;

    const occupiedPositions = new Set(
      products
        .filter(
          (product) =>
            product.allPosition !== null &&
            product.allPosition !== undefined &&
            product.allPosition !== ""
        )
        .filter(
          (product) =>
            !editingProduct ||
            product._id !== editingProduct._id
        )
        .map((product) => Number(product.allPosition))
    );

    return Array.from(
      { length: maxPosition },
      (_, index) => {
        const position = index + 1;

        return {
          position,
          occupied: occupiedPositions.has(position),
        };
      }
    );
  };

  // =====================================================
  // CATEGORY POSITION OPTIONS
  // =====================================================

  const getCategoryPositionOptions = () => {
    const selectedCategory = productForm.category;

    if (!selectedCategory) {
      return [];
    }

    const categoryProducts = products.filter(
      (product) =>
        product.category?._id === selectedCategory
    );

    const currentProductCategory =
      editingProduct?.category?._id;

    const categoryChanged =
      editingProduct &&
      currentProductCategory !== selectedCategory;

    const maxPosition = categoryChanged
      ? categoryProducts.length + 1
      : Math.max(
          categoryProducts.length,
          editingProduct?.categoryPosition || 0
        );

    const occupiedPositions = new Set(
      categoryProducts
        .filter(
          (product) =>
            product.categoryPosition !== null &&
            product.categoryPosition !== undefined &&
            product.categoryPosition !== ""
        )
        .filter(
          (product) =>
            !editingProduct ||
            product._id !== editingProduct._id
        )
        .map(
          (product) =>
            Number(product.categoryPosition)
        )
    );

    return Array.from(
      { length: maxPosition },
      (_, index) => {
        const position = index + 1;

        return {
          position,
          occupied: occupiedPositions.has(position),
        };
      }
    );
  };

  // =====================================================
  // POSITION SELECT
  // =====================================================

  const PositionSelect = ({
    name,
    value,
    options,
    placeholder,
    onChange,
  }) => {
    return (
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputClass} cursor-pointer appearance-none pr-12`}
        >
          <option value="" className="bg-white text-gray-500">
            {placeholder}
          </option>

          {options.map(({ position, occupied }) => (
            <option
              key={position}
              value={position}
              disabled={occupied}
              className="bg-white text-gray-800"
            >
              Position {position}
              {occupied
                ? " — Occupied"
                : " — Available"}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B08D2C]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    );
  };

  // =========================
  // Clear Filters
  // =========================

  const clearProductFilters = () => {
    setProductSearch("");
    setProductCategory("");
    setProductSort("");
  };

  const hasProductFilters =
    productSearch ||
    productCategory ||
    productSort;

  // =========================
  // Logout
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    window.location.href = "/login";
  };

  // =========================
  // UI Classes
  // =========================

  const inputClass =
    "w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3 text-[15px] text-[#222] outline-none transition-all duration-300 placeholder:text-[#A5A5A5] hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10";

  const buttonGold =
    "relative overflow-hidden rounded-xl bg-gradient-to-r from-[#B88A16] via-[#D4AF37] to-[#B88A16] px-6 py-3 font-semibold text-white shadow-[0_8px_25px_rgba(184,138,22,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(184,138,22,0.30)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  const sectionClass =
    "rounded-[28px] border border-[#E7E2D8] bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.06)] sm:p-7 lg:p-8";

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-3 py-5 text-[#222] sm:px-6 sm:py-8 lg:px-8">

      {/* Background Decoration */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-[100px]" />
        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#C0C0C0]/10 blur-[110px]" />
      </div>

      <div className="relative z-10">

        {/* ================= HEADER ================= */}

        <header className="mx-auto mb-7 max-w-7xl overflow-hidden rounded-[28px] border border-[#E6E1D6] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.07)]"> <div className="relative px-5 py-6 sm:px-8 sm:py-8">
{/* Gold Accent */}
<div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

  {/* LEFT — Dashboard Title */}
  <div className="min-w-0">

    <div className="mb-2 flex items-center gap-2">
      <span className="h-px w-8 bg-[#D4AF37]" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#A17B20]">
        MyStore
      </p>

      <span className="h-px w-8 bg-[#D4AF37]" />
    </div>

    <h1 className="font-['Instrument_Serif'] text-4xl font-normal tracking-wide text-[#202020] sm:text-5xl">
      Admin Dashboard
    </h1>

    <div className="mt-3 h-px w-16 bg-gradient-to-r from-[#D4AF37] to-transparent" />

  </div>


  {/* RIGHT — Welcome Admin */}
  <div className="flex items-center gap-3 sm:gap-4">

    {/* Avatar */}
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#FFF8E5] to-[#F8F4E8] shadow-sm sm:h-14 sm:w-14">

      <span className="font-['Instrument_Serif'] text-xl text-[#A17B20] sm:text-2xl">
        {admin?.username?.charAt(0)?.toUpperCase() || "A"}
      </span>

    </div>

    {/* Welcome Text */}
    <div className="min-w-0">

      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">
        Welcome back
      </p>

      <p className="mt-0.5 truncate font-['Instrument_Serif'] text-2xl text-[#222] sm:text-3xl">
        {admin?.username || "Admin"}
      </p>

      <div className="mt-1 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />

        <span className="text-[11px] text-[#999]">
          Administrator
        </span>
      </div>

    </div>

  </div>

</div>

</div> </header>

        <div className="mx-auto max-w-7xl space-y-7">


          <section className={sectionClass}>

            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
                  Collection Management
                </p>

                <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <div className="hidden h-px flex-1 bg-gradient-to-r from-[#D4AF37]/50 to-transparent sm:ml-8 sm:block" />
            </div>

            {/* Category Form */}

            <form
              onSubmit={handleCategorySubmit}
              className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
            >

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Category Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Watches"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Category Image
                </label>

                <label className="group flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#D5D0C6] bg-[#FAFAF8] px-4 py-3 text-sm text-[#888] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#FFFDF6] hover:text-[#A17B20]">

                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-[#B08D2C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
                      />
                    </svg>

                    <span>
                      Choose Image
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageChange}
                    required={!editingCategory}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={categoryUploading}
                  className={`${buttonGold} w-full lg:w-auto`}
                >
                  {categoryUploading
                    ? "Uploading..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>

            </form>

            {/* Category Preview */}

            {categoryPreview && (
              <div className="mt-6 rounded-2xl border border-[#E8E3D8] bg-[#FAFAF8] p-4">

                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Image Preview
                </p>

                <div className="flex items-center gap-4">

                  <div className="h-24 w-24 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-white p-1">
                    <img
                      src={categoryPreview}
                      alt="Category Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>

                  <div>
                    <p className="font-['Instrument_Serif'] text-xl text-[#333]">
                      {categoryName || "Category Preview"}
                    </p>

                    <p className="mt-1 text-xs text-[#999]">
                      Ready to use
                    </p>
                  </div>

                </div>
              </div>
            )}

            {editingCategory && (
              <button
                type="button"
                onClick={resetCategoryForm}
                className="mt-4 rounded-xl border border-[#DDD] px-5 py-2.5 text-sm text-[#777] transition hover:border-[#999] hover:text-[#222]"
              >
                Cancel Edit
              </button>
            )}

            {/* Categories List */}

            <div className="mt-9 border-t border-[#ECE8DF] pt-8">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                    Collection
                  </p>

                  <h3 className="mt-1 font-['Instrument_Serif'] text-2xl text-[#222]">
                    All Categories
                  </h3>
                </div>

                <span className="rounded-full border border-[#D4AF37]/30 bg-[#FFFDF4] px-3 py-1.5 text-xs font-semibold text-[#A17B20]">
                  {categories.length}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="group overflow-hidden rounded-2xl border border-[#E7E2D8] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
                  >

                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F3EF]">

                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-60" />

                      <div className="absolute left-2 top-2 rounded-full border border-white/40 bg-white/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-[#777] backdrop-blur">
                        Collection
                      </div>

                    </div>

                    <div className="p-3">

                      <p className="truncate font-['Instrument_Serif'] text-lg text-[#252525]">
                        {category.name}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <button
                          onClick={() =>
                            editCategory(category)
                          }
                          className="rounded-lg border border-[#D4AF37]/40 py-2 text-xs font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteCategory(category._id)
                          }
                          className="rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>

                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </section>

          {/* ================= PRODUCT ================= */}

          <section
  ref={productFormRef}
  className={sectionClass}
>


            <div
  ref={productFormRef}
  className="scroll-mt-6 mb-7"
>
  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
    Inventory Management
  </p>

  <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
    {editingProduct
      ? "Edit Product"
      : "Add Product"}
  </h2>

  <div className="mt-3 h-px w-12 bg-[#D4AF37]" />
</div>


            {/* Product Form */}

            <form
              onSubmit={handleProductSubmit}
              className="grid gap-4 md:grid-cols-2"
            >

              {/* Category */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Category
                </label>

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select Category
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
              </div>

              {/* Product Name */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Classic Watch"
                  value={productForm.name}
                  onChange={handleProductChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Stock */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  placeholder="0"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Buy Price */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Buy Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A17B20]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="buyPrice"
                    min="0"
                    placeholder="0"
                    value={productForm.buyPrice}
                    onChange={handleProductChange}
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Sell Price */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Selling Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A17B20]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="sellPrice"
                    min="0"
                    placeholder="0"
                    value={productForm.sellPrice}
                    onChange={handleProductChange}
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* All Position */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  All Products Position
                </label>

                <PositionSelect
                  name="allPosition"
                  value={productForm.allPosition}
                  onChange={handleProductChange}
                  options={getAllPositionOptions()}
                  placeholder="No Position"
                />

                <p className="mt-1.5 text-[11px] text-[#999]">
                  Select an available position.
                </p>
              </div>

              {/* Category Position */}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Category Position
                </label>

                <PositionSelect
                  name="categoryPosition"
                  value={productForm.categoryPosition}
                  onChange={handleProductChange}
                  options={getCategoryPositionOptions()}
                  placeholder={
                    productForm.category
                      ? "No Position"
                      : "Select Category First"
                  }
                />

                <p className="mt-1.5 text-[11px] text-[#999]">
                  Position is based on category.
                </p>
              </div>

              {/* Image */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                  Product Image
                </label>

                <label className="group flex min-h-[70px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#D5D0C6] bg-[#FAFAF8] px-5 py-4 transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#FFFDF6]">

                  <div className="flex items-center gap-3 text-sm text-[#888] group-hover:text-[#A17B20]">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E5] text-[#B08D2C]">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="font-semibold">
                        Choose Product Image
                      </p>

                      <p className="mt-0.5 text-xs text-[#AAA]">
                        JPG, PNG or WEBP · Max 5MB
                      </p>
                    </div>

                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageChange}
                    required={!editingProduct}
                    className="hidden"
                  />

                </label>
              </div>

              {/* Product Preview */}

              {productPreview && (
                <div className="md:col-span-2">

                  <div className="rounded-2xl border border-[#E8E3D8] bg-[#FAFAF8] p-4">

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#777]">
                      Product Preview
                    </p>

                    <div className="flex items-center gap-4">

                      <div className="h-28 w-28 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-white p-1">
                        <img
                          src={productPreview}
                          alt="Product Preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>

                      <div>
                        <p className="font-['Instrument_Serif'] text-xl text-[#333]">
                          {productForm.name ||
                            "Product Preview"}
                        </p>

                        <p className="mt-1 text-sm text-[#999]">
                          ₹{productForm.sellPrice || "0"}
                        </p>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* Submit */}

              <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">

                <button
                  type="submit"
                  disabled={productUploading}
                  className={buttonGold}
                >
                  {productUploading
                    ? "Uploading..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="rounded-xl border border-[#DDD] bg-white px-6 py-3 text-sm font-semibold text-[#777] transition hover:border-[#999] hover:text-[#222]"
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

            {/* ================= PRODUCT LIST ================= */}

            <div className="mt-10 border-t border-[#ECE8DF] pt-8">

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                    Inventory List
                  </p>

                  <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                    All Products
                  </h2>

                </div>

                <span className="w-fit rounded-full border border-[#D4AF37]/30 bg-[#FFFDF4] px-4 py-2 text-xs font-semibold text-[#A17B20]">
                  {products.length} Products
                </span>

              </div>

              {/* Filters */}

              <div className="mb-7 rounded-2xl border border-[#E7E2D8] bg-[#FAFAF8] p-4 sm:p-5">

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                      Product Filters
                    </p>

                    <h3 className="mt-1 font-['Instrument_Serif'] text-2xl text-[#222]">
                      Search & Filter
                    </h3>
                  </div>

                  {hasProductFilters && (
                    <button
                      type="button"
                      onClick={clearProductFilters}
                      className="w-fit rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      Clear Filters
                    </button>
                  )}

                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                      Search
                    </label>

                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                          strokeWidth="1.7"
                        />
                        <path
                          d="m20 20-4-4"
                          strokeWidth="1.7"
                        />
                      </svg>

                      <input
                        type="text"
                        placeholder="Product or category..."
                        value={productSearch}
                        onChange={(e) =>
                          setProductSearch(e.target.value)
                        }
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                      Category
                    </label>

                    <select
                      value={productCategory}
                      onChange={(e) =>
                        setProductCategory(e.target.value)
                      }
                      className={inputClass}
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
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                      Sort By Price
                    </label>

                    <select
                      value={productSort}
                      onChange={(e) =>
                        setProductSort(e.target.value)
                      }
                      className={inputClass}
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
                  </div>

                </div>

                {hasProductFilters && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {productSearch && (
                      <span className="rounded-full border border-[#DDD] bg-white px-3 py-1.5 text-xs text-[#777]">
                        Search: {productSearch}
                      </span>
                    )}

                    {productCategory && (
                      <span className="rounded-full border border-[#D4AF37]/30 bg-[#FFF9E8] px-3 py-1.5 text-xs text-[#A17B20]">
                        Category:{" "}
                        {
                          categories.find(
                            (category) =>
                              category._id ===
                              productCategory
                          )?.name
                        }
                      </span>
                    )}

                    {productSort && (
                      <span className="rounded-full border border-[#DDD] bg-white px-3 py-1.5 text-xs text-[#777]">
                        {productSort === "price_asc"
                          ? "Price: Low → High"
                          : "Price: High → Low"}
                      </span>
                    )}

                  </div>
                )}

              </div>

              {/* Empty */}

              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDD6CA] bg-[#FAFAF8] px-5 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E5] text-[#B08D2C]">

                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V6a2 2 0 0 0-2-2h-4l-2-2H6a2 2 0 0 0-2 2v7m16 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4"
                      />
                    </svg>

                  </div>

                  <p className="mt-4 font-['Instrument_Serif'] text-3xl text-[#555]">
                    No products found
                  </p>

                  <p className="mt-2 text-sm text-[#999]">
                    Try changing your search or filters.
                  </p>

                </div>
              ) : (

                /*
                  Mobile:
                  2 cards per row

                  Desktop:
                  4 cards per row
                */

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">

                  {products.map((product) => (

                    <div
                      key={product._id}
                      className="group overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.045)] transition-all duration-400 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.09)]"
                    >

                      {/* Image */}

                      <div className="relative aspect-square overflow-hidden bg-[#F5F4F0]">

                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        {/* Gradient */}

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

                        {/* Stock */}

                        <div className="absolute right-2 top-2 rounded-full border border-white/50 bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#555] shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                          Stock {product.stock}
                        </div>

                      </div>

                      {/* Details */}

                      <div className="p-3 sm:p-4">

                        <p className="truncate text-[8px] font-semibold uppercase tracking-[0.15em] text-[#999] sm:text-[10px] sm:tracking-[0.2em]">
                          {product.category?.name}
                        </p>

                        <h3 className="mt-1.5 truncate font-['Instrument_Serif'] text-lg text-[#222] sm:text-xl">
                          {product.name}
                        </h3>

                        {/* Prices */}

                        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">

                          <div className="rounded-lg bg-[#F7F7F5] p-2 sm:p-2.5">
                            <p className="text-[8px] uppercase tracking-wider text-[#999] sm:text-[10px]">
                              Buy
                            </p>

                            <p className="mt-0.5 truncate text-xs font-semibold text-[#777] sm:text-sm">
                              ₹{product.buyPrice}
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#FFF9E8] p-2 sm:p-2.5">
                            <p className="text-[8px] uppercase tracking-wider text-[#A17B20] sm:text-[10px]">
                              Sell
                            </p>

                            <p className="mt-0.5 truncate text-xs font-semibold text-[#A17B20] sm:text-sm">
                              ₹{product.sellPrice}
                            </p>
                          </div>

                        </div>

                        {/* Stock Controls */}

                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] p-1.5">

                          <button
                            onClick={() =>
                              updateStock(
                                product._id,
                                "decrease"
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-lg text-red-400 transition hover:bg-red-500 hover:text-white sm:h-9 sm:w-9"
                          >
                            −
                          </button>

                          <div className="text-center">

                            <p className="text-[7px] uppercase tracking-widest text-[#AAA] sm:text-[8px]">
                              Stock
                            </p>

                            <span className="font-['Instrument_Serif'] text-lg text-[#333] sm:text-xl">
                              {product.stock}
                            </span>

                          </div>

                          <button
                            onClick={() =>
                              updateStock(
                                product._id,
                                "increase"
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37]/40 text-lg text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white sm:h-9 sm:w-9"
                          >
                            +
                          </button>

                        </div>

                        {/* Actions */}

                        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">

                          <button
                            onClick={() =>
                              editProduct(product)
                            }
                            className="rounded-lg border border-[#D4AF37]/40 py-2 text-[10px] font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white sm:text-xs"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteProduct(product._id)
                            }
                            className="rounded-lg border border-red-200 py-2 text-[10px] font-semibold text-red-400 transition hover:bg-red-500 hover:text-white sm:text-xs"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
