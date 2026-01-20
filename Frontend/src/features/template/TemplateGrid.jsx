import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import TemplateCard from "./TemplateCard";
import { getServerImageUrl } from "../../services/apiClient";

// Predefined search keywords
const SEARCH_KEYWORDS = ["Portfolio", "Food", "Hotel", "E-commerce"];

// Memoized Search Icon Component
const SearchIcon = memo(() => (
  <svg
    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
));
SearchIcon.displayName = "SearchIcon";

// Memoized Keyword Button Component
const KeywordButton = memo(({ keyword, isSelected, isAnySelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-full font-semibold border transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-xs md:text-base flex-shrink-0 ${
      isSelected
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md"
        : isAnySelected
        ? "bg-gray-50 text-gray-500 border-gray-200 opacity-50 hover:opacity-70"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm"
    }`}
    aria-pressed={isSelected}
    aria-label={`Filter by ${keyword}`}
  >
    {keyword}
  </button>
));
KeywordButton.displayName = "KeywordButton";

// Loader Component
const Loader = memo(() => (
 <div className="flex justify-center items-center flex-col py-8">
  <div className="flex space-x-2 mb-4">
    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
  </div>
</div>
));
Loader.displayName = "Loader";

// Memoized No Results Component
const NoResults = memo(() => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return (
      <div className="text-center col-span-full mt-8 p-6 md:p-8 bg-gray-50 rounded-lg border border-gray-200">
        <Loader />
      </div>
    );
  }

  return (
    <div className="text-center col-span-full mt-8 p-6 md:p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-600 text-base md:text-lg font-medium">No templates found</p>
      <p className="text-gray-500 text-xs md:text-sm mt-2">
        Try adjusting your filters or search terms
      </p>
    </div>
  );
});
NoResults.displayName = "NoResults";

// Main Component
const TemplateGrid = ({ 
  templates = [], 
  isTutorialActive = false,
  onBookTemplate // ✅ NEW PROP
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [randomSeed, setRandomSeed] = useState(Math.random());

  // ✅ Track screen width
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // ✅ Screen width detection
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Calculate grid columns based on screen width and tutorial state
  const gridColumns = useMemo(() => {
    if (screenWidth < 700) {
      return "grid-cols-1";
    } else if (screenWidth >= 700 && screenWidth < 840) {
      return isTutorialActive ? "grid-cols-1" : "sm:grid-cols-2";
    } else if (screenWidth >= 840 && screenWidth < 974) {
      return isTutorialActive ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2";
    } else {
      return isTutorialActive ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3";
    }
  }, [screenWidth, isTutorialActive]);

  // Processed templates
  const processedTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return [];
    return templates.map((t) => ({
      ...t,
      previewImage: getServerImageUrl(t.previewImage),
      originalImagePath: t.previewImage,
    }));
  }, [templates]);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set();
    processedTemplates.forEach((t) => t.category && cats.add(t.category));
    return Array.from(cats).sort();
  }, [processedTemplates]);

  // Filtering + sorting
  const filteredTemplates = useMemo(() => {
    let filtered = [...processedTemplates];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(lower)) ||
          (t.title && t.title.toLowerCase().includes(lower)) ||
          (t.description && t.description.toLowerCase().includes(lower)) ||
          (t.category && t.category.toLowerCase().includes(lower))
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);
    if (!isNaN(minPrice)) filtered = filtered.filter((t) => (t.price || 0) >= minPrice);
    if (!isNaN(maxPrice)) filtered = filtered.filter((t) => (t.price || 0) <= maxPrice);

    if (sortBy === "random") {
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    } else {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          case "price-low":
            return (a.price || 0) - (b.price || 0);
          case "price-high":
            return (b.price || 0) - (a.price || 0);
          case "oldest":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "newest":
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
    }
    return filtered;
  }, [processedTemplates, searchTerm, selectedCategory, priceRange.min, priceRange.max, sortBy, randomSeed]);

  // Handlers
  const handleRandomize = useCallback(() => {
    setSortBy("random");
    setRandomSeed(Math.random());
  }, []);
  const handleKeywordClick = useCallback((k) => {
    setSearchTerm(k);
    setSelectedKeyword(k);
  }, []);
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedKeyword(SEARCH_KEYWORDS.includes(value) ? value : "");
  }, []);
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedKeyword("");
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
    setRandomSeed(Math.random());
  }, []);

  const hasActiveFilters = useMemo(
    () => searchTerm || selectedCategory !== "all" || priceRange.min || priceRange.max,
    [searchTerm, selectedCategory, priceRange.min, priceRange.max]
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-3 md:p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="relative flex-grow w-full md:w-auto">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 md:pl-10 pr-3 py-1.5 md:py-2 w-full text-sm md:text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Min ₹"
          value={priceRange.min}
          onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
          className="border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-20 md:w-24 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          min="0"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={priceRange.max}
          onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
          className="border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 w-20 md:w-24 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          min="0"
        />

        <select
          value={sortBy === "random" ? "newest" : sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
        </select>

        <button
          onClick={handleRandomize}
          className="border border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg px-2 md:px-3 py-1.5 md:py-2 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all flex justify-center items-center gap-2 cursor-pointer"
        >
          <span>
            <img src="./dice.gif" alt="🎲" className="w-5"/></span> <span>Randomize</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-blue-600 font-semibold underline px-2 md:px-3 py-1 text-sm md:text-base hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Keywords */}
      <div className="mb-6 px-2 md:px-4">
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
          {SEARCH_KEYWORDS.map((k) => (
            <KeywordButton
              key={k}
              keyword={k}
              isSelected={selectedKeyword === k}
              isAnySelected={selectedKeyword !== ""}
              onClick={() => handleKeywordClick(k)}
            />
          ))}
        </div>
      </div>

      {/* ✅ Templates Grid with dynamic columns AND onBookTemplate */}
      <div className={`grid ${gridColumns} gap-10`}>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TemplateCard 
              key={template._id} 
              template={template}
              onBookTemplate={onBookTemplate} // ✅ PASS IT HERE
            />
          ))
        ) : (
          <NoResults />
        )}
      </div>

      {/* Count */}
      {filteredTemplates.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-blue-600">
            {filteredTemplates.length}
          </span>{" "}
          template{filteredTemplates.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default TemplateGrid;
