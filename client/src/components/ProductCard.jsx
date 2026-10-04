import React from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-[#E7E3DA] bg-white text-left shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_15px_35px_rgba(0,0,0,0.11)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 sm:rounded-3xl sm:hover:-translate-y-2"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-[#F7F7F5]">

        <img
          className="h-40 w-full object-contain p-2 transition-all duration-700 ease-out group-hover:scale-105 sm:h-56 sm:p-3 md:h-64"
          src={product.image}
          alt={product.name}
        />

        {/* Soft Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.03] to-transparent" />

        {/* Shine */}
        <div className="pointer-events-none absolute inset-y-0 -left-full z-10 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[120%]" />

        {/* Stock Badge */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4">
          {product.stock > 0 ? (
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

      {/* Product Details */}
      <div className="p-3 sm:p-4 md:p-5">

        <div className="flex items-start justify-between gap-3">

          {/* Category + Name */}
          <div className="min-w-0 flex-1">

            <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#D4AF37] sm:h-1.5 sm:w-1.5" />

              <p className="truncate text-[7px] font-semibold uppercase tracking-[0.16em] text-[#999999] sm:text-[10px] sm:tracking-[0.22em]">
                {product.category?.name || "Collection"}
              </p>
            </div>

            {/* Product Name */}
            <h3 className="line-clamp-2 font-['Instrument_Serif'] text-lg font-normal leading-5 tracking-wide text-[#222222] transition-colors duration-300 group-hover:text-[#A17B20] sm:text-2xl sm:leading-7">
              {product.name}
            </h3>

          </div>

          {/* Price */}
          <div className="shrink-0 text-right">

            <p className="mb-0.5 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#999999] sm:mb-1 sm:text-[9px] sm:tracking-[0.2em]">
              Price
            </p>

            <strong className="font-['Instrument_Serif'] text-lg font-normal text-[#A17B20] sm:text-2xl md:text-[26px]">
              ₹{product.sellPrice}
            </strong>

          </div>
        </div>

        {/* View Details */}
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
