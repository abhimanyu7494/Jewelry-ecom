import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

  // Zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const imageContainerRef = useRef(null);
  const lastTapRef = useRef(0);

  /*
   * =========================
   * FETCH PRODUCT
   * =========================
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        const productData = data.product || data.data || data;

        setProduct(productData);
        setSelectedImage(productData.image || "");
        setQuantity(1);
      } catch (err) {
        console.error("Product detail error:", err);
        setError(err.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  /*
   * =========================
   * FETCH RELATED PRODUCTS
   * =========================
   */
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        setRelatedLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error("Unable to load related products");
        }

        const data = await response.json();

        const productsData =
          data.products ||
          data.data ||
          data.results ||
          (Array.isArray(data) ? data : []);

        /*
         * Current product ko exclude kar rahe hain.
         */
        let filteredProducts = productsData.filter(
          (item) => String(item._id) !== String(product._id)
        );

        /*
         * Pehle same category wale products.
         */
        if (product.category) {
          const sameCategory = filteredProducts.filter(
            (item) =>
              String(item.category || "").toLowerCase() ===
              String(product.category || "").toLowerCase()
          );

          const otherProducts = filteredProducts.filter(
            (item) =>
              String(item.category || "").toLowerCase() !==
              String(product.category || "").toLowerCase()
          );

          filteredProducts = [...sameCategory, ...otherProducts];
        }

        /*
         * Maximum 8 products show karenge.
         */
        setRelatedProducts(filteredProducts.slice(0, 8));
      } catch (err) {
        console.error("Related products error:", err);
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  /*
   * =========================
   * RESET ZOOM WHEN IMAGE CHANGES
   * =========================
   */
  useEffect(() => {
    setIsZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
  }, [selectedImage]);

  /*
   * =========================
   * DESKTOP MOUSE ZOOM
   * =========================
   */
  const handleMouseMove = (event) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });

    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);

    setZoomPosition({
      x: 50,
      y: 50,
    });
  };

  /*
   * =========================
   * MOBILE DOUBLE TAP ZOOM
   * =========================
   */
  const handleTouchEnd = (event) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      event.preventDefault();

      setIsZoomed((prev) => !prev);

      if (!isZoomed) {
        const touch = event.changedTouches?.[0];

        if (touch && imageContainerRef.current) {
          const rect =
            imageContainerRef.current.getBoundingClientRect();

          const x =
            ((touch.clientX - rect.left) / rect.width) * 100;

          const y =
            ((touch.clientY - rect.top) / rect.height) * 100;

          setZoomPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
          });
        }
      }
    }

    lastTapRef.current = now;
  };

  /*
   * =========================
   * QUANTITY
   * =========================
   */
  const increaseQuantity = () => {
    if (quantity < Number(product.stock || 0)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  /*
   * =========================
   * ADD TO CART
   * =========================
   */
  const handleAddToCart = () => {
    console.log("Add to cart:", {
      productId: product._id,
      quantity,
    });

    // Yahan tumhara cart API/function connect hoga.
  };

  /*
   * =========================
   * BUY NOW
   * =========================
   */
  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        product,
        quantity,
      },
    });
  };

  /*
   * =========================
   * RELATED PRODUCT IMAGE
   * =========================
   */
  const getProductImage = (item) => {
    return (
      item.image ||
      item.images?.[0] ||
      "https://via.placeholder.com/600x600?text=Product"
    );
  };

  /*
   * =========================
   * LOADING
   * =========================
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#A17B20] border-t-transparent" />
      </div>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */
  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h2 className="font-['Instrument_Serif'] text-3xl text-[#242424]">
          Product Not Found
        </h2>

        <p className="mt-2 text-sm text-[#777]">
          {error || "This product could not be found."}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-full bg-[#242424] px-6 py-3 text-sm text-white transition hover:bg-[#A17B20]"
        >
          Go Back
        </button>
      </div>
    );
  }

  /*
   * =========================
   * PRODUCT DATA
   * =========================
   */
  const galleryImages = [
    product.image,
    ...(product.images || []),
  ].filter(Boolean);

  const mrp = Number(product.mrp || 0);
  const sellPrice = Number(product.sellPrice || 0);
  const stock = Number(product.stock || 0);

  const discount =
    mrp > 0 && mrp > sellPrice
      ? Math.round(((mrp - sellPrice) / mrp) * 100)
      : 0;

  const isOutOfStock = stock <= 0;

  return (
    <main className="min-h-screen bg-white">
      {/* =========================
          BACK BUTTON
      ========================= */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#666] transition-colors hover:text-[#A17B20]"
        >
          <span className="text-lg">←</span>
          Back
        </button>
      </div>

      {/* =========================
          MAIN PRODUCT SECTION
      ========================= */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* =========================
              IMAGE SECTION
          ========================= */}
          <div>
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchEnd={handleTouchEnd}
              className={`group relative overflow-hidden rounded-2xl bg-[#F7F7F5] ${
                isZoomed
                  ? "cursor-zoom-out"
                  : "cursor-zoom-in"
              }`}
              style={{
                touchAction: "pan-y",
              }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={selectedImage}
                  alt={product.name}
                  draggable={false}
                  className="h-full w-full select-none object-cover transition-transform duration-200 ease-out"
                  style={{
                    transform: isZoomed
                      ? "scale(2.2)"
                      : "scale(1)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>

              {/* Desktop Zoom Hint */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
                Move cursor to zoom
              </div>

              {/* Mobile Zoom Hint */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white md:hidden">
                Double tap to zoom
              </div>

              {/* Discount */}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-[#A17B20] px-4 py-2 text-xs font-medium text-white">
                  {discount}% OFF
                </span>
              )}

              {/* Out Of Stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#242424]">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* =========================
                THUMBNAILS
            ========================= */}
            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-[#F7F7F5] transition ${
                      selectedImage === image
                        ? "border-[#A17B20]"
                        : "border-transparent hover:border-[#D6D6D6]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =========================
              PRODUCT INFO
          ========================= */}
          <div className="flex flex-col justify-center">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A17B20]">
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <h1 className="mt-2 font-['Instrument_Serif'] text-4xl leading-tight text-[#242424] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="mt-5 text-base leading-7 text-[#666]">
                {product.shortDescription}
              </p>
            )}

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-[#242424]">
                ₹{sellPrice.toLocaleString("en-IN")}
              </span>

              {mrp > sellPrice && (
                <>
                  <span className="text-lg text-[#999] line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>

                  <span className="rounded-full bg-[#F4EBDD] px-3 py-1 text-xs font-medium text-[#A17B20]">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="my-7 h-px bg-[#EAEAEA]" />

            {/* =========================
                SPECIFICATIONS
            ========================= */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {product.metal && (
                <DetailItem
                  label="Metal"
                  value={product.metal}
                />
              )}

              {product.purity && (
                <DetailItem
                  label="Purity"
                  value={product.purity}
                />
              )}

              {product.metalColor && (
                <DetailItem
                  label="Metal Color"
                  value={product.metalColor}
                />
              )}

              {product.grossWeight != null && (
                <DetailItem
                  label="Gross Weight"
                  value={`${product.grossWeight} g`}
                />
              )}

              {product.netWeight != null && (
                <DetailItem
                  label="Net Weight"
                  value={`${product.netWeight} g`}
                />
              )}

              {product.stoneType && (
                <DetailItem
                  label="Stone"
                  value={product.stoneType}
                />
              )}

              {product.stoneWeight != null && (
                <DetailItem
                  label="Stone Weight"
                  value={`${product.stoneWeight} g`}
                />
              )}

              {product.stoneColor && (
                <DetailItem
                  label="Stone Color"
                  value={product.stoneColor}
                />
              )}

              {product.stoneClarity && (
                <DetailItem
                  label="Clarity"
                  value={product.stoneClarity}
                />
              )}

              {product.gender && (
                <DetailItem
                  label="Gender"
                  value={product.gender}
                />
              )}
            </div>

            {/* =========================
                STOCK
            ========================= */}
            <div className="mt-7">
              {isOutOfStock ? (
                <p className="text-sm font-medium text-red-600">
                  Currently out of stock
                </p>
              ) : stock <= 5 ? (
                <p className="text-sm font-medium text-[#A17B20]">
                  Only {stock} left in stock
                </p>
              ) : (
                <p className="text-sm text-green-700">
                  In stock
                </p>
              )}
            </div>

            {/* =========================
                QUANTITY
            ========================= */}
            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm text-[#555]">
                  Quantity
                </span>

                <div className="flex items-center overflow-hidden rounded-full border border-[#DCDCDC]">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-10 w-10 items-center justify-center text-lg text-[#555] transition hover:bg-[#F5F5F3]"
                  >
                    −
                  </button>

                  <span className="flex h-10 w-10 items-center justify-center text-sm font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock}
                    className="flex h-10 w-10 items-center justify-center text-lg text-[#555] transition hover:bg-[#F5F5F3] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* =========================
                ACTION BUTTONS
            ========================= */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="rounded-full border border-[#242424] px-6 py-4 text-sm font-medium text-[#242424] transition hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:border-[#CCC] disabled:text-[#AAA]"
              >
                Add to Cart
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="rounded-full bg-[#A17B20] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#8B6819] disabled:cursor-not-allowed disabled:bg-[#CCC]"
              >
                Buy Now
              </button>
            </div>

            {/* =========================
                ADDITIONAL INFO
            ========================= */}
            <div className="mt-8 space-y-4 border-t border-[#EAEAEA] pt-7">
              {product.occasion && (
                <InfoRow
                  label="Occasion"
                  value={product.occasion}
                />
              )}

              {product.certification && (
                <InfoRow
                  label="Certification"
                  value={product.certification}
                />
              )}

              {product.warranty && (
                <InfoRow
                  label="Warranty"
                  value={product.warranty}
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
          <div className="mt-16 border-t border-[#EAEAEA] pt-12 sm:mt-20">
            <div className="grid gap-10 md:grid-cols-2">
              {product.description && (
                <div>
                  <h2 className="font-['Instrument_Serif'] text-3xl text-[#242424]">
                    Description
                  </h2>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#666]">
                    {product.description}
                  </p>
                </div>
              )}

              {product.careInstructions && (
                <div>
                  <h2 className="font-['Instrument_Serif'] text-3xl text-[#242424]">
                    Care Instructions
                  </h2>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#666]">
                    {product.careInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================
            RELATED PRODUCTS
        ========================= */}
        <section className="mt-20 border-t border-[#EAEAEA] pt-12 sm:mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A17B20]">
                You may also like
              </p>

              <h2 className="mt-2 font-['Instrument_Serif'] text-4xl text-[#242424] sm:text-5xl">
                Related Products
              </h2>
            </div>

            {relatedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="hidden text-sm font-medium text-[#666] transition hover:text-[#A17B20] sm:block"
              >
                View All →
              </button>
            )}
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl bg-[#F7F7F5]"
                >
                  <div className="aspect-square animate-pulse bg-[#EDEDEB]" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#E5E5E3]" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#E5E5E3]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#E5E5E3]" />
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((item) => {
                const itemImage = getProductImage(item);

                const itemMrp = Number(item.mrp || 0);
                const itemSellPrice = Number(
                  item.sellPrice || 0
                );

                const itemDiscount =
                  itemMrp > 0 &&
                  itemMrp > itemSellPrice
                    ? Math.round(
                        ((itemMrp - itemSellPrice) /
                          itemMrp) *
                          100
                      )
                    : 0;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() =>
                      navigate(`/products/${item._id}`)
                    }
                    className="group text-left"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F7F7F5]">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {itemDiscount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#A17B20] px-3 py-1.5 text-[10px] font-medium text-white sm:left-4 sm:top-4 sm:text-xs">
                          {itemDiscount}% OFF
                        </span>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/30 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
                        <span className="text-xs font-medium text-white">
                          View Product →
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-4">
                      {item.brand && (
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#A17B20] sm:text-xs">
                          {item.brand}
                        </p>
                      )}

                      <h3 className="mt-1 line-clamp-2 font-['Instrument_Serif'] text-lg leading-tight text-[#242424] transition-colors group-hover:text-[#A17B20] sm:text-xl">
                        {item.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#242424] sm:text-base">
                          ₹
                          {itemSellPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {itemMrp > itemSellPrice && (
                          <span className="text-xs text-[#999] line-through">
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
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F7F7F5] px-6 py-12 text-center">
              <p className="text-sm text-[#777]">
                No related products found.
              </p>
            </div>
          )}

          {relatedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-7 w-full rounded-full border border-[#242424] px-6 py-3.5 text-sm font-medium text-[#242424] transition hover:bg-[#242424] hover:text-white sm:hidden"
            >
              View All Products
            </button>
          )}
        </section>
      </section>
    </main>
  );
}

/*
 * =========================
 * SMALL COMPONENTS
 * =========================
 */

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-[#999]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[#242424]">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-[#888]">
        {label}
      </span>

      <span className="text-sm font-medium text-[#333] sm:max-w-[70%] sm:text-right">
        {value}
      </span>
    </div>
  );
}

export default ProductDetail;
