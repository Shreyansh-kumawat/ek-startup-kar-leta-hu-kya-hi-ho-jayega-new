// src/pages/Templates.jsx
// COMPLETE VERSION without Tutorial

import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTemplates } from "../features/template/api";
import TemplateGrid from "../features/template/TemplateGrid";
import Button from "../components/Button";
import Loader from "../components/Loader";


const PAGE_SIZE = 10000;


// Memoized Error Component
const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
    <div className="text-center bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border-2 md:border-4 border-blue-400 max-w-md w-full">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 text-base md:text-lg mb-4 font-semibold">{error}</p>
      <Button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Try Again
      </Button>
    </div>
  </div>
));

ErrorDisplay.displayName = "ErrorDisplay";


// Memoized Loading Component
const LoadingDisplay = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div className="flex justify-center items-center flex-col">
      <Loader size="xl" />
      <p className="mt-4 text-blue-700 font-semibold">Loading Websites...</p>
    </div>
  </div>
));

LoadingDisplay.displayName = "LoadingDisplay";


const Templates = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoading2, setShowLoading2] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("random");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: searchTerm.trim() || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        priceMin: priceRange.min || undefined,
        priceMax: priceRange.max || undefined,
        sortBy,
      };

      const data = await getAllTemplates(params);

      if (data?.templates) {
        setTemplates(data.templates);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setTemplates([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Failed to load templates. Please try again.");
      setTemplates([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, priceRange.min, priceRange.max, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTemplates();
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [fetchTemplates, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading2(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("random");
    setPage(1);
  }, []);

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchTemplates} />;
  }

  if (loading && showLoading2) {
    return <LoadingDisplay />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div
        className="h-2 md:h-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700"
        aria-hidden="true"
      ></div>

      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 md:py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-md lg:drop-shadow-lg">
            Browse Ready-Made Websites
          </h1>
          <p className="text-center text-blue-700 font-semibold text-sm sm:text-sm md:text-lg mb-6 md:mb-8 px-2 max-[640px]:hidden">
            <span className="sm:text-[12px] md:text-[13px]">Select Design</span> &nbsp;
            <span className="text-black sm:text-[12px] md:text-[13px]">→</span> &nbsp;
            <span className="sm:text-[13px] md:text-[15px]">Book with Credits</span> &nbsp;
            <span className="text-black sm:text-[13px] md:text-[15px]">→</span> &nbsp;
            <span className="sm:text-[14px] md:text-[16px]">We Build</span> &nbsp;
            <span className="text-black sm:text-[14px] md:text-[16px]">→</span> &nbsp;
            <span className="sm:text-[15px] md:text-[17px]">Get Your Website</span>
          </p>

          <p className="text-center text-blue-700 font-semibold text-sm sm:text-sm md:text-lg mb-6 md:mb-8 px-2 min-[640px]:hidden flex flex-col">
            <span className="text-[12px]">Select Design</span>
            <span className="text-black">&darr;</span>
            <span className="text-[13px]">Book with Credits</span>
            <span className="text-black">&darr;</span>
            <span className="text-[15px]">Get Your Website</span>
          </p>

          <TemplateGrid
            templates={templates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            clearFilters={clearFilters}
            isTutorialActive={false}
          />
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-12 sm:py-16 md:py-20 text-center text-white relative overflow-hidden shadow-xl md:shadow-2xl">
        <div className="relative z-10 px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 drop-shadow-md md:drop-shadow-lg">
            Ready to Get Your Website?
          </h2>
          <p className="mb-5 md:mb-6 max-w-xl mx-auto text-sm sm:text-base md:text-lg font-medium px-4">
            Buy credits, select your template, and get your website delivered fast!
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="inline-block bg-white text-blue-700 font-bold px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 rounded-full shadow-xl md:shadow-2xl hover:shadow-blue-300/50 hover:scale-105 transform transition-all duration-300 border-2 md:border-4 border-blue-200 text-sm sm:text-base cursor-pointer"
            aria-label="Buy credits to get started"
          >
            Buy Credits Now
          </button>
        </div>
      </section>

      <div
        className="h-2 md:h-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        aria-hidden="true"
      ></div>

      <footer className="bg-gradient-to-br from-black to-gray-900 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <img 
                src="/logo2.png" 
                alt="3Digree Logo" 
                className="h-10 w-auto"
              />
              <p className="text-gray-400 text-sm font-medium">
                Your Partner in Development, AI and beyond
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="/home" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">Home</a>
              <a href="/about" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">About Us</a>
              <a href="/contact" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">Contact</a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/company/3-digree/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/3digree/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61573177101623" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} 3Digree. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Templates;
