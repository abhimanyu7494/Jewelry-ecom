import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isZoomed, setIsZoomed] = useState(false);

  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const imageContainerRef = useRef(null);
  const lastTapRef = useRef(0);

  // =========================
  // FETCH PRODUCT
  // =========================

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        const data = response.data;

        const productData =
          data?.product ||
          data?.data ||
          data;

        if (!productData || !productData._id) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        setSelectedImage(
          productData.image ||
            productData.images?.[0] ||
            ""
        );

        setQuantity(1);
      } catch (err) {
        console.error(
          "Product detail error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load product";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // CATEGORY NAME
  // =========================

  const getCategoryName = (item) => {
    if (!item?.category) {
      return "";
    }

    if (typeof item.category === "string") {
      return item.category
        .trim()
        .toLowerCase();
    }

    return String(
      item.category.name ||
        item.category.title ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  // =========================
  // FETCH RANDOM 15 PRODUCTS
  // =========================

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?._id) {
        return;
      }

      try {
        setRelatedLoading(true);

        const response =
          await api.get("/products");

        const data = response.data;

        let productsData =
          data?.products ||
          data?.data ||
          data?.results ||
          (Array.isArray(data)
            ? data
            : []);

        if (!Array.isArray(productsData)) {
          productsData = [];
        }

        // Current product remove
        let filteredProducts =
          productsData.filter(
            (item) =>
              String(item?._id) !==
              String(product?._id)
          );

        const currentCategory =
          getCategoryName(product);

        // Same category ko priority
        if (currentCategory) {
          const sameCategory =
            filteredProducts.filter(
              (item) =>
                getCategoryName(item) ===
                currentCategory
            );

          const otherProducts =
            filteredProducts.filter(
              (item) =>
                getCategoryName(item) !==
                currentCategory
            );

          filteredProducts = [
            ...sameCategory,
            ...otherProducts,
          ];
        }

        // Random shuffle
        const shuffledProducts =
          [...filteredProducts].sort(
            () => Math.random() - 0.5
          );

        // Maximum 15
        setRelatedProducts(
          shuffledProducts.slice(0, 15)
        );
      } catch (err) {
        console.error(
          "Related products error:",
          err
        );

        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // =========================
  // RESET ZOOM
  // =========================

  useEffect(() => {
    setIsZoomed(false);

    setZoomPosition({
      x: 50,
      y: 50,
    });
  }, [selectedImage]);

  // =========================
  // UPDATE ZOOM POSITION
  // =========================

  const updateZoomPosition = (
    clientX,
    clientY
  ) => {
    if (!imageContainerRef.current) {
      return;
    }

    const rect =
      imageContainerRef.current.getBoundingClientRect();

    const x =
      ((clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((clientY - rect.top) /
        rect.height) *
      100;

    setZoomPosition({
      x: Math.max(
        0,
        Math.min(100, x)
      ),
      y: Math.max(
        0,
        Math.min(100, y)
      ),
    });
  };

  // =========================
  // DESKTOP MOUSE ZOOM
  // =========================

  const handleMouseMove = (event) => {
    updateZoomPosition(
      event.clientX,
      event.clientY
    );

    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);

    setZoomPosition({
      x: 50,
      y: 50,
    });
  };

  // =========================
  // MOBILE TOUCH ZOOM
  // =========================

  const handleTouchStart = (event) => {
    const touch =
      event.touches?.[0];

    if (!touch) return;

    updateZoomPosition(
      touch.clientX,
      touch.clientY
    );

    setIsZoomed(true);
  };

  const handleTouchMove = (event) => {
    const touch =
      event.touches?.[0];

    if (!touch) return;

    updateZoomPosition(
      touch.clientX,
      touch.clientY
    );

    setIsZoomed(true);
  };

  const handleTouchEnd = () => {
    const now = Date.now();

    const DOUBLE_TAP_DELAY = 300;

    if (
      now - lastTapRef.current <
      DOUBLE_TAP_DELAY
    ) {
      setIsZoomed(
        (prev) => !prev
      );
    }

    lastTapRef.current = now;
  };

  // =========================
  // QUANTITY
  // =========================

  const increaseQuantity = () => {
    const stock = Number(
      product?.stock || 0
    );

    if (quantity < stock) {
      setQuantity(
        (prev) => prev + 1
      );
    }
  };

  const decreaseQuantity = () => {
    setQuantity(
      (prev) =>
        Math.max(1, prev - 1)
    );
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = () => {
    console.log(
      "Add to cart:",
      {
        productId:
          product?._id,
        quantity,
      }
    );
  };

  // =========================
  // BUY NOW
  // =========================

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        product,
        quantity,
      },
    });
  };

  // =========================
  // PRODUCT IMAGE
  // =========================

  const getProductImage = (item) => {
    return (
      item?.image ||
      item?.images?.[0] ||
      "https://via.placeholder.com/600x600?text=Product"
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#A17B20] border-t-transparent" />
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h2 className="font-['Instrument_Serif'] text-3xl text-[#242424]">
          Product Not Found
        </h2>

        <p className="mt-2 max-w-md text-sm text-[#777]">
          {error ||
            "This product could not be found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mt-6 rounded-full bg-[#242424] px-6 py-3 text-sm text-white transition hover:bg-[#A17B20]"
        >
          Go Back
        </button>
      </div>
    );
  }

  // =========================
  // PRODUCT DATA
  // =========================

  const galleryImages = [
    product.image,
    ...(Array.isArray(
      product.images
    )
      ? product.images
      : []),
  ].filter(Boolean);

  const mrp = Number(
    product.mrp || 0
  );

  const sellPrice = Number(
    product.sellPrice || 0
  );

  const stock = Number(
    product.stock || 0
  );

  const discount =
    mrp > 0 &&
    mrp > sellPrice
      ? Math.round(
          ((mrp - sellPrice) /
            mrp) *
            100
        )
      : 0;

  const isOutOfStock =
    stock <= 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-6 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-xs text-[#666] transition-colors hover:text-[#A17B20] sm:text-sm"
        >
          <span className="text-base sm:text-lg">
            ←
          </span>

          Back
        </button>
      </div>

      {/* =========================
          PRODUCT SECTION
      ========================= */}

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-10 lg:py-16">

        <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">

          {/* =========================
              IMAGE
          ========================= */}

          <div className="w-full">

            <div
              ref={imageContainerRef}
              onMouseMove={
                handleMouseMove
              }
              onMouseLeave={
                handleMouseLeave
              }
              onTouchStart={
                handleTouchStart
              }
              onTouchMove={
                handleTouchMove
              }
              onTouchEnd={
                handleTouchEnd
              }
              className={`group relative overflow-hidden rounded-xl bg-[#F7F7F5] sm:rounded-2xl ${
                isZoomed
                  ? "cursor-zoom-out"
                  : "cursor-zoom-in"
              }`}
              style={{
                touchAction:
                  "pan-y",
              }}
            >

              <div className="aspect-square overflow-hidden">

                <img
                  src={
                    selectedImage
                  }
                  alt={
                    product.name
                  }
                  draggable={false}
                  className="h-full w-full select-none object-cover transition-transform duration-100 ease-out"
                  style={{
                    transform:
                      isZoomed
                        ? "scale(2.2)"
                        : "scale(1)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />

              </div>

              {/* Desktop zoom hint */}

              <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
                Move cursor to zoom
              </div>

              {/* Mobile zoom hint */}

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] text-white sm:text-xs md:hidden">
                Move finger to zoom
              </div>

              {/* Discount */}

              {discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-[#A17B20] px-3 py-1.5 text-[10px] font-medium text-white sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs">
                  {discount}% OFF
                </span>
              )}

              {/* Out of Stock */}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#242424] sm:px-5 sm:py-2.5 sm:text-sm">
                    Out of Stock
                  </span>
                </div>
              )}

            </div>

            {/* =========================
                THUMBNAILS
            ========================= */}

            {galleryImages.length >
              1 && (
              <div className="mt-3 grid grid-cols-5 gap-2 sm:mt-4 sm:gap-3">

                {galleryImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`aspect-square overflow-hidden rounded-lg border-2 bg-[#F7F7F5] transition sm:rounded-xl ${
                        selectedImage ===
                        image
                          ? "border-[#A17B20]"
                          : "border-transparent hover:border-[#D6D6D6]"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* =========================
              PRODUCT INFORMATION
          ========================= */}

          <div className="flex min-w-0 flex-col justify-center">

            {/* BRAND */}

            {product.brand && (
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A17B20] sm:text-xs sm:tracking-[0.2em]">
                {product.brand}
              </p>
            )}

            {/* PRODUCT NAME */}

            <h1
              className="mt-2 font-['Instrument_Serif'] leading-[1.08] text-[#242424]"
              style={{
                fontSize:
                  "clamp(2rem, 5vw, 3.75rem)",
              }}
            >
              {product.name}
            </h1>

            {/* SHORT DESCRIPTION */}

            {product.shortDescription && (
              <p
                className="mt-4 leading-6 text-[#666] sm:mt-5 sm:leading-7"
                style={{
                  fontSize:
                    "clamp(0.82rem, 1.5vw, 1rem)",
                }}
              >
                {
                  product.shortDescription
                }
              </p>
            )}

            {/* PRICE */}

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-7 sm:gap-3">

              <span
                className="font-semibold text-[#242424]"
                style={{
                  fontSize:
                    "clamp(1.35rem, 3vw, 1.5rem)",
                }}
              >
                ₹
                {sellPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              {mrp >
                sellPrice && (
                <>
                  <span
                    className="text-[#999] line-through"
                    style={{
                      fontSize:
                        "clamp(0.85rem, 2vw, 1.125rem)",
                    }}
                  >
                    ₹
                    {mrp.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span className="rounded-full bg-[#F4EBDD] px-2.5 py-1 text-[10px] font-medium text-[#A17B20] sm:px-3 sm:text-xs">
                    Save {discount}%
                  </span>
                </>
              )}

            </div>

            <div className="my-5 h-px bg-[#EAEAEA] sm:my-7" />

            {/* DETAILS */}

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-5">

              {product.metal && (
                <DetailItem
                  label="Metal"
                  value={
                    product.metal
                  }
                />
              )}

              {product.purity && (
                <DetailItem
                  label="Purity"
                  value={
                    product.purity
                  }
                />
              )}

              {product.metalColor && (
                <DetailItem
                  label="Metal Color"
                  value={
                    product.metalColor
                  }
                />
              )}

              {product.grossWeight !=
                null && (
                <DetailItem
                  label="Gross Weight"
                  value={`${product.grossWeight} g`}
                />
              )}

              {product.netWeight !=
                null && (
                <DetailItem
                  label="Net Weight"
                  value={`${product.netWeight} g`}
                />
              )}

              {product.stoneType && (
                <DetailItem
                  label="Stone"
                  value={
                    product.stoneType
                  }
                />
              )}

              {product.stoneWeight !=
                null && (
                <DetailItem
                  label="Stone Weight"
                  value={`${product.stoneWeight} g`}
                />
              )}

              {product.stoneColor && (
                <DetailItem
                  label="Stone Color"
                  value={
                    product.stoneColor
                  }
                />
              )}

              {product.stoneClarity && (
                <DetailItem
                  label="Clarity"
                  value={
                    product.stoneClarity
                  }
                />
              )}

              {product.gender && (
                <DetailItem
                  label="Gender"
                  value={
                    product.gender
                  }
                />
              )}

            </div>

            {/* STOCK */}

            <div className="mt-6 sm:mt-7">

              {isOutOfStock ? (
                <p className="text-xs font-medium text-red-600 sm:text-sm">
                  Currently out of stock
                </p>
              ) : stock <=
                5 ? (
                <p className="text-xs font-medium text-[#A17B20] sm:text-sm">
                  Only {stock} left in stock
                </p>
              ) : (
                <p className="text-xs text-green-700 sm:text-sm">
                  In stock
                </p>
              )}

            </div>

            {/* QUANTITY */}

            {!isOutOfStock && (
              <div className="mt-5 flex items-center gap-3 sm:mt-6 sm:gap-4">

                <span className="text-xs text-[#555] sm:text-sm">
                  Quantity
                </span>

                <div className="flex items-center overflow-hidden rounded-full border border-[#DCDCDC]">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    className="flex h-9 w-9 items-center justify-center text-base text-[#555] transition hover:bg-[#F5F5F3] sm:h-10 sm:w-10 sm:text-lg"
                  >
                    −
                  </button>

                  <span className="flex h-9 w-9 items-center justify-center text-xs font-medium sm:h-10 sm:w-10 sm:text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      stock
                    }
                    className="flex h-9 w-9 items-center justify-center text-base text-[#555] transition hover:bg-[#F5F5F3] disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10 sm:text-lg"
                  >
                    +
                  </button>

                </div>

              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-6 grid gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-3">

              <button
                type="button"
                disabled={
                  isOutOfStock
                }
                onClick={
                  handleAddToCart
                }
                className="rounded-full border border-[#242424] px-5 py-3.5 text-xs font-medium text-[#242424] transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:border-[#CCC] disabled:text-[#AAA] sm:px-6 sm:py-4 sm:text-sm"
              >
                Add to Cart
              </button>

              <button
                type="button"
                disabled={
                  isOutOfStock
                }
                onClick={
                  handleBuyNow
                }
                className="rounded-full bg-[#A17B20] px-5 py-3.5 text-xs font-medium text-white transition hover:bg-[#8B6819] disabled:cursor-not-allowed disabled:bg-[#CCC] sm:px-6 sm:py-4 sm:text-sm"
              >
                Buy Now
              </button>

            </div>

            {/* EXTRA INFO */}

            <div className="mt-6 space-y-3 border-t border-[#EAEAEA] pt-6 sm:mt-8 sm:space-y-4 sm:pt-7">

              {product.occasion && (
                <InfoRow
                  label="Occasion"
                  value={
                    product.occasion
                  }
                />
              )}

              {product.certification && (
                <InfoRow
                  label="Certification"
                  value={
                    product.certification
                  }
                />
              )}

              {product.warranty && (
                <InfoRow
                  label="Warranty"
                  value={
                    product.warranty
                  }
                />
              )}

            </div>

          </div>
        </div>

        {/* =========================
            DESCRIPTION
        ========================= */}

        {(product.description ||
          product.careInstructions) && (
          <div className="mt-12 border-t border-[#EAEAEA] pt-9 sm:mt-16 sm:pt-12 lg:mt-20">

            <div className="grid gap-8 md:grid-cols-2 md:gap-10">

              {product.description && (
                <div>

                  <h2
                    className="font-['Instrument_Serif'] text-[#242424]"
                    style={{
                      fontSize:
                        "clamp(1.7rem, 4vw, 1.875rem)",
                    }}
                  >
                    Description
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-xs leading-6 text-[#666] sm:mt-4 sm:text-sm sm:leading-7">
                    {
                      product.description
                    }
                  </p>

                </div>
              )}

              {product.careInstructions && (
                <div>

                  <h2
                    className="font-['Instrument_Serif'] text-[#242424]"
                    style={{
                      fontSize:
                        "clamp(1.7rem, 4vw, 1.875rem)",
                    }}
                  >
                    Care Instructions
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-xs leading-6 text-[#666] sm:mt-4 sm:text-sm sm:leading-7">
                    {
                      product.careInstructions
                    }
                  </p>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =========================
            RELATED PRODUCTS
        ========================= */}

        <section className="mt-14 border-t border-[#EAEAEA] pt-9 sm:mt-20 sm:pt-12 lg:mt-24">

          {/* HEADER */}

          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">

            <div>

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A17B20] sm:text-xs sm:tracking-[0.2em]">
                You may also like
              </p>

              <h2
                className="mt-1.5 font-['Instrument_Serif'] text-[#242424] sm:mt-2"
                style={{
                  fontSize:
                    "clamp(2rem, 5vw, 3rem)",
                }}
              >
                Related Products
              </h2>

            </div>

            {/* DESKTOP HOME BUTTON */}

            {relatedProducts.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="hidden cursor-pointer text-xs font-medium text-[#666] transition-colors hover:text-[#A17B20] sm:block sm:text-sm"
              >
                Home →
              </button>
            )}

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {relatedLoading ? (
            <div className="flex gap-4 overflow-hidden sm:gap-5 lg:gap-6">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="w-[68vw] shrink-0 sm:w-[250px] lg:w-[280px]"
                  >

                    <div className="overflow-hidden rounded-2xl bg-[#F7F7F5]">

                      <div className="aspect-square animate-pulse bg-[#EDEDEB]" />

                      <div className="space-y-3 p-4">

                        <div className="h-3 w-20 animate-pulse rounded bg-[#E5E5E3]" />

                        <div className="h-5 w-3/4 animate-pulse rounded bg-[#E5E5E3]" />

                        <div className="h-4 w-1/2 animate-pulse rounded bg-[#E5E5E3]" />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          ) : relatedProducts.length >
            0 ? (

            /*
              HORIZONTAL PRODUCTS

              Scrollbar hidden completely.
              Swipe works on mobile.
            */

            <div
              className="no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain pb-3 sm:gap-5 lg:gap-6"
              style={{
                scrollbarWidth:
                  "none",
                msOverflowStyle:
                  "none",
              }}
            >

              {relatedProducts.map(
                (item) => {

                  const itemImage =
                    getProductImage(
                      item
                    );

                  const itemMrp =
                    Number(
                      item.mrp || 0
                    );

                  const itemSellPrice =
                    Number(
                      item.sellPrice ||
                        0
                    );

                  const itemDiscount =
                    itemMrp > 0 &&
                    itemMrp >
                      itemSellPrice
                      ? Math.round(
                          ((itemMrp -
                            itemSellPrice) /
                            itemMrp) *
                            100
                        )
                      : 0;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        navigate(
                          `/products/${item._id}`
                        )
                      }
                      className="group relative w-[68vw] shrink-0 cursor-pointer text-left transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98] sm:w-[250px] md:w-[270px] lg:w-[280px]"
                    >

                      {/* IMAGE */}

                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F7F7F5] sm:rounded-2xl">

                        <img
                          src={
                            itemImage
                          }
                          alt={
                            item.name
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* DISCOUNT */}

                        {itemDiscount >
                          0 && (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#A17B20] px-2.5 py-1 text-[9px] font-medium text-white sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                            {
                              itemDiscount
                            }
                            % OFF
                          </span>
                        )}

                        {/* DESKTOP CLICK INDICATOR */}

                        <div className="absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#242424] shadow-sm">

                            View Product

                            <span className="text-[#A17B20] transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>

                          </span>

                        </div>

                        {/* MOBILE CLICK INDICATOR */}

                        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm font-medium text-[#242424] shadow-md sm:hidden">
                          →
                        </div>

                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="mt-3 sm:mt-4">

                        {item.brand && (
                          <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-[#A17B20] sm:text-xs">
                            {
                              item.brand
                            }
                          </p>
                        )}

                        <h3
                          className="mt-1 line-clamp-2 font-['Instrument_Serif'] leading-tight text-[#242424] transition-colors group-hover:text-[#A17B20]"
                          style={{
                            fontSize:
                              "clamp(1rem, 2vw, 1.25rem)",
                          }}
                        >
                          {
                            item.name
                          }
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">

                          <span className="text-xs font-semibold text-[#242424] sm:text-base">
                            ₹
                            {itemSellPrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {itemMrp >
                            itemSellPrice && (
                            <span className="text-[10px] text-[#999] line-through sm:text-xs">
                              ₹
                              {itemMrp.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-2xl bg-[#F7F7F5] px-6 py-12 text-center">

              <p className="text-sm text-[#777]">
                No related products found.
              </p>

            </div>

          )}

          {/* MOBILE HOME BUTTON */}

          {relatedProducts.length >
            0 && (
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mt-6 w-full cursor-pointer rounded-full border border-[#242424] px-6 py-3.5 text-xs font-medium text-[#242424] transition hover:bg-[#242424] hover:text-white sm:hidden"
            >
              Back to Home
            </button>
          )}

        </section>

      </section>

    </main>
  );
}

// =========================
// DETAIL ITEM
// =========================

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0">

      <p className="text-[9px] uppercase tracking-[0.12em] text-[#999] sm:text-[11px] sm:tracking-[0.15em]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-medium text-[#242424] sm:mt-1 sm:text-sm">
        {value}
      </p>

    </div>
  );
}

// =========================
// INFO ROW
// =========================

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">

      <span className="text-xs text-[#888] sm:text-sm">
        {label}
      </span>

      <span className="text-xs font-medium text-[#333] sm:max-w-[70%] sm:text-right sm:text-sm">
        {value}
      </span>

    </div>
  );
}

export default ProductDetail;
