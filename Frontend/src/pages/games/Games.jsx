import React from 'react';

const Games = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0d1b4b] to-[#0a1628] flex items-center justify-center relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center px-6">
        
        {/* Icon */}
        <div className="text-7xl mb-6 animate-bounce">🎮</div>

        {/* 3Digree Logo Text */}
        <div className="mb-4">
          <span className="text-blue-400 font-bold text-lg tracking-widest uppercase">3Digree</span>
          <span className="text-gray-400 text-lg"> / Games</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight">
          Coming
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"> Soon</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto mb-8">
          We're building something exciting. Stay tuned for an amazing gaming experience.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-500 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-blue-900/40 hover:shadow-blue-700/50 hover:scale-105"
        >
          ← Go Back
        </button>

      </div>
    </div>
  );
};

export default Games;
