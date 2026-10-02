function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(category._id)}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E6E2D8] bg-white p-1.5 text-left shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/70 hover:shadow-[0_15px_35px_rgba(0,0,0,0.10)] active:scale-[0.98] sm:rounded-3xl sm:p-2 sm:hover:-translate-y-2"
    >

      {/* Gold top accent */}
      <div className="absolute left-1/2 top-0 z-20 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-all duration-500 group-hover:w-3/4" />

      {/* Image */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#F5F5F3] sm:rounded-[20px]">

        <img
          className="h-28 w-full object-contain p-1.5 transition-all duration-700 ease-out group-hover:scale-105 sm:h-40 sm:p-2 md:h-44 lg:h-48"
          src={category.image}
          alt={category.name}
        />

        {/* Soft overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.08] via-transparent to-transparent" />

        {/* Silver shine */}
        <div className="pointer-events-none absolute inset-y-0 -left-full z-10 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[120%]" />

        {/* Collection Badge */}
        <div className="absolute bottom-2 left-2 rounded-full border border-white/40 bg-white/90 px-2 py-1 text-[6px] font-semibold uppercase tracking-[0.12em] text-[#777777] shadow-sm backdrop-blur-md sm:bottom-3 sm:left-3 sm:px-3 sm:py-1 sm:text-[9px] sm:tracking-[0.18em]">
          Collection
        </div>

        {/* Arrow */}
        <div className="absolute bottom-2 right-2 flex h-6 w-6 translate-y-1 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[#A17B20] opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-3 sm:right-3 sm:h-8 sm:w-8">

          <svg
            className="h-3 w-3 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M5 12h14m-6-6 6 6-6 6"
            />
          </svg>

        </div>

      </div>


      {/* Content */}
      <div className="flex items-center justify-between px-1.5 pb-1.5 pt-2.5 sm:px-3 sm:pb-2 sm:pt-4">

        <div className="min-w-0">

          <h3 className="truncate font-['Instrument_Serif'] text-base font-normal tracking-wide text-[#242424] transition-colors duration-300 group-hover:text-[#A17B20] sm:text-xl">
            {category.name}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 sm:mt-1.5 sm:gap-2">

            <span className="h-px w-3 bg-[#D4AF37]/70 transition-all duration-300 group-hover:w-6 sm:w-5 sm:group-hover:w-8" />

            <span className="text-[6px] uppercase tracking-[0.15em] text-[#A0A0A0] sm:text-[8px] sm:tracking-[0.2em]">
              Explore
            </span>

          </div>

        </div>


        {/* Gold diamond */}
        <div className="ml-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E2E2E2] bg-[#FAFAFA] transition-all duration-300 group-hover:border-[#D4AF37]/60 group-hover:bg-[#FFF9E8] sm:ml-2 sm:h-7 sm:w-7">

          <span className="h-1 w-1 rotate-45 bg-[#C5C5C5] transition-colors duration-300 group-hover:bg-[#D4AF37] sm:h-1.5 sm:w-1.5" />

        </div>

      </div>

    </button>
  );
}

export default CategoryCard;
