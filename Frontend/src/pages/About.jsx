import React, { useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaRocket, FaShieldAlt, FaCode, FaCheckCircle } from 'react-icons/fa';

const About = () => {
  useEffect(() => {
    // Bubble generation function
    const createBubble = () => {
      const section = document.getElementById('hero-section');
      if (!section) return;

      const bubble = document.createElement('div');
      bubble.className = 'floating-bubble';
      
      const size = Math.random() * 10 + 1;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      
      const duration = Math.random() * 10 + 15;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;
      
      section.appendChild(bubble);
      
      setTimeout(() => {
        bubble.remove();
      }, (duration + 5) * 1000);
    };

    for (let i = 0; i < 15; i++) {
      setTimeout(() => createBubble(), i * 400);
    }

    const interval = setInterval(createBubble, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    "Unlimited Images & Videos",
    "Unlimited Bandwidth & Space",
    "100% Responsive Website",
    "Meta Tags + SEO Friendly",
    "WhatsApp Integration",
    "Call Button Integration",
    "SSL Certificate",
    "Social Media Integration"
  ];

  const industries = [
    "Startups & Tech Ventures",
    "EdTech & Coaching",
    "E-commerce & D2C Brands",
    "FinTech & Finance Services",
    "Healthcare & Wellness",
    "Real Estate & Construction",
    "Events & Creators Economy",
    "Local Businesses Going Digital"
  ];

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(calc(sin(1) * 30px));
            opacity: 0;
          }
        }

        .floating-bubble {
          position: absolute;
          bottom: -100px;
          background: #00ffab;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.2;
          animation: float-up linear infinite;
          box-shadow: 0 0 20px rgba(0, 255, 171, 0.3);
        }

        #hero-section {
          position: relative;
          overflow: hidden;
        }
      `}</style>

      {/* Clean Hero Section with Bubbles */}
      <section id="hero-section" className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-[#cefcf7] py-20 px-6 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
              <span className="text-[#cefcf7] font-semibold text-sm tracking-wider">ABOUT US</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Welcome to <span className="text-[#00ffab]">3Digree</span>
            </h1>
            
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 mb-8">
              <p className="text-xl md:text-2xl font-semibold text-[#cefcf7]">
                The Tech Partner Everyone Loves
              </p>
            </div>

            <p className="text-lg md:text-xl text-[#cefcf7]/90 leading-relaxed max-w-4xl mx-auto mb-8">
              Recognized for speed, innovation, and delivery — 3Digree is your partner in AI, Development, Marketing, and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">24/7</p>
              <p className="text-sm text-[#cefcf7] mt-1">Support</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">AI</p>
              <p className="text-sm text-[#cefcf7] mt-1">Powered</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">100%</p>
              <p className="text-sm text-[#cefcf7] mt-1">Quality</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#pricing" 
              className="bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Get Started Now
            </a>
            <a 
              href="https://wa.me/919256129813"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-[#cefcf7] font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              <FaWhatsapp className="inline mr-2" />
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Affordable Pricing Section */}
      <section className="py-16 px-6 bg-white" id="pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-4">
            Premium Websites at <span className="text-blue-500">Unbelievable Prices</span>
          </h2>
          <p className="text-center text-gray-700 text-lg mb-12 max-w-2xl mx-auto">
            Why so affordable? We leverage <span className="font-semibold text-blue-500">AI-Powered Development</span> to deliver faster without compromising quality!
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="border-2 border-blue-500 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">Single Page Website</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-blue-500">₹1,499</span>
                </div>
                <p className="text-gray-600 mt-2">Perfect for startups & personal brands</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span className="text-gray-700">1 Professional Landing Page</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span className="text-gray-700">Free .in Domain</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span className="text-gray-700">Free Hosting (1st Year)</span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Hosting Renewal</p>
                <p className="text-2xl font-bold text-blue-500">Just ₹599<span className="text-base font-normal">/year</span></p>
                <p className="text-xs text-gray-500 mt-1">Less than ₹50/month!</p>
              </div>
            </div>

            <div className="border-2 border-blue-500 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 text-[#cefcf7] relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#00ffab] text-blue-900 px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Multi-Page Website</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">₹2,499</span>
                </div>
                <p className="text-[#cefcf7]/90 mt-2">Ideal for growing businesses</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span>5+ Professional Pages</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span>Free .in Domain</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-[#00ffab] flex-shrink-0" />
                  <span>Free Hosting (1st Year)</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-sm text-[#cefcf7]/80">Hosting Renewal</p>
                <p className="text-2xl font-bold">Only ₹599<span className="text-base font-normal">/year</span></p>
                <p className="text-xs text-[#cefcf7]/70 mt-1">Affordable long-term solution!</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-black mb-4">Risk-Free Payment Model</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
              <div className="flex-1">
                <p className="text-4xl font-bold text-blue-500 mb-2">25%</p>
                <p className="text-gray-700">Pay upfront to start</p>
              </div>
              <div className="text-3xl text-blue-500">→</div>
              <div className="flex-1">
                <p className="text-4xl font-bold text-blue-500 mb-2">75%</p>
                <p className="text-gray-700">After preview & approval</p>
              </div>
            </div>
            <p className="text-gray-600 mt-6 text-sm">See your website first, then complete the payment!</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-blue-500">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#cefcf7] mb-12">
            Everything You Need, <span className="text-[#00ffab]">Included</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <FaCheckCircle className="text-[#00ffab] text-3xl mx-auto mb-3" />
                <p className="text-[#cefcf7] font-medium">{feature}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-2xl font-bold text-[#00ffab]">24/7 Support</p>
            <p className="text-[#cefcf7] mt-2">We're always here to help you succeed!</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-12">
            Why Choose <span className="text-blue-500">3Digree</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaCode className="text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">AI-Powered Full-Stack Delivery</h3>
              <p className="text-gray-700 leading-relaxed">
                From wireframes to launch — we design, develop, and deploy full-stack solutions powered by AI, automation & smart architecture.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaRocket className="text-5xl text-[#00ffab] mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Smarter. Faster. Safer.</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-assisted dev sprints. Automated testing. Lightning-fast deployments. We ship smarter, not just faster — without breaking a thing.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaShieldAlt className="text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Secure & Scalable by Design</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-monitored systems. Bulletproof code. Cloud-native, auto-scaling infrastructure that just works — no matter the traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Meet Our <span className="text-blue-500">Founders</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The visionaries behind 3Digree, dedicated to revolutionizing web development with AI-powered solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
              <div className="relative mb-6 overflow-hidden rounded-xl">
                <img 
                  src="/f1.png" 
                  alt="Akshat Kumawat - Co-Founder & CEO" 
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-2">Akshat Kumawat</h3>
                <p className="text-blue-500 font-semibold mb-4 text-lg">Co-Founder & CEO</p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Visionary leader driving 3Digree's strategic growth and innovation in AI-powered development solutions.
                </p>
                
                <a 
                  href="https://www.linkedin.com/in/akssshat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
              <div className="relative mb-6 overflow-hidden rounded-xl">
                <img 
                  src="/f2.png" 
                  alt="Shreyansh Kumawat - Co-Founder & CTO" 
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-2">Shreyansh Kumawat</h3>
                <p className="text-blue-500 font-semibold mb-4 text-lg">Co-Founder & CTO</p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Technical architect behind 3Digree's cutting-edge full-stack solutions and AI-powered automation systems.
                </p>
                
                <a 
                  href="https://www.linkedin.com/in/shreyansh-kumawat-405125309/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 text-lg">
              Together, we're building the future of <span className="font-semibold text-blue-500">affordable, AI-powered web development</span>
            </p>
          </div>
        </div>
      </section>

      {/* Industries Served - Simple Version */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#cefcf7] mb-12">
            Industries We <span className="text-[#00ffab]">Empower</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <p className="text-[#cefcf7] font-semibold">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Contact <span className="text-blue-500">Us</span>
          </h2>
          <p className="text-gray-700 text-lg mb-10">
            Let's turn your vision into reality. Contact us today!
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="https://wa.me/919256129813" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="text-2xl" />
              <span>WhatsApp Us</span>
            </a>
            
            <a 
              href="tel:+917728846516" 
              className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-[#cefcf7] font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FaPhone className="text-xl" />
              <span>Call Now</span>
            </a>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-gray-700 flex items-center justify-center gap-3">
              <FaPhone className="text-blue-500" />
              <span className="font-semibold">+91 9256129813</span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold">+91 7728846516</span>
            </p>
            <a 
              href="mailto:info.3digree@gmail.com"
              className="text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 font-semibold"
            >
              <FaEnvelope />
              <span>info.3digree@gmail.com</span>
            </a>
          </div>
        </div>

      </section>

            <div className="text-xs text-gray-700 text-center">Version 2.4</div>
<br />
      
<footer className="bg-gradient-to-br from-black to-gray-900 border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Left: Logo & Tagline */}
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

      {/* Center: Quick Links */}
      <div className="flex items-center gap-6">
        <a
          href="/about"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          About Us
        </a>
        <a
          href="/"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          Wroom Wroom
        </a>
        <a
          href="/contact"
          className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm"
        >
          Contact
        </a>
      </div>

      {/* Right: Social Links & Copyright */}
      <div className="flex flex-col items-center md:items-end gap-3">
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/company/3-digree/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/3digree/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61573177101623"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200"
            aria-label="Visit our Facebook"
          >
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

export default About;
