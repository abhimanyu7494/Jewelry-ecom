function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(category._id)}
      className="group flex w-full shrink-0 cursor-pointer flex-col items-center bg-transparent text-center outline-none"
    >
      {/* Circular Image */}
      <div
        className="
          relative
          rounded-full
          p-[2px]
          bg-gradient-to-br
          from-[#D4AF37]/20
          via-[#D4AF37]
          to-[#D4AF37]/20
          shadow-[0_0_12px_rgba(212,175,55,0.18)]
          transition-all
          duration-500
          group-hover:shadow-[0_0_24px_rgba(212,175,55,0.45)]
          group-hover:scale-[1.04]
          group-active:scale-[0.98]
        "
      >
        {/* Inner Circle */}
        <div
          className="
            relative
            overflow-hidden
            rounded-full
            bg-[#F7F6F2]
            aspect-square
            w-[125px]
            sm:w-[155px]
            md:w-[170px]
            lg:w-[180px]
          "
        >
          <img
            src={category.image}
            alt={category.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-110
            "
          />

          {/* Soft golden overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-gradient-to-br
              from-[#D4AF37]/10
              via-transparent
              to-[#D4AF37]/10
              opacity-60
              transition-opacity
              duration-500
              group-hover:opacity-100
            "
          />

          {/* Golden shine */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              -left-full
              w-1/2
              skew-x-[-20deg]
              bg-gradient-to-r
              from-transparent
              via-white/40
              to-transparent
              transition-all
              duration-700
              group-hover:left-[120%]
            "
          />
        </div>
      </div>

      {/* Category Name */}
      <h3
        className="
          mt-3
          max-w-[130px]
          truncate
          font-['Instrument_Serif']
          text-base
          font-normal
          tracking-wide
          text-[#B08A25]
          transition-all
          duration-300
          group-hover:text-[#D4AF37]
          group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.35)]
          sm:mt-4
          sm:max-w-[160px]
          sm:text-xl
        "
      >
        {category.name}
      </h3>
    </button>
  );
}

export default CategoryCard;
