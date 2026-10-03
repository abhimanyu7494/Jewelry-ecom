import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import AdminNavbar from "../../components/AdminNavbar";

function CollectionManagement() {
  const [categories, setCategories] = useState([]);

  // =========================
  // Category States
  // =========================

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryPreview, setCategoryPreview] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);
  const [categoryUploading, setCategoryUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form is hidden by default
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const categoryFormRef = useRef(null);

  // =========================
  // Fetch Categories
  // =========================

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // =========================
  // Open Add Form
  // =========================

  const openAddCategoryForm = () => {
    resetCategoryForm();

    setShowCategoryForm(true);

    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // =========================
  // Image Change
  // =========================

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

    const previewUrl = URL.createObjectURL(file);
    setCategoryPreview(previewUrl);
  };

  // =========================
  // Upload Image
  // =========================

  const uploadCategoryImage = async () => {
    if (!categoryFile) {
      return categoryImage;
    }

    const formData = new FormData();
    formData.append("image", categoryFile);

    setCategoryUploading(true);

    try {
      const response = await api.post(
        "/upload/image",
        formData
      );

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

  // =========================
  // Submit Category
  // =========================

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      const imageUrl = await uploadCategoryImage();

      if (!imageUrl) {
        alert("Please upload category image");
        return;
      }

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory._id}`,
          {
            name: categoryName.trim(),
            image: imageUrl,
          }
        );
      } else {
        await api.post("/categories", {
          name: categoryName.trim(),
          image: imageUrl,
        });
      }

      await fetchCategories();

      resetCategoryForm();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Category operation failed"
      );
    }
  };

  // =========================
  // Edit Category
  // =========================

  const editCategory = (category) => {
    setEditingCategory(category);

    setCategoryName(category.name || "");
    setCategoryImage(category.image || "");
    setCategoryPreview(category.image || "");
    setCategoryFile(null);

    // Open form automatically
    setShowCategoryForm(true);

    // Scroll to form
    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // =========================
  // Reset / Close Form
  // =========================

  const resetCategoryForm = () => {
    setEditingCategory(null);

    setCategoryName("");
    setCategoryImage("");
    setCategoryPreview("");
    setCategoryFile(null);

    setShowCategoryForm(false);
  };

  // =========================
  // Delete Category
  // =========================

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "This will permanently delete this category and all products inside it. Are you sure?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${id}`);

      await fetchCategories();

      // If deleted category was being edited,
      // close the form.
      if (editingCategory?._id === id) {
        resetCategoryForm();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  // =========================
  // Classes
  // =========================

  const inputClass =
    "w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3 text-[15px] text-[#222] outline-none transition-all duration-300 placeholder:text-[#A5A5A5] hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10";

  const buttonGold =
    "relative overflow-hidden rounded-xl bg-gradient-to-r from-[#B88A16] via-[#D4AF37] to-[#B88A16] px-6 py-3 font-semibold text-white shadow-[0_8px_25px_rgba(184,138,22,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(184,138,22,0.30)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  const sectionClass =
    "rounded-[28px] border border-[#E7E2D8] bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.06)] sm:p-7 lg:p-8";

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
        <div className="mx-auto max-w-7xl space-y-7">

          {/* =========================
              HEADER
          ========================= */}

          <section className={sectionClass}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
                  Admin
                </p>

                <h1 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                  Collection Management
                </h1>

                <div className="mt-3 h-px w-12 bg-[#D4AF37]" />
              </div>

              {/* Add Category Button */}

              <button
                type="button"
                onClick={openAddCategoryForm}
                className={`${buttonGold} w-full sm:w-auto`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>

                  Add Category
                </span>
              </button>

            </div>
          </section>

          {/* =========================
              CATEGORY FORM
              HIDDEN BY DEFAULT
          ========================= */}

          {showCategoryForm && (
            <section
              ref={categoryFormRef}
              className={sectionClass}
            >

              {/* Form Header */}

              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A17B20]">
                    Collection Management
                  </p>

                  <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>

                  <div className="mt-3 h-px w-12 bg-[#D4AF37]" />
                </div>

                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="w-fit rounded-xl border border-[#DDD] bg-white px-4 py-2 text-sm font-semibold text-[#777] transition hover:border-[#999] hover:text-[#222]"
                >
                  Close
                </button>

              </div>

              {/* =========================
                  FORM
              ========================= */}

              <form
                onSubmit={handleCategorySubmit}
                className="grid gap-5 lg:grid-cols-2"
              >

                {/* Category Name */}

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

                {/* Category Image */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#777]">
                    Category Image
                  </label>

                  <label className="group flex min-h-[50px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#D5D0C6] bg-[#FAFAF8] px-4 py-3 text-sm text-[#888] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#FFFDF6] hover:text-[#A17B20]">

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

                      <div>
                        <span className="font-medium">
                          Choose Image
                        </span>

                        <p className="text-[11px] text-[#AAA]">
                          JPG, PNG or WEBP · Max 5MB
                        </p>
                      </div>
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

                {/* Preview */}

                {categoryPreview && (
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-[#E8E3D8] bg-[#FAFAF8] p-4">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#777]">
                        Image Preview
                      </p>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-white p-1">

                          <img
                            src={categoryPreview}
                            alt="Category Preview"
                            className="h-full w-full rounded-lg object-cover"
                          />

                        </div>

                        <div>
                          <p className="font-['Instrument_Serif'] text-2xl text-[#333]">
                            {categoryName ||
                              "Category Preview"}
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            {editingCategory
                              ? "Current category image"
                              : "Ready to use"}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row lg:col-span-2">

                  <button
                    type="submit"
                    disabled={categoryUploading}
                    className={`${buttonGold} w-full sm:w-auto`}
                  >
                    {categoryUploading
                      ? "Uploading..."
                      : editingCategory
                      ? "Update Category"
                      : "Add Category"}
                  </button>

                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="w-full rounded-xl border border-[#DDD] bg-white px-6 py-3 text-sm font-semibold text-[#777] transition hover:border-[#999] hover:text-[#222] sm:w-auto"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </section>
          )}

          {/* =========================
              CATEGORIES LIST
          ========================= */}

          <section className={sectionClass}>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                  Collection
                </p>

                <h2 className="mt-1 font-['Instrument_Serif'] text-3xl text-[#222] sm:text-4xl">
                  All Categories
                </h2>

                <div className="mt-3 h-px w-12 bg-[#D4AF37]" />
              </div>

              <span className="w-fit rounded-full border border-[#D4AF37]/30 bg-[#FFFDF4] px-4 py-2 text-xs font-semibold text-[#A17B20]">
                {categories.length} Categories
              </span>

            </div>

            {/* =========================
                EMPTY STATE
            ========================= */}

            {categories.length === 0 ? (
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
                      d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
                    />

                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 14l2.5-3 2 2.5L15 10l3 4"
                    />
                  </svg>

                </div>

                <p className="mt-4 font-['Instrument_Serif'] text-3xl text-[#555]">
                  No categories found
                </p>

                <p className="mt-2 text-sm text-[#999]">
                  Create your first collection to get started.
                </p>

                <button
                  type="button"
                  onClick={openAddCategoryForm}
                  className={`${buttonGold} mt-5`}
                >
                  Add Category
                </button>

              </div>
            ) : (

              /* =========================
                  CATEGORY GRID
              ========================= */

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

                {categories.map((category) => (

                  <div
                    key={category._id}
                    className={`group overflow-hidden rounded-2xl border bg-white shadow-[0_5px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] ${
                      editingCategory?._id === category._id
                        ? "border-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                        : "border-[#E7E2D8] hover:border-[#D4AF37]/60"
                    }`}
                  >

                    {/* Image */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F3EF]">

                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-60" />

                      <div className="absolute left-2 top-2 rounded-full border border-white/40 bg-white/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-[#777] backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-[9px]">
                        Collection
                      </div>

                    </div>

                    {/* Details */}

                    <div className="p-3 sm:p-4">

                      <p className="truncate font-['Instrument_Serif'] text-lg text-[#252525] sm:text-xl">
                        {category.name}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            editCategory(category)
                          }
                          className="rounded-lg border border-[#D4AF37]/40 py-2 text-[10px] font-semibold text-[#A17B20] transition hover:bg-[#D4AF37] hover:text-white sm:text-xs"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCategory(
                              category._id
                            )
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

          </section>

        </div>
      </div>
    </div>
  );
}

export default CollectionManagement;
