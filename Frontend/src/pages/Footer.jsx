import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info - Column 1 */}
          <div className="flex flex-col gap-6">
            <img 
              src="/logo2.png" 
              alt="3Digree Logo" 
              className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
            />
            <p className="text-gray-300 text-base leading-relaxed">
              White-label web development partner for agencies and freelancers. Build for your clients, invisibly.
            </p>
            <div className="flex items-center gap-5 mt-2">
              <a
                href="https://www.linkedin.com/company/3-digree/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#0077B5] transition-all duration-300 hover:scale-125 transform"
                aria-label="Visit our LinkedIn"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/3digree/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#E1306C] transition-all duration-300 hover:scale-125 transform"
                aria-label="Visit our Instagram"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573177101623"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#4267B2] transition-all duration-300 hover:scale-125 transform"
                aria-label="Visit our Facebook"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links - Column 2 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {[
                { text: "Home", path: "/" },
                { text: "Pricing", path: "/pricing" },
                { text: "About Us", path: "/about" },
                { text: "Contact", path: "/contact" },
                { text: "Careers", path: "/careers" },
              ].map((link) => (
                <Link
                  key={link.text}
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-all duration-300 text-base hover:translate-x-2 transform inline-block group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-400 group-hover:text-blue-300">&rarr;</span>
                    {link.text}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Labs (Experimental) - Column 3 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
              <span>Labs</span>
              <span className="text-xs font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full tracking-wider">Experimental</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-1">
              Experimental pages and 3D experiences — not part of the main product.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/labs/about"
                className="text-gray-300 hover:text-purple-300 transition-all duration-300 text-base hover:translate-x-2 transform inline-block group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-purple-400 group-hover:text-purple-300">&rarr;</span>
                  3D About Page
                  <span className="text-xs text-purple-400 font-mono">/labs/about</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Contact Info - Column 4 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Contact Us</h3>
            <div className="text-gray-300 text-base space-y-4">
              <div>
                <p className="text-white font-semibold mb-1">Email:</p>
                <a 
                  href="mailto:info.3digree@gmail.com" 
                  className="hover:text-blue-400 transition-colors break-all"
                >
                  info.3digree@gmail.com
                </a>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Phone:</p>
                <a 
                  href="tel:+918741967971" 
                  className="hover:text-blue-400 transition-colors block"
                >
                  +91 8741967971
                </a>
                <a 
                  href="tel:+917728846516" 
                  className="hover:text-blue-400 transition-colors block"
                >
                  +91 7728846516
                </a>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Location:</p>
                <p>Jaipur, Rajasthan, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {currentYear} 3Digree. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex items-center gap-8 text-sm">
              <Link 
                to="/privacypolocy" 
                className="text-gray-200 font-[400] underline-offset-8 underline hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </div>

            {/* Made with Love */}
            <p className="text-gray-400 text-sm text-center md:text-right flex items-center gap-2">
              Made with <span className="text-red-500 animate-pulse">&hearts;</span> by 3Digree Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
