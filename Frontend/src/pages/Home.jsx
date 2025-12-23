import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";

// Memoized Typewriter Component
const TypewriterEffect = memo(({ texts, speed = 100, delay = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const fullText = texts[currentTextIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < fullText.length) {
          setCurrentText(fullText.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        if (charIndex > 0) {
          setCurrentText(fullText.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, currentTextIndex, isDeleting, texts, speed, delay]);

  return (
    <span className="relative text-[#000] text-5xl">
      {currentText}
      <span className="animate-pulse ml-1 text-gray-400">|</span>
    </span>
  );
});

TypewriterEffect.displayName = 'TypewriterEffect';

// Memoized Step Card
const StepCard = memo(({ number, title, description }) => (
  <Card className="relative p-7 bg-white border-2 border-gray-100 hover:border-[#6498fe] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group backdrop-blur-sm">
    <div className="absolute -top-6 left-6 bg-gradient-to-br from-[#6498fe] via-blue-600 to-purple-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
      {number}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-3 mt-4 group-hover:text-[#6498fe] transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      {description}
    </p>
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:w-full transition-all duration-500"></div>
  </Card>
));

StepCard.displayName = 'StepCard';

// Memoized Feature Card
const FeatureCard = memo(({ title, description, icon }) => (
  <Card className="relative p-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-gray-100 hover:border-[#6498fe] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500 -mr-16 -mt-16"></div>
    <div className="relative z-10">
      <div className="text-5xl mb-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 inline-block">
        <img src={icon} alt="." className="w-20"/>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6498fe] transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

// FAQ Accordion Item Component
const FAQItem = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-5 overflow-hidden border-2 border-gray-200 hover:border-[#6498fe] transition-all duration-300 hover:shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-7 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-bold text-gray-900 pr-8 group-hover:text-[#6498fe] transition-colors duration-300">
          {question}
        </h3>
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#6498fe] to-blue-600 flex items-center justify-center text-white font-bold text-2xl transition-all duration-500 shadow-lg group-hover:shadow-xl cursor-cell ${
            isOpen ? 'rotate-45 scale-110' : 'group-hover:scale-110'
          }`}
        >
          +
        </div>
      </button>
      
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-7 pb-7 pt-2">
          <div className="pl-5 border-l-4 border-[#6498fe] bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-r-xl shadow-inner">
            <p className="text-gray-700 leading-relaxed font-medium">{answer}</p>
          </div>
        </div>
      </div>
    </Card>
  );
});

FAQItem.displayName = 'FAQItem';

// Advanced Pricing Card Component

const PricingCard = memo(({ title, price, websites, bestFor, features, popular, gradient, badge }) => {
  const pricePerWebsite = Math.round(price / parseInt(websites));
  
  return (
    <Card className={`relative p-10 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group overflow-hidden ${
      popular 
        ? 'border-[#6498fe] shadow-2xl scale-105 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50' 
        : 'border-gray-200 hover:border-[#6498fe] bg-white'
    }`}>
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6498fe] via-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
      
      {/* Badge Image - Top Left */}
      {/* <div className="absolute top-4 left-4 z-20">
        <img 
          src={badge} 
          alt={`${title} badge`} 
          className="w-12 h-12 object-contain group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg"
        />
      </div> */}

      
      
      <div className="relative z-10 text-center mb-8">
        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-[#6498fe] transition-colors duration-300">
          {title}
        </h3>
        <div className="relative inline-block mb-4">
          <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500`}>
            ₹{price.toLocaleString('en-IN')}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-full"></div>
        </div>
        <p className="text-gray-700 font-semibold text-xl mb-1"><span className="font-bold">{websites}</span> websites</p>
        <p className="text-gray-600 font-semibold text-base mb-2">
         ( {pricePerWebsite === 1538 ? "~₹1,500" : `₹${pricePerWebsite.toLocaleString('en-IN')}`} per website )
        </p>
        <br />
        <p className="text-sm text-gray-500 italic px-4">{bestFor}</p>
      </div>


      <div className="relative z-10 space-y-4 mb-10">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 group/item">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md group-hover/item:scale-125 transition-transform duration-300">
              <span className="text-white font-bold text-xs">✓</span>
            </div>
            <span className="text-gray-700 text-sm leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors duration-300">
              {feature}
            </span>
          </div>
        ))}
      </div>


      <a href="tel:+917728846516" className="block relative z-10">
        <Button
          className={`w-full font-bold py-5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden group/btn cursor-pointer ${
            popular
              ? 'bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
              : 'bg-black text-gray-900 border-2 border-gray-300 hover:bg-gradient-to-r hover:from-[#6498fe] hover:to-purple-600 hover:text-white hover:border-[#6498fe]'
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Get Plan</span>
            <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </a>
    </Card>
  );
});

PricingCard.displayName = 'PricingCard';



const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Scroll animation state for stats
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const typewriterTexts = useMemo(() => [
    "without hiring developers",
    "in 3 business days",
    "with predictable pricing"
  ], []);

  const steps = useMemo(() => [
    {
      number: "1",
      title: "Choose a plan & book a call",
      description: "Pick the plan that fits your pipeline (or go per-website), then jump on a quick call to align expectations."
    },
    {
      number: "2",
      title: "Get your partner dashboard",
      description: "After onboarding, you get access to a simple dashboard showing your plan, remaining websites, and template/design IDs."
    },
    {
      number: "3",
      title: "Pick a template with your client",
      description: "Use our 50+ templates, choose a design with your client, and submit only the Design ID in the dashboard. No heavy forms."
    },
    {
      number: "4",
      title: "Website delivered in 3 business days",
      description: "Once content is clear, we deliver the website in 3 business days. You present it to your client under your own brand."
    }
  ], []);

  const benefits = useMemo(() => [
    {
      icon: "./jcb.png",
      title: "Infrastructure, not another tool",
      description: "No need to learn new tools or drag-and-drop builders. You just pick a template and share a Design ID – we handle the build."
    },
    {
      icon: "./hand.png",
      title: "No client conflict",
      description: "We never compete with you for clients. You own the relationship, pricing, and credit; we stay invisible in the background."
    },
    {
      icon: "./money.png",
      title: "Predictable costs, zero hiring",
      description: "Forget salaries, HR, or managing multiple freelancers. Use simple yearly plans or per-website pricing to keep your margins healthy."
    }
  ], []);

 const pricingPlans = useMemo(() => [
  {
    title: "Starter",
    price: 30000,
    websites: "12",
    bestFor: "Solo freelancers with steady clients",
    features: [
      "50+ professional templates",
      "3-day delivery guarantee",
      "Fully white-label",
      "Standard customization",
      "Email support"
    ],
    popular: false,
    gradient: "from-blue-600 to-blue-700",
    badge: "/silver.png" // Added
  },
  {
    title: "Growth",
    price: 60000,
    websites: "30",
    bestFor: "Small teams and boutique agencies",
    features: [
      "Everything in Starter",
      "Priority delivery queue",
      "Advanced customization",
      "Dedicated support channel",
      "Free rollover websites"
    ],
    popular: true,
    gradient: "from-[#6498fe] to-purple-600",
    badge: "/gold.png" // Added
  },
  {
    title: "Scale",
    price: 100000,
    websites: "65",
    bestFor: "High-volume agencies",
    features: [
      "Everything in Growth",
      "Custom scope flexibility",
      "Account manager assigned",
      "24/7 priority support",
      "Custom contract terms"
    ],
    popular: false,
    gradient: "from-purple-600 to-pink-600",
    badge: "/diamond.png" // Added
  }
], []);

  const faqs = useMemo(() => [
    {
      question: "Do I pay on the website?",
      answer: "No. The website is for clarity and booking. We confirm fit and details on a short call, then share a payment link and activate your dashboard access."
    },
    {
      question: "What if I don't use all websites in my yearly plan?",
      answer: "Rollover and usage policies are explained during onboarding, so you know exactly what to expect before you pay."
    },
    {
      question: "What exactly do I get for ₹3,500 per website?",
      answer: "A standard marketing website using one of our templates, customized with your client's branding and content, delivered in 3 business days after content is confirmed."
    },
    {
      question: "Who handles hosting?",
      answer: "We can deploy to Vercel or discuss other options on the call. You stay in control of domains and client relationships."
    },
    {
      question: "Can I white-label everything?",
      answer: "Absolutely! Your clients will only see your brand. We stay completely invisible in the background as your delivery infrastructure."
    }
  ], []);





  const displayName = useMemo(() =>
    user?.name || user?.username,
    [user?.name, user?.username]
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Decorative Border Top */}
      <div className="h-1.5 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600" aria-hidden="true"></div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-28 overflow-hidden">
        {/* Advanced animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-10 leading-tight">
              <span className="text-blue-400 block mb-3">
                 3Digree
              </span>
              <span className="block text-black" style={{ minHeight: "1.2em" }}>
                <TypewriterEffect
                  texts={typewriterTexts}
                  speed={100}
                  delay={4500}
                />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              3Digree is a website delivery infrastructure for freelancers and agencies. Use{" "}
              <span className="text-[#6498fe] font-bold">50+ battle-tested templates</span> and a backend dev team so you can stay focused on clients and sales.
            </p>

           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
  
  <a href="#pricing">
    <button
      className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-12 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-lg relative overflow-hidden group cursor-pointer inline-flex items-center justify-center"
      style={{ borderRadius: "16px" }}
    >
      <span className="relative z-10 flex items-center gap-3">
        <span>View Pricing Plans</span>
        <span className="group-hover:rotate-90 transition-transform duration-300">💎</span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  </a>

  <a href="tel:+917728846516">
    <button
      className="w-full sm:w-auto bg-white/95 backdrop-blur-sm border-2 border-gray-200 text-gray-900 hover:border-[#6498fe] hover:bg-white font-bold px-12 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg cursor-pointer inline-flex items-center justify-center gap-2"
      style={{ borderRadius: "16px" }}
    >
      <span className="text-red-500">📞</span>
      <span>Book a 15-min Call</span>
    </button>
  </a>
  
</div>


            {isAuthenticated && displayName && (
              <div className="mb-12 inline-block">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#6498fe] via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl px-10 py-5 shadow-xl">
                    <p className="text-gray-700 font-medium text-lg">
                      Welcome back,{" "}
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600 text-xl">
                        {displayName}
                      </span>
                      ! 👋
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Stats with Scroll Animation */}
            <div 
              ref={statsRef}
              className="mt-16 grid grid-cols-3 gap-10 max-w-3xl mx-auto"
            >
              {[
                { number: "50+", label: "Templates", icon: "/svg/lots.svg" },
                { number: "3", label: "Days Delivery", icon: "/svg/day.svg" },
                { number: "100%", label: "White-label", icon: "/svg/happy.svg" }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group"
                  style={{
                    animation: isStatsVisible 
                      ? `slideUpScale 0.8s ease-out ${index * 0.2}s forwards`
                      : 'none',
                    opacity: isStatsVisible ? 1 : 0,
                    transform: isStatsVisible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.5)'
                  }}
                >
                  <div className="relative inline-block mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6498fe] to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <div className="relative text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:scale-110 transition-transform duration-500">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-bold flex items-center justify-center gap-2">
                    <span>{stat.label}</span>
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">
                      <img src={stat.icon} alt="." className="w-10" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#pricing" className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#6498fe] transition-colors duration-300">
            <span className="text-xs font-semibold">See Pricing</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-full px-8 py-4 shadow-xl">
                <span className="text-2xl">💎</span>
                <span className="text-sm font-bold text-white">Transparent Pricing</span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Select the plan that matches your agency's deal flow and scale effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-24 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.title} {...plan} />
            ))}
          </div>




        <div className="max-w-5xl mx-auto">
  <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl p-8 sm:p-10 relative overflow-hidden hover:shadow-2xl transition-all duration-500">
    {/* Subtle decorative elements */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-5 rounded-full blur-3xl"></div>
    
    <div className="relative z-10">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#6498fe] to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
          💡
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
            Not ready for a yearly plan?
          </h3>
          <p className="text-gray-600 text-base sm:text-lg font-medium mt-1">
            Pay per project with the same quality
          </p>
        </div>
      </div>
      
      {/* Pricing Box */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border-2 border-gray-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 block mb-1">Single Website Delivery</span>
            <span className="text-sm text-gray-500 font-medium">One-time payment, no commitment</span>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">
              ₹3,500
            </div>
            <div className="text-xs text-gray-500 mt-1 font-semibold">Single Website</div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {[
            { text: "Standard website", icon: "./svg/globe.svg" },
            { text: "50+ templates", icon: "/svg/lots.svg" },
            { text: "3-day delivery", icon: "/svg/day.svg" }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xs">✓</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-700 font-semibold">{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <a href="tel:+917728846516">
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 sm:px-14 py-4 sm:py-5 shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg relative overflow-hidden group cursor-pointer rounded-xl inline-flex items-center justify-center hover:scale-105"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {/* <span>📞</span> */}
              <span>Get Plan</span>
              {/* <span>Book a 15-min Call</span> */}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </a>
      </div>
    </div>
  </Card>
</div>




        </div>
      </section>

      {/* Problem → Solution Section */}
      <section className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
              You have clients.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                Delivery is the bottleneck.
              </span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-[#6498fe] to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl  flex items-center justify-center text-3xl  ">
                  ❌
                </div>
                <h3 className="text-3xl font-black text-gray-900">The Problem</h3>
              </div>
              
              {[
                "Every new project means finding and managing a new developer",
                "Sales are coming in, but website delivery is slow and unpredictable",
                "You juggle timelines, revisions, and tech issues instead of closing more clients"
              ].map((pain, index) => (
                <Card key={index} className="p-7 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-red-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                  <p className="text-gray-800 leading-relaxed font-semibold group-hover:text-red-700 transition-colors duration-300">
                    {pain}
                  </p>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl   flex items-center justify-center text-3xl  ">
                  ✅
                </div>
                <h3 className="text-3xl font-black text-gray-900">The Solution</h3>
              </div>
              
              {[
                "Dedicated backend website delivery, without hiring a team",
                "Standard 3-business-day delivery once content is ready",
                "Fully white-label – your client only sees your brand, not 3 Digree"
              ].map((solution, index) => (
                <Card key={index} className="p-7 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                  <p className="text-gray-800 leading-relaxed font-semibold group-hover:text-green-700 transition-colors duration-300">
                    {solution}
                  </p>
                </Card>
              ))}
            </div>
          </div>

              <div className="mt-20 text-center">
  <div className="inline-block relative group">
    <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-[#6498fe] via-purple-600 to-pink-600 rounded-2xl blur-md sm:blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 sm:px-12 py-4 sm:py-8 rounded-2xl shadow-2xl">
      <p className="text-lg sm:text-2xl font-black flex items-center gap-2 sm:gap-3 justify-center">
        <span>
          <img src="./hand.png" alt="."  className="w-14"/>
        </span>
        <span>3 Digree becomes your silent dev partner – you own the client, we own the delivery</span> 
      </p>
    </div>
  </div>
</div>


        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 cursor-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
              Simple, predictable delivery flow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              From onboarding to delivery, we've streamlined everything so you can focus on what matters
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>

          <div className="mt-16 text-center cursor-default">
            <div className="inline-block bg-white border-2 border-blue-200 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <p className="text-sm text-gray-600 italic font-semibold flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <span>For complex or custom builds, timelines are agreed on during the call</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Capabilities Section */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] via-purple-600 to-pink-600">
                50+ templates
              </span>{" "}
              built for real client work
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-medium">
              Use a library of 50+ templates for service businesses, local businesses, coaches, agencies, and more. Every template is designed to convert and is optimized for fast delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { icon: "✅", text: "50+ client-ready layouts you can confidently show in meetings", gradient: "from-[#6498fe] to-blue-600" },
              { icon: "🎨", text: "Customize colors, fonts, images, copy, and add/remove sections as needed", gradient: "from-purple-500 to-pink-600" },
              { icon: "⚡", text: "You and your client pick a design, send the Design ID, and we handle the build", gradient: "from-yellow-500 to-orange-600" }
            ].map((item, index) => (
              <Card key={index} className="p-8 border-2 border-gray-200 hover:border-[#6498fe] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group bg-white">
                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  <p className="text-gray-800 leading-relaxed font-bold pt-3 group-hover:text-[#6498fe] transition-colors duration-300">
                    {item.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why 3 Digree Section */}
      <section className="py-28 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
              Why partner with 3 Digree?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              We're not just another tool – we're your delivery infrastructure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit) => (
              <FeatureCard
                key={benefit.title}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">
              Common questions partners ask
            </h2>
            
          </div>

          <div>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-28 bg-gradient-to-br from-[#6498fe] via-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-black mb-10 leading-tight">
            Ready to scale your agency without hiring?
          </h2>
          <p className="text-2xl text-blue-50 mb-16 leading-relaxed max-w-3xl mx-auto font-medium">
            If you already have or can get web clients, you don't need an in-house dev team.{" "}
            <span className="text-white font-bold">You need a delivery infrastructure.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
           <a href="tel:+917728846516">
  <button
    className="w-full sm:w-auto border-2 border-white/30 ease-in-out bg-blue-800 text-white font-black px-16 py-7 shadow-2xl hover:border-white hover:bg-blue-900 hover:shadow-3xl transition-all duration-300 text-xl relative overflow-hidden group cursor-pointer inline-flex items-center justify-center"
    style={{ borderRadius: "16px" }}
  >
    <span className="relative z-10 flex items-center gap-3">
      <span>📞</span>
      <span>Book a 15-min Call</span> 
    </span>
  </button>
</a>


            
          </div>

          <div className="flex items-center justify-center gap-12 flex-wrap opacity-90">
            {[
              { number: "50+", label: "Templates", icon: "/svg/lots.svg" },
                { number: "3 Days", label: "Days Delivery", icon: "/svg/day.svg" },
                { number: "100%", label: "White-label", icon: "/svg/happy.svg" }
            ].map((stat, index) => (
              <React.Fragment key={index}>
                <div className="text-center group cursor-default">
                  <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                  <div className="text-sm text-blue-100 font-bold flex items-center gap-2">
                    <span>{stat.label}</span>
                    <span className="text-xl">
                      <img src={stat.icon} alt="." className="w-10" />
                      
                      </span>
                  </div>
                </div>
                {index < 2 && <div className="hidden sm:block w-px h-16 bg-white/30"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
          { text: "About Us", href: "#" },
          { text: "Home", href: "/" },
          { text: "Contact", href: "#" }
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


      {/* Decorative Border Bottom */}
      <div className="h-1.5 bg-gradient-to-r from-[#4884fc] via-blue-600 to-purple-600" aria-hidden="true"></div>

      <style>{`
        @keyframes slideUpScale {
          0% {
            opacity: 0;
            transform: translateY(100px) scale(0.5);
          }
          60% {
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
