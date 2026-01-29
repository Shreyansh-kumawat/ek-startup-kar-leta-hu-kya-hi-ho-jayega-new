import React, { useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaRocket, FaShieldAlt, FaCode, FaCheckCircle, FaClock, FaChartLine, FaHandshake } from 'react-icons/fa';


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
    "3 Days Delivery",
    "Template-Based System",
    "White Label Solution",
    "Your Brand, Our Work",
    "Predictable Quality",
    "Scalable Infrastructure",
    "No Hiring Hassles",
    "Better Margins"
  ];


  const targetAudience = [
    "Freelancers delivering 100+ websites/year",
    "Small IT Companies (2-10 people)",
    "Digital Marketing Agencies",
    "Web Design Studios",
    "Business Consultants",
    "Sales-Focused Agencies",
    "Solopreneurs Scaling Up",
    "Service Providers Going Digital"
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

        /* ✨ Invisible Text Effect */
        .invisible-text {
          position: relative;
          display: inline-block;
        }

        .hover-active .invisible-text {
          color: transparent;
          text-shadow: none;
          filter: blur(8px);
          opacity: 0;
          transform: scale(0.9);
        }

        .invisible-text::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.7s ease-in-out;
          z-index: -1;
        }

        .hover-active .invisible-text::before {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .hover-active .invisible-text {
            filter: blur(12px);
          }
        }
      `}</style>


      {/* Hero Section */}
      <section id="hero-section" className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-[#cefcf7] py-20 px-6 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
              <span className="text-[#cefcf7] font-semibold text-sm tracking-wider">WEBSITE DELIVERY INFRASTRUCTURE</span>
            </div>
          </div>


          <div className="text-center mb-12">
            {/* ✨ UPDATED H1 WITH INVISIBLE EFFECT */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Your{' '}
              <span 
                className="relative inline-block cursor-pointer group"
                onMouseEnter={(e) => e.currentTarget.classList.add('hover-active')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('hover-active')}
                onClick={(e) => e.currentTarget.classList.toggle('hover-active')}
              >
                <span className="invisible-text text-[#00ffab] transition-all duration-700 ease-in-out">
                  Invisible
                </span>
              </span>
              {' '}Dev Team
            </h1>
            
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 mb-8">
              <p className="text-xl md:text-2xl font-semibold text-[#cefcf7]">
                You Close. We Build. You Deliver.
              </p>
            </div>


            <p className="text-lg md:text-xl text-[#cefcf7]/90 leading-relaxed max-w-4xl mx-auto mb-8">
              3Digree is the backend infrastructure for freelancers and small IT companies. We handle the building and deployment while you focus on clients and sales.
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">3 Days</p>
              <p className="text-sm text-[#cefcf7] mt-1">Delivery Time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">White Label</p>
              <p className="text-sm text-[#cefcf7] mt-1">We Stay Invisible</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold text-[#00ffab]">Your Brand</p>
              <p className="text-sm text-[#cefcf7] mt-1">Your Pricing</p>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#how-it-works" 
              className="bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              See How It Works
            </a>
            <a 
              href="https://wa.me/918741967971"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-[#cefcf7] font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              <FaWhatsapp className="inline mr-2" />
              Partner With Us
            </a>
          </div>
        </div>
      </section>


      {/* The Problem Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-4">
            The <span className="text-blue-500">Delivery Bottleneck</span>
          </h2>
          <p className="text-center text-gray-700 text-lg mb-12 max-w-3xl mx-auto">
            If you're a freelancer or running a small agency, you know this pain
          </p>


          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-8 border-2 border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="text-5xl mb-4 text-red-500">⏱️</div>
              <h3 className="text-xl font-bold text-black mb-3">Time Drain</h3>
              <p className="text-gray-700 leading-relaxed">
                You spend weeks building the same types of websites over and over. Your delivery becomes the bottleneck.
              </p>
            </div>


            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="text-5xl mb-4 text-orange-500">💸</div>
              <h3 className="text-xl font-bold text-black mb-3">Hiring Hassles</h3>
              <p className="text-gray-700 leading-relaxed">
                Hiring developers project-by-project is expensive and unpredictable. Quality varies, timelines slip.
              </p>
            </div>


            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 border-2 border-yellow-200 hover:shadow-xl transition-all duration-300">
              <div className="text-5xl mb-4 text-yellow-600">📉</div>
              <h3 className="text-xl font-bold text-black mb-3">Shrinking Margins</h3>
              <p className="text-gray-700 leading-relaxed">
                Your margins shrink because delivery costs are high. Scaling feels impossible without sacrificing quality.
              </p>
            </div>
          </div>


          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
            <p className="text-2xl font-bold text-black mb-2">
              Clients keep coming, but you can't scale delivery
            </p>
            <p className="text-gray-700 text-lg">
              That's exactly where 3Digree steps in
            </p>
          </div>
        </div>
      </section>


      {/* How We Work Section */}
      <section id="how-it-works" className="py-16 px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#cefcf7] mb-4">
            How <span className="text-[#00ffab]">3Digree</span> Works
          </h2>
          <p className="text-center text-[#cefcf7]/90 text-lg mb-12 max-w-2xl mx-auto">
            Simple, transparent, and designed to make you the hero
          </p>


          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-[#cefcf7] mb-3">1. You Close the Deal</h3>
              <p className="text-[#cefcf7]/90 leading-relaxed">
                You set the pricing. You own the client relationship. We never talk to your clients directly.
              </p>
            </div>


            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-[#cefcf7] mb-3">2. We Build in 3 Business Days</h3>
              <p className="text-[#cefcf7]/90 leading-relaxed">
                Using our tested Website system, we build and deploy the website fast. Quality guaranteed, every time.
              </p>
            </div>


            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-[#cefcf7] mb-3">3. You Deliver & Win</h3>
              <p className="text-[#cefcf7]/90 leading-relaxed">
                Your client never sees us. You deliver under your brand, take the credit, and keep your margins healthy.
              </p>
            </div>
          </div>


          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <p className="text-2xl font-bold text-[#00ffab] mb-2">We Stay in the Backend</p>
            <p className="text-[#cefcf7] text-lg">
              Your client never knows we exist. That's the promise.
            </p>
          </div>
        </div>
      </section>


      {/* Who This Is For */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-4">
            Who <span className="text-blue-500">3Digree</span> Is Built For
          </h2>
          <p className="text-center text-gray-700 text-lg mb-12 max-w-2xl mx-auto">
            If you're one of these, we're your perfect backend partner
          </p>


          <div className="grid md:grid-cols-4 gap-4">
            {targetAudience.map((audience, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border border-blue-100"
              >
                <FaCheckCircle className="text-blue-500 text-3xl mx-auto mb-3" />
                <p className="text-gray-800 font-semibold">{audience}</p>
              </div>
            ))}
          </div>


          <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
            <p className="text-xl font-bold text-black mb-2">
              Want predictable delivery without expanding your team?
            </p>
            <p className="text-gray-700">
              That's exactly what 3Digree delivers.
            </p>
          </div>
        </div>
      </section>


      {/* What You Get */}
      <section className="py-16 px-6 bg-blue-500">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#cefcf7] mb-4">
            What You Get with <span className="text-[#00ffab]">3Digree</span>
          </h2>
          <p className="text-center text-[#cefcf7]/90 text-lg mb-12 max-w-2xl mx-auto">
            Everything you need to scale your delivery, nothing you don't
          </p>


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


          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <FaClock className="text-[#00ffab] text-4xl mx-auto mb-3" />
              <p className="text-[#cefcf7] font-bold text-lg mb-2">Speed That Scales</p>
              <p className="text-[#cefcf7]/80 text-sm">Consistent 3 days turnaround</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <FaChartLine className="text-[#00ffab] text-4xl mx-auto mb-3" />
              <p className="text-[#cefcf7] font-bold text-lg mb-2">Better Margins</p>
              <p className="text-[#cefcf7]/80 text-sm">No hiring, no overhead costs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <FaHandshake className="text-[#00ffab] text-4xl mx-auto mb-3" />
              <p className="text-[#cefcf7] font-bold text-lg mb-2">Your Brand Only</p>
              <p className="text-[#cefcf7]/80 text-sm">100% white label delivery</p>
            </div>
          </div>
        </div>
      </section>


      {/* Why We Exist */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-12">
            Why <span className="text-blue-500">3Digree</span> Exists
          </h2>


          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaCode className="text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Built from Experience</h3>
              <p className="text-gray-700 leading-relaxed">
                We built 3Digree to solve our own website delivery problem. We were freelancers stuck in the same bottleneck.
              </p>
            </div>


            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaRocket className="text-5xl text-[#00ffab] mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Universal Problem</h3>
              <p className="text-gray-700 leading-relaxed">
                Then we realized every freelancer and small agency faces the same challenge. Delivery becomes the ceiling for growth.
              </p>
            </div>


            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <FaShieldAlt className="text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Your Infrastructure Partner</h3>
              <p className="text-gray-700 leading-relaxed">
                Now we're the invisible infrastructure partner that makes your delivery faster, your margins better, and your growth possible.
              </p>
            </div>
          </div>


          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
            <p className="text-2xl font-bold text-black mb-3">
              We're not just a service provider
            </p>
            <p className="text-gray-700 text-lg">
              We're your invisible dev team, your delivery infrastructure, your growth enabler
            </p>
          </div>
        </div>
      </section>


      {/* Founders Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Meet the <span className="text-blue-500">Founders</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Two freelancers who solved their own delivery problem—and now help you solve yours
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
                  alt="Shreyansh Kumawat - Co-Founder, CTO & CMnO" 
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-2">Shreyansh Kumawat</h3>
                <p className="text-blue-500 font-semibold mb-4 text-lg">Co-Founder, CTO & CMnO</p>
                
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
              We've been in your shoes. Now we're <span className="font-semibold text-blue-500">building the infrastructure we wish we had</span>
            </p>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#cefcf7] mb-6">
            Ready to <span className="text-[#00ffab]">Scale Your Delivery</span>?
          </h2>
          <p className="text-[#cefcf7] text-lg mb-10">
            Let's talk about how 3Digree can become your backend infrastructure partner
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="https://wa.me/918741967971" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#00ffab] hover:bg-[#00ffab]/90 text-blue-900 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="text-2xl" />
              <span>Partner With Us on WhatsApp</span>
            </a>
            
            <a 
              href="tel:+918741967971" 
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-[#cefcf7] font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              <FaPhone className="text-xl" />
              <span>Call Now</span>
            </a>
          </div>


          <div className="mt-8 space-y-3">
            <p className="text-[#cefcf7] flex items-center justify-center gap-3">
              <FaPhone className="text-[#00ffab]" />
              <span className="font-semibold">+91 8741967971</span>
              <span className="text-[#cefcf7]/40">|</span>
              <span className="font-semibold">+91 7728846516</span>
            </p>
            <a 
              href="mailto:info.3digree@gmail.com"
              className="text-[#00ffab] hover:text-[#00ffab]/80 flex items-center justify-center gap-2 font-semibold"
            >
              <FaEnvelope />
              <span>info.3digree@gmail.com</span>
            </a>
          </div>
        </div>

<br />

        {/* website version */}
      <div className="text-xs text-white text-center">Version 3.1</div>
      
      <div className='flex justify-center items-center w-full'>
<hr className='text-white w-8'/>
<hr className='text-green-600 w-3'/>

</div>
  
      </section>

  </div>
  );
};


export default About;
