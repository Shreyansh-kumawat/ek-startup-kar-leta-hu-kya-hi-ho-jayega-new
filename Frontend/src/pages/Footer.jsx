// Frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo2 from '../../public/logo2.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
   <footer className="bg-gradient-to-r from-blue-600 to-purple-600 ">

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
      
      <div className="flex flex-col items-center md:items-start gap-4">
        <img 
          src="/logo2.png" 
          alt="3Digree Logo" 
          className="h-14 w-auto hover:scale-110 transition-transform duration-300"
        />
        <p className="text-gray-400 text-sm font-semibold text-center md:text-left">
          Your Partner in Development, AI and beyond
        </p>
      </div>

      <div className="flex items-center gap-10">
        {[
          { text: "About Us", href: "/about" },
          { text: "Home", href: "/" },
          { text: "Contact", href: "/contact " }
        ].map((link) => (
          <a
            key={link.text}
            href={link.href}
            className="text-gray-300 hover:text-[#6498fe] transition-all duration-300 font-bold text-sm relative group"
          >
            {link.text}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6498fe] group-hover:w-full transition-all duration-300"></span>
          </a>
        ))}
      </div>

      <div className="flex flex-col items-center md:items-end gap-5">
        <div className="flex items-center gap-6">
          {[
            { href: "https://www.linkedin.com/company/3-digree/posts/?feedView=all", label: "LinkedIn", path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
            { href: "https://www.instagram.com/3digree/", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
            { href: "https://www.facebook.com/profile.php?id=61573177101623", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#6498fe] transition-all duration-300 hover:scale-125 transform"
              aria-label={`Visit our ${social.label}`}
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d={social.path}/>
              </svg>
            </a>
          ))}
        </div>
        <p className="text-gray-100 text-sm font-semibold">
          © {new Date().getFullYear()} 3Digree. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
  );
};

export default Footer;