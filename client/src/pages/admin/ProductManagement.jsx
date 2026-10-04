import api from "../../services/api";
import { useEffect, useRef, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";

function ProductManagement() {
  // =====================================================
  // Categories
  // =====================================================

  const [categories, setCategories] = useState([]);

  // =====================================================
  // Products
  // =====================================================

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =====================================================
  // Product Form Visibility
  // =====================================================

  const [showProductForm, setShowProductForm] = useState(false);

  // =====================================================
  // Product Form
  // =====================================================

  const getInitialProductForm = () => ({
    category: "",

    name: "",
    brand: "",
    sku: "",

    shortDescription: "",
    description: "",

    stock: 0,
    buyPrice: "",
    sellPrice: "",
    mrp: "",

    image: "",
    images: [],

    metal: "",
    purity: "",
    metalColor: "",

    grossWeight: "",
    netWeight: "",

    stoneType: "",
    stoneWeight: "",
    stoneColor: "",
    stoneClarity: "",

    sizes: [],

    dimensions: {
      length: "",
      width: "",
      height: "",
    },

    gender: "Unisex",
    occasion: "",
    certification: "",
    warranty: "",
    careInstructions: "",

    allPosition: "",
    categoryPosition: "",
  });

  const [productForm, setProductForm] = useState(
    getInitialProductForm()
  );

  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [productUploading, setProductUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const productFormRef = useRef(null);

  // =====================================================
  // Product Filters
  // =====================================================

  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSort, setProductSort] = useState("");
  const [productGender, setProductGender] = useState("");
  const [productMetal, setProductMetal] = useState("");

  // =====================================================
  // Pagination
  // =====================================================

  const [productPage, setProductPage] = useState(1);
  const PRODUCT_LIMIT = 24;

  // =====================================================
  // Loading
  // =====================================================

  const [productsLoading, setProductsLoading] = useState(false);

  // =====================================================
  // Initial Categories
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // Fetch Products
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, [
    productSearch,
    productCategory,
    productSort,
    productGender,
    productMetal,
    productPage,
  ]);

  // =====================================================
  // Categories
  // =====================================================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    }
  };

  // =====================================================
  // Products
  // =====================================================

  const fetchProducts = async () => {
    setProductsLoading(true);

    try {
      const params = {
        page: productPage,
        limit: PRODUCT_LIMIT,
      };

      if (productSearch.trim()) {
        params.search = productSearch.trim();
      }

      if (productCategory) {
        params.category = productCategory;
      }

      if (productSort) {
        params.sort = productSort;
      }

      if (productGender) {
        params.gender = productGender;
      }

      if (productMetal.trim()) {
        params.metal = productMetal.trim();
      }

      const response = await api.get("/products", {
        params,
      });

      setProducts(response.data?.products || []);

      setPagination(
        response.data?.pagination || {
          page: productPage,
          limit: PRODUCT_LIMIT,
          total: response.data?.products?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: productPage > 1,
        }
      );
    } catch (error) {
      console.error("Failed to fetch products:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // =====================================================
  // Total Stock
  // =====================================================

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  // =====================================================
  // Product Change
  // =====================================================

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // Dimension Change
  // =====================================================

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value,
      },
    }));
  };

  // =====================================================
  // Sizes
  // =====================================================

  const [sizeInput, setSizeInput] = useState("");

  const addSize = () => {
    const size = sizeInput.trim();

    if (!size) return;

    if (productForm.sizes.includes(size)) {
      setSizeInput("");
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
    }));

    setSizeInput("");
  };

  const removeSize = (sizeToRemove) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter(
        (size) => size !== sizeToRemove
      ),
    }));
  };

  const handleSizeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSize();
    }
  };

  // =====================================================
  // Product Image
  // =====================================================

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    if (productPreview) {
      URL.revokeObjectURL(productPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setProductFile(file);
    setProductPreview(previewUrl);
  };

  // =====================================================
  // Upload Product Image
  // =====================================================

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

      return response.data?.imageUrl || "";
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

  // =====================================================
  // Number Helper
  // =====================================================

  const optionalNumber = (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  };

  // =====================================================
  // Product Submit
  // =====================================================

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrl = await uploadProductImage();

      if (!imageUrl) {
        alert("Please upload product image");
        return;
      }

      const data = {
        category: productForm.category,

        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        sku: productForm.sku.trim(),

        shortDescription:
          productForm.shortDescription.trim(),

        description:
          productForm.description.trim(),

        stock: Number(productForm.stock),
        buyPrice: Number(productForm.buyPrice),
        sellPrice: Number(productForm.sellPrice),

        mrp: optionalNumber(productForm.mrp),

        image: imageUrl,

        images: productForm.images || [],

        metal: productForm.metal.trim(),
        purity: productForm.purity.trim(),
        metalColor:
          productForm.metalColor.trim(),

        grossWeight: optionalNumber(
          productForm.grossWeight
        ),

        netWeight: optionalNumber(
          productForm.netWeight
        ),

        stoneType:
          productForm.stoneType.trim(),

        stoneWeight: optionalNumber(
          productForm.stoneWeight
        ),

        stoneColor:
          productForm.stoneColor.trim(),

        stoneClarity:
          productForm.stoneClarity.trim(),

        sizes: productForm.sizes || [],

        dimensions: {
          length: optionalNumber(
            productForm.dimensions.length
          ),
          width: optionalNumber(
            productForm.dimensions.width
          ),
          height: optionalNumber(
            productForm.dimensions.height
          ),
        },

        gender: productForm.gender || "Unisex",

        occasion:
          productForm.occasion.trim(),

        certification:
          productForm.certification.trim(),

        warranty:
          productForm.warranty.trim(),

        careInstructions:
          productForm.careInstructions.trim(),

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

      await fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Product operation failed"
      );
    }
  };

  // =====================================================
  // Open Add Product Form
  // =====================================================

  const openAddProductForm = () => {
    resetProductForm(false);

    setShowProductForm(true);

    setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // =====================================================
  // Edit Product
  // =====================================================

  const editProduct = (product) => {
    setEditingProduct(product);

    setShowProductForm(true);

    setProductForm({
      category: product.category?._id || "",

      name: product.name || "",
      brand: product.brand || "",
      sku: product.sku || "",

      shortDescription:
        product.shortDescription || "",

      description:
        product.description || "",

      stock: product.stock ?? 0,

      buyPrice: product.buyPrice ?? "",
      sellPrice: product.sellPrice ?? "",
      mrp: product.mrp ?? "",

      image: product.image || "",
      images: product.images || [],

      metal: product.metal || "",
      purity: product.purity || "",
      metalColor: product.metalColor || "",

      grossWeight:
        product.grossWeight ?? "",

      netWeight:
        product.netWeight ?? "",

      stoneType:
        product.stoneType || "",

      stoneWeight:
        product.stoneWeight ?? "",

      stoneColor:
        product.stoneColor || "",

      stoneClarity:
        product.stoneClarity || "",

      sizes: product.sizes || [],

      dimensions: {
        length:
          product.dimensions?.length ?? "",
        width:
          product.dimensions?.width ?? "",
        height:
          product.dimensions?.height ?? "",
      },

      gender: product.gender || "Unisex",

      occasion:
        product.occasion || "",

      certification:
        product.certification || "",

      warranty:
        product.warranty || "",

      careInstructions:
        product.careInstructions || "",

      allPosition:
        product.allPosition ?? "",

      categoryPosition:
        product.categoryPosition ?? "",
    });

    setSizeInput("");

    setProductPreview(product.image || "");
    setProductFile(null);

    setTimeout(() => {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // =====================================================
  // Reset / Close Product Form
  // =====================================================

  const resetProductForm = (
    closeForm = true
  ) => {
    setEditingProduct(null);

    setProductForm(
      getInitialProductForm()
    );

    setSizeInput("");
    setProductFile(null);

    if (
      productPreview &&
      productPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(productPreview);
    }

    setProductPreview("");

    if (closeForm) {
      setShowProductForm(false);
    }
  };

  // =====================================================
  // Delete Product
  // =====================================================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);

      await fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // =====================================================
  // Stock
  // =====================================================

  const updateStock = async (id, action) => {
    // Optimistic update
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product._id !== id) return product;

        const currentStock = Number(
          product.stock || 0
        );

        const newStock =
          action === "increase"
            ? currentStock + 1
            : Math.max(
                0,
                currentStock - 1
              );

        return {
          ...product,
          stock: newStock,
        };
      })
    );

    try {
      const response = await api.patch(
        `/products/${id}/stock`,
        {
          action,
        }
      );

      // Backend authoritative response
      if (response.data?.product) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === id
              ? response.data.product
              : product
          )
        );
      }
    } catch (error) {
      await fetchProducts();

      alert(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    }
  };

  // =====================================================
  // Position Options
  // =====================================================
  //
  // Backend already validates position.
  // We generate reasonable UI options.
  //

  const getAllPositionOptions = () => {
    const total =
      pagination.total || products.length;

    const currentPosition =
      Number(
        editingProduct?.allPosition || 0
      );

    const maxPosition = editingProduct
      ? Math.max(total, currentPosition)
      : total + 1;

    return Array.from(
      { length: Math.max(1, maxPosition) },
      (_, index) => index + 1
    );
  };

  const getCategoryPositionOptions = () => {
    const selectedCategory =
      productForm.category;

    if (!selectedCategory) {
      return [];
    }

    const categoryProducts =
      products.filter(
        (product) =>
          product.category?._id ===
          selectedCategory
      );

    const currentPosition =
      Number(
        editingProduct?.categoryPosition ||
          0
      );

    const maxPosition = Math.max(
      categoryProducts.length +
        (editingProduct?.category?._id ===
        selectedCategory
          ? 0
          : 1),
      currentPosition,
      1
    );

    return Array.from(
      { length: maxPosition },
      (_, index) => index + 1
    );
  };

  // =====================================================
  // Position Select
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
          <option value="">
            {placeholder}
          </option>

          {options.map((position) => (
            <option
              key={position}
              value={position}
            >
              Position {position}
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

  // =====================================================
  // Filters
  // =====================================================

  const clearProductFilters = () => {
    setProductSearch("");
    setProductCategory("");
    setProductSort("");
    setProductGender("");
    setProductMetal("");
    setProductPage(1);
  };

  const handleSearchChange = (e) => {
    setProductSearch(e.target.value);
    setProductPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setProductCategory(e.target.value);
    setProductPage(1);
  };

  const handleSortChange = (e) => {
    setProductSort(e.target.value);
    setProductPage(1);
  };

  const handleGenderFilterChange = (e) => {
    setProductGender(e.target.value);
    setProductPage(1);
  };

  const handleMetalFilterChange = (e) => {
    setProductMetal(e.target.value);
    setProductPage(1);
  };

  const hasProductFilters =
    productSearch ||
    productCategory ||
    productSort ||
    productGender ||
    productMetal;

  // =====================================================
  // Classes
  // =====================================================

  const inputClass =
    "w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3 text-[15px] text-[#222] outline-none transition-all duration-300 placeholder:text-[#A5A5A5] hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10";

  const buttonGold =
    "relative overflow-hidden rounded-xl bg-gradient-to-r from-[#B88A16] via-[#D4AF37] to-[#B88A16] px-6 py-3 font-semibold text-white shadow-[0_8px_25px_rgba(184,138,22,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(184,138,22,0.30)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  const sectionClass =
    "rounded-[28px] border border-[#E7E2D8] bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.06)] sm:p-7 lg:p-8";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-3 py-5 text-[#222] sm:px-6 sm:py-8 lg:px-8">
      <AdminNavbar />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-[100px]" />

        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#C0C0C0]/10 blur-[110px]" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className={sectionClass}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
                  Inventory Management
                </p>

                <h1 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                  Product Management
                </h1>

                <div className="mt-3 h-px w-12 bg-[#D4AF37]" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                {/* Product Count */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/30 bg-[#FFFDF4] px-4 py-3 sm:min-w-[140px]">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#999]">
                      Products
                    </p>

                    <p className="mt-0.5 font-['Instrument_Serif'] text-2xl text-[#A17B20]">
                      {pagination.total}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3C9] text-[#B08D2C]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 13V6a2 2 0 0 0-2-2h-4l-2-2H6a2 2 0 0 0-2 2v7m16 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Total Stock */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E0DDD5] bg-[#FAFAF8] px-4 py-3 sm:min-w-[140px]">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#999]">
                      Page Stock
                    </p>

                    <p className="mt-0.5 font-['Instrument_Serif'] text-2xl text-[#333]">
                      {totalStock}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEEEEA] text-[#777]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v18m9-9H3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Add Product */}
                <button
                  type="button"
                  onClick={
                    showProductForm
                      ? () => resetProductForm()
                      : openAddProductForm
                  }
                  className={`${buttonGold} whitespace-nowrap`}
                >
                  {showProductForm ? (
                    <>
                      <span className="mr-2">
                        ×
                      </span>
                      Close Form
                    </>
                  ) : (
                    <>
                      <span className="mr-2">
                        +
                      </span>
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* =====================================================
              PRODUCT FORM
          ===================================================== */}

          {showProductForm && (
            <section
              ref={productFormRef}
              className={`${sectionClass} scroll-mt-5`}
            >
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
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

                <button
                  type="button"
                  onClick={() => resetProductForm()}
                  className="w-fit rounded-xl border border-[#DDD] bg-white px-4 py-2 text-sm font-semibold text-[#777] transition hover:border-[#999] hover:text-[#222]"
                >
                  Cancel
                </button>
              </div>

              <form
                onSubmit={handleProductSubmit}
                className="grid gap-5 md:grid-cols-2"
              >
                {/* Category */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Category *
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

                    {categories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Product Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Classic Gold Ring"
                    value={productForm.name}
                    onChange={handleProductChange}
                    required
                    maxLength={150}
                    className={inputClass}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    placeholder="e.g. Royal Jewels"
                    value={productForm.brand}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    SKU
                  </label>

                  <input
                    type="text"
                    name="sku"
                    placeholder="e.g. RJ-RING-001"
                    value={productForm.sku}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Stock *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    required
                    className={inputClass}
                  />
                </div>

                {/* Buy Price */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Buy Price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A17B20]">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="buyPrice"
                      min="0"
                      step="0.01"
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
                    Selling Price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A17B20]">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="sellPrice"
                      min="0"
                      step="0.01"
                      value={productForm.sellPrice}
                      onChange={handleProductChange}
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                {/* MRP */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    MRP
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A17B20]">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="mrp"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      value={productForm.mrp}
                      onChange={handleProductChange}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={productForm.gender}
                    onChange={handleProductChange}
                    className={inputClass}
                  >
                    <option value="Unisex">
                      Unisex
                    </option>

                    <option value="Men">
                      Men
                    </option>

                    <option value="Women">
                      Women
                    </option>
                  </select>
                </div>

                {/* Metal */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Metal
                  </label>

                  <input
                    type="text"
                    name="metal"
                    placeholder="e.g. Gold"
                    value={productForm.metal}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Purity */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Purity
                  </label>

                  <input
                    type="text"
                    name="purity"
                    placeholder="e.g. 22K / 18K / 925"
                    value={productForm.purity}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Metal Color */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Metal Color
                  </label>

                  <input
                    type="text"
                    name="metalColor"
                    placeholder="e.g. Yellow Gold"
                    value={productForm.metalColor}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Gross Weight */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Gross Weight
                  </label>

                  <input
                    type="number"
                    name="grossWeight"
                    min="0"
                    step="0.001"
                    placeholder="e.g. 5.25"
                    value={productForm.grossWeight}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Net Weight */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Net Weight
                  </label>

                  <input
                    type="number"
                    name="netWeight"
                    min="0"
                    step="0.001"
                    placeholder="e.g. 4.85"
                    value={productForm.netWeight}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Stone Type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Stone Type
                  </label>

                  <input
                    type="text"
                    name="stoneType"
                    placeholder="e.g. Diamond"
                    value={productForm.stoneType}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Stone Weight */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Stone Weight
                  </label>

                  <input
                    type="number"
                    name="stoneWeight"
                    min="0"
                    step="0.001"
                    placeholder="Optional"
                    value={productForm.stoneWeight}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Stone Color */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Stone Color
                  </label>

                  <input
                    type="text"
                    name="stoneColor"
                    placeholder="e.g. D"
                    value={productForm.stoneColor}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Stone Clarity */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Stone Clarity
                  </label>

                  <input
                    type="text"
                    name="stoneClarity"
                    placeholder="e.g. VS1"
                    value={productForm.stoneClarity}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Occasion */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Occasion
                  </label>

                  <input
                    type="text"
                    name="occasion"
                    placeholder="e.g. Wedding"
                    value={productForm.occasion}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Certification */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Certification
                  </label>

                  <input
                    type="text"
                    name="certification"
                    placeholder="e.g. BIS / IGI"
                    value={productForm.certification}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Warranty
                  </label>

                  <input
                    type="text"
                    name="warranty"
                    placeholder="e.g. 1 Year"
                    value={productForm.warranty}
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* All Position */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    All Products Position
                  </label>

                  <PositionSelect
                    name="allPosition"
                    value={
                      productForm.allPosition
                    }
                    onChange={handleProductChange}
                    options={getAllPositionOptions()}
                    placeholder="Auto Position"
                  />

                  <p className="mt-1.5 text-[11px] text-[#999]">
                    Backend will validate availability.
                  </p>
                </div>

                {/* Category Position */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Category Position
                  </label>

                  <PositionSelect
                    name="categoryPosition"
                    value={
                      productForm.categoryPosition
                    }
                    onChange={handleProductChange}
                    options={getCategoryPositionOptions()}
                    placeholder={
                      productForm.category
                        ? "Auto Position"
                        : "Select Category First"
                    }
                  />

                  <p className="mt-1.5 text-[11px] text-[#999]">
                    Backend will validate category position.
                  </p>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Short Description
                  </label>

                  <input
                    type="text"
                    name="shortDescription"
                    placeholder="Short product summary..."
                    value={
                      productForm.shortDescription
                    }
                    onChange={handleProductChange}
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Detailed product description..."
                    value={
                      productForm.description
                    }
                    onChange={handleProductChange}
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {/* Care Instructions */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Care Instructions
                  </label>

                  <textarea
                    name="careInstructions"
                    rows="3"
                    placeholder="How should the product be maintained?"
                    value={
                      productForm.careInstructions
                    }
                    onChange={handleProductChange}
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {/* Dimensions */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Dimensions
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <input
                      type="number"
                      name="length"
                      min="0"
                      step="0.001"
                      placeholder="Length"
                      value={
                        productForm.dimensions
                          .length
                      }
                      onChange={
                        handleDimensionChange
                      }
                      className={inputClass}
                    />

                    <input
                      type="number"
                      name="width"
                      min="0"
                      step="0.001"
                      placeholder="Width"
                      value={
                        productForm.dimensions
                          .width
                      }
                      onChange={
                        handleDimensionChange
                      }
                      className={inputClass}
                    />

                    <input
                      type="number"
                      name="height"
                      min="0"
                      step="0.001"
                      placeholder="Height"
                      value={
                        productForm.dimensions
                          .height
                      }
                      onChange={
                        handleDimensionChange
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Sizes
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 18, 20, 22"
                      value={sizeInput}
                      onChange={(e) =>
                        setSizeInput(
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleSizeKeyDown
                      }
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={addSize}
                      className="rounded-xl border border-[#D4AF37]/40 bg-[#FFF9E8] px-5 font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white"
                    >
                      Add
                    </button>
                  </div>

                  {productForm.sizes.length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {productForm.sizes.map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              removeSize(
                                size
                              )
                            }
                            className="rounded-full border border-[#D4AF37]/30 bg-[#FFF9E8] px-3 py-1.5 text-xs font-semibold text-[#A17B20]"
                          >
                            {size} ×
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Product Image *
                  </label>

                  <label className="group flex min-h-[90px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#D5D0C6] bg-[#FAFAF8] px-5 py-4 transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#FFFDF6]">
                    <div className="flex items-center gap-3 text-sm text-[#888] group-hover:text-[#A17B20]">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8E5] text-[#B08D2C]">
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
                      onChange={
                        handleProductImageChange
                      }
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

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-white p-1">
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
                            ₹
                            {productForm.sellPrice ||
                              "0"}
                          </p>

                          {productForm.sku && (
                            <p className="mt-1 text-xs text-[#999]">
                              SKU:{" "}
                              {productForm.sku}
                            </p>
                          )}
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

                  <button
                    type="button"
                    onClick={() =>
                      resetProductForm()
                    }
                    className="rounded-xl border border-[#DDD] bg-white px-6 py-3 text-sm font-semibold text-[#777] transition hover:border-[#999] hover:text-[#222]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* =====================================================
              PRODUCT LIST
          ===================================================== */}

          <section className={sectionClass}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                  Inventory List
                </p>

                <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                  All Products
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#D4AF37]/30 bg-[#FFFDF4] px-4 py-2 text-xs font-semibold text-[#A17B20]">
                  {pagination.total} Products
                </span>

                <span className="rounded-full border border-[#DDD] bg-[#FAFAF8] px-4 py-2 text-xs font-semibold text-[#666]">
                  Page Stock: {totalStock}
                </span>
              </div>
            </div>

            {/* =====================================================
                FILTERS
            ===================================================== */}

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
                    onClick={
                      clearProductFilters
                    }
                    className="w-fit rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Search */}
                <div className="lg:col-span-2">
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
                      placeholder="Product, brand, SKU or category..."
                      value={productSearch}
                      onChange={
                        handleSearchChange
                      }
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Category
                  </label>

                  <select
                    value={productCategory}
                    onChange={
                      handleCategoryFilterChange
                    }
                    className={inputClass}
                  >
                    <option value="">
                      All Categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Gender
                  </label>

                  <select
                    value={productGender}
                    onChange={
                      handleGenderFilterChange
                    }
                    className={inputClass}
                  >
                    <option value="">
                      All Gender
                    </option>

                    <option value="Men">
                      Men
                    </option>

                    <option value="Women">
                      Women
                    </option>

                    <option value="Unisex">
                      Unisex
                    </option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Sort
                  </label>

                  <select
                    value={productSort}
                    onChange={
                      handleSortChange
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

                    <option value="newest">
                      Newest
                    </option>

                    <option value="name_asc">
                      Name A-Z
                    </option>
                  </select>
                </div>

                {/* Metal */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Metal
                  </label>

                  <input
                    type="text"
                    placeholder="Gold / Silver..."
                    value={productMetal}
                    onChange={
                      handleMetalFilterChange
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Active Filters */}
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

                  {productGender && (
                    <span className="rounded-full border border-[#DDD] bg-white px-3 py-1.5 text-xs text-[#777]">
                      Gender: {productGender}
                    </span>
                  )}

                  {productMetal && (
                    <span className="rounded-full border border-[#DDD] bg-white px-3 py-1.5 text-xs text-[#777]">
                      Metal: {productMetal}
                    </span>
                  )}

                  {productSort && (
                    <span className="rounded-full border border-[#DDD] bg-white px-3 py-1.5 text-xs text-[#777]">
                      Sort:{" "}
                      {productSort ===
                      "price_asc"
                        ? "Low → High"
                        : productSort ===
                          "price_desc"
                        ? "High → Low"
                        : productSort ===
                          "newest"
                        ? "Newest"
                        : "Name A-Z"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {productsLoading ? (
              <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAFAF8] px-5 py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#E5E0D6] border-t-[#D4AF37]" />

                <p className="mt-4 text-sm text-[#999]">
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              /* =====================================================
                 EMPTY
              ===================================================== */
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

                <button
                  type="button"
                  onClick={openAddProductForm}
                  className={`${buttonGold} mt-6`}
                >
                  + Add Product
                </button>
              </div>
            ) : (
              <>
                {/* =====================================================
                    PRODUCT GRID
                ===================================================== */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map(
                    (product) => (
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
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

                          <div className="absolute right-2 top-2 rounded-full border border-white/50 bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#555] shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                            Stock {product.stock}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3 sm:p-4">
                          <p className="truncate text-[8px] font-semibold uppercase tracking-[0.15em] text-[#999] sm:text-[10px] sm:tracking-[0.2em]">
                            {product.category?.name ||
                              "Uncategorized"}
                          </p>

                          <h3 className="mt-1.5 truncate font-['Instrument_Serif'] text-lg text-[#222] sm:text-xl">
                            {product.name}
                          </h3>

                          {product.brand && (
                            <p className="mt-1 truncate text-xs text-[#999]">
                              {product.brand}
                            </p>
                          )}

                          {/* Prices */}
                          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
                            <div className="rounded-lg bg-[#F7F7F5] p-2 sm:p-2.5">
                              <p className="text-[8px] uppercase tracking-wider text-[#999] sm:text-[10px]">
                                Buy
                              </p>

                              <p className="mt-0.5 truncate text-xs font-semibold text-[#777] sm:text-sm">
                                ₹
                                {
                                  product.buyPrice
                                }
                              </p>
                            </div>

                            <div className="rounded-lg bg-[#FFF9E8] p-2 sm:p-2.5">
                              <p className="text-[8px] uppercase tracking-wider text-[#A17B20] sm:text-[10px]">
                                Sell
                              </p>

                              <p className="mt-0.5 truncate text-xs font-semibold text-[#A17B20] sm:text-sm">
                                ₹
                                {
                                  product.sellPrice
                                }
                              </p>
                            </div>
                          </div>

                          {/* Extra info */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {product.gender && (
                              <span className="rounded-full bg-[#F7F7F5] px-2 py-1 text-[9px] text-[#777]">
                                {
                                  product.gender
                                }
                              </span>
                            )}

                            {product.metal && (
                              <span className="rounded-full bg-[#FFF9E8] px-2 py-1 text-[9px] text-[#A17B20]">
                                {product.metal}
                              </span>
                            )}

                            {product.purity && (
                              <span className="rounded-full bg-[#F7F7F5] px-2 py-1 text-[9px] text-[#777]">
                                {
                                  product.purity
                                }
                              </span>
                            )}
                          </div>

                          {/* Stock Controls */}
                          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] p-1.5">
                            <button
                              type="button"
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
                                {
                                  product.stock
                                }
                              </span>
                            </div>

                            <button
                              type="button"
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
                              type="button"
                              onClick={() =>
                                editProduct(
                                  product
                                )
                              }
                              className="rounded-lg border border-[#D4AF37]/40 py-2 text-[10px] font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white sm:text-xs"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteProduct(
                                  product._id
                                )
                              }
                              className="rounded-lg border border-red-200 py-2 text-[10px] font-semibold text-red-400 transition hover:bg-red-500 hover:text-white sm:text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E7E2D8] bg-[#FAFAF8] p-4 sm:flex-row">
                    <p className="text-xs text-[#888]">
                      Page{" "}
                      <span className="font-semibold text-[#555]">
                        {pagination.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#555]">
                        {
                          pagination.totalPages
                        }
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          !pagination.hasPreviousPage ||
                          productsLoading
                        }
                        onClick={() =>
                          setProductPage(
                            (prev) =>
                              Math.max(
                                1,
                                prev - 1
                              )
                          )
                        }
                        className="rounded-xl border border-[#DDD] bg-white px-4 py-2 text-xs font-semibold text-[#666] transition hover:border-[#D4AF37] hover:text-[#A17B20] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ← Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          !pagination.hasNextPage ||
                          productsLoading
                        }
                        onClick={() =>
                          setProductPage(
                            (prev) =>
                              prev + 1
                          )
                        }
                        className="rounded-xl border border-[#D4AF37]/40 bg-[#FFF9E8] px-4 py-2 text-xs font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;
