import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = (event) => {
    // Card navigation ko prevent karega
    event.stopPropagation();

    setIsWishlisted((prev) => !prev);
  };

  const sellPrice = Number(
    product?.sellPrice || 0
  );

  const mrp = Number(
    product?.mrp || 0
  );

  const rating = Number(
    product?.rating || 0
  );

  const discount =
    mrp > sellPrice && mrp > 0
      ? Math.round(
          ((mrp - sellPrice) /
            mrp) *
            100
        )
      : 0;

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-[#E7E3DA] bg-white text-left shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.11)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 sm:rounded-3xl sm:hover:-translate-y-2"
    >

      {/* =========================
          PRODUCT IMAGE
      ========================= */}

      <div className="relative overflow-hidden bg-[#F7F7F5]">

        <img
          className="h-40 w-full object-contain p-2 transition-all duration-700 ease-out group-hover:scale-105 sm:h-56 sm:p-3 md:h-64"
          src={
            product?.image ||
            product?.images?.[0]
          }
          alt={
            product?.name ||
            "Product"
          }
        />

        {/* Soft Gradient */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.03] to-transparent" />

        {/* Shine */}

        <div className="pointer-events-none absolute inset-y-0 -left-full z-10 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[120%]" />

        {/* =========================
            WISHLIST BUTTON
        ========================= */}

        <button
          type="button"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={
            handleWishlistClick
          }
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-lg shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={
              isWishlisted
                ? "#A17B20"
                : "none"
            }
            stroke={
              isWishlisted
                ? "#A17B20"
                : "#555"
            }
            strokeWidth="1.7"
            className="h-4.5 w-4.5 transition-all duration-300 sm:h-5 sm:w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>

        {/* =========================
            STOCK BADGE
        ========================= */}

        <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4">
          {Number(product?.stock || 0) >
          0 ? (
            <span className="rounded-full border border-emerald-200/80 bg-white/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[9px] sm:tracking-[0.15em]">
              In Stock
            </span>
          ) : (
            <span className="rounded-full border border-red-200 bg-white/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-red-600 shadow-sm backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[9px] sm:tracking-[0.15em]">
              Sold Out
            </span>
          )}
        </div>

      </div>

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <div className="p-3 sm:p-4 md:p-5">

        {/* CATEGORY */}

        <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">

          <span className="h-1 w-1 shrink-0 rounded-full bg-[#D4AF37] sm:h-1.5 sm:w-1.5" />

          <p className="truncate text-[7px] font-semibold uppercase tracking-[0.16em] text-[#999999] sm:text-[10px] sm:tracking-[0.22em]">
            {product?.category?.name ||
              product?.category?.title ||
              "Collection"}
          </p>

        </div>

        {/* =========================
            PRODUCT NAME
        ========================= */}

        <h3 className="line-clamp-2 font-['Instrument_Serif'] text-lg font-normal leading-5 tracking-wide text-[#222222] transition-colors duration-300 group-hover:text-[#A17B20] sm:text-2xl sm:leading-7">
          {product?.name}
        </h3>

        {/* =========================
            RATING
        ========================= */}

        <div className="mt-2 flex items-center gap-1.5 sm:mt-3">

          <div className="flex items-center gap-0.5">

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={
                    star <= rating
                      ? "#D4AF37"
                      : "#E5E5E5"
                  }
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                >
                  <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.53L12 17.46l-5.86 3.08 1.12-6.53-4.75-4.63 6.56-.95L12 2.5z" />
                </svg>
              )
            )}

          </div>

          <span className="text-[9px] font-medium text-[#777] sm:text-xs">
            {rating > 0
              ? rating.toFixed(1)
              : "0.0"}
          </span>

        </div>

        {/* =========================
            PRICE + MRP
        ========================= */}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:mt-3 sm:gap-2.5">

          {/* SELL PRICE */}

          <strong className="font-['Instrument_Serif'] text-lg font-normal text-[#A17B20] sm:text-2xl md:text-[26px]">
            ₹
            {sellPrice.toLocaleString(
              "en-IN"
            )}
          </strong>

          {/* MRP */}

          {mrp > sellPrice && (
            <span className="text-xs text-[#999] line-through sm:text-sm">
              ₹
              {mrp.toLocaleString(
                "en-IN"
              )}
            </span>
          )}

          {/* DISCOUNT */}

          {discount > 0 && (
            <span className="rounded-full bg-[#F4EBDD] px-2 py-1 text-[8px] font-semibold text-[#A17B20] sm:px-2.5 sm:text-[10px]">
              {discount}% OFF
            </span>
          )}

        </div>

        {/* =========================
            VIEW DETAILS
        ========================= */}

        <div className="mt-3 flex items-center gap-2 border-t border-[#EEEAE2] pt-3 sm:mt-4 sm:pt-4">

          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#A17B20] sm:text-[10px] sm:tracking-[0.22em]">
            View Details
          </span>

          <span className="text-sm text-[#A17B20] transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>

        </div>

      </div>

    </button>
  );
}

export default ProductCard;
