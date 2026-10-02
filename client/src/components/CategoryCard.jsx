function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(category._id)}
      className="group flex w-full cursor-pointer flex-col items-center text-center"
    >
      {/* Circular Image */}
      <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-full bg-[#F5F5F3] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px]">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* Category Name */}
      <h3 className="mt-3 font-['Instrument_Serif'] text-base font-normal tracking-wide text-[#242424] transition-colors duration-300 group-hover:text-[#A17B20] sm:mt-4 sm:text-xl">
        {category.name}
      </h3>
    </button>
  );
}

export default CategoryCard;
