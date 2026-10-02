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
          border-2
          border-[#D4AF37]
          bg-white
          p-0.5
          shadow-[0_0_12px_rgba(212,175,55,0.18)]
          transition-all
          duration-500
          group-hover:scale-105
          group-hover:shadow-[0_0_24px_rgba(212,175,55,0.45)]
          group-active:scale-95
        "
      >
        {/* Image */}
        <div
          className="
            relative
            aspect-square
            w-32
            overflow-hidden
            rounded-full
            bg-[#F7F6F2]
            sm:w-40
            md:w-44
            lg:w-48
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

          {/* Soft Golden Overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-linear-to-br
              from-[#D4AF37]/10
              via-transparent
              to-[#D4AF37]/10
              opacity-60
              transition-opacity
              duration-500
              group-hover:opacity-100
            "
          />
        </div>
      </div>

      {/* Category Name */}
      <h3
        className="
          mt-3
          max-w-32
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
          sm:max-w-40
          sm:text-xl
        "
      >
        {category.name}
      </h3>
    </button>
  );
}

export default CategoryCard;
