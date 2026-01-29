import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";
import Lenis from 'lenis';


// ✅ SMART CURRENCY HOOK
const useSmartCurrency = () => {
  const [rates, setRates] = useState({ USD: 0.012 });
  const [userRegion, setUserRegion] = useState('IN');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const detectRegion = async () => {
      try {
        const debugRegion = localStorage.getItem('debug_region');
        if (debugRegion) {
          console.log('🧪 DEBUG MODE - Region:', debugRegion);
          setUserRegion(debugRegion);
          setRates({ USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018 });
          setLoading(false);
          return;
        }

        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        console.log('🌍 Detected Region:', ipData.country_code, ipData.country_name);
        setUserRegion(ipData.country_code || 'IN');

        const ratesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);

        setLoading(false);
      } catch (error) {
        console.error('❌ Region detection failed:', error);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('⏰ Timezone fallback:', timezone);

        if (timezone.includes('America')) setUserRegion('US');
        else if (timezone.includes('Europe')) setUserRegion('GB');
        else if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) setUserRegion('IN');
        else setUserRegion('US');

        setRates({ USD: 0.012, GBP: 0.0095, EUR: 0.011 });
        setLoading(false);
      }
    };

    detectRegion();
  }, []);


  const getDisplayPrices = (inrAmount) => {
    const usdAmount = Math.round(inrAmount * rates.USD);

    if (userRegion === 'IN') {
      return {
        main: { amount: inrAmount, symbol: '₹', code: 'INR' },
        secondary: { amount: usdAmount, symbol: '$', code: 'USD' }
      };
    } else if (userRegion === 'US') {
      return {
        main: { amount: usdAmount, symbol: '$', code: 'USD' },
        secondary: null
      };
      
    } else {
      const localCurrencyMap = {
        'GB': { rate: rates.GBP || 0.0095, symbol: '£', code: 'GBP' },
        'CA': { rate: rates.CAD || 0.016, symbol: 'CA$', code: 'CAD' },
        'AU': { rate: rates.AUD || 0.018, symbol: 'A$', code: 'AUD' },
        'DE': { rate: rates.EUR || 0.011, symbol: '€', code: 'EUR' },
        'FR': { rate: rates.EUR || 0.011, symbol: '€', code: 'EUR' },
        'IT': { rate: rates.EUR || 0.011, symbol: '€', code: 'EUR' },
        'ES': { rate: rates.EUR || 0.011, symbol: '€', code: 'EUR' },
      };

      const localCurrency = localCurrencyMap[userRegion];

      if (localCurrency) {
        const localAmount = Math.round(inrAmount * localCurrency.rate);
        return {
          main: { amount: usdAmount, symbol: '$', code: 'USD' },
          secondary: { amount: localAmount, symbol: localCurrency.symbol, code: localCurrency.code }
        };
      } else {
        return {
          main: { amount: usdAmount, symbol: '$', code: 'USD' },
          secondary: null
        };
      }
    }
  };

  return { getDisplayPrices, userRegion, loading };
};


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
    <span className="relative text-gray-700 text-2xl md:text-3xl">
      {currentText}
      <span className="animate-pulse ml-1 text-gray-400">💻</span>
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


// ✅ UPDATED: Pricing Card with Smart Currency
const PricingCard = memo(({ title, price, websites, bestFor, features, popular, gradient, badge, onGetPlan, getDisplayPrices }) => {
  const pricePerWebsite = Math.round(price / parseInt(websites));
  const displayPrices = getDisplayPrices(price);
  const displayPerWebsite = getDisplayPrices(pricePerWebsite);

  return (
    <Card className={`relative p-10 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group overflow-hidden ${
      popular 
        ? 'border-[#6498fe] shadow-2xl scale-105 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50' 
        : 'border-gray-200 hover:border-[#6498fe] bg-white'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#6498fe] via-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

      <div className="relative z-10 text-center mb-8">
        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-[#6498fe] transition-colors duration-300">
          {title}
        </h3>

        <div className="relative inline-block mb-4">
          <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500`}>
            {displayPrices.main.symbol}{displayPrices.main.amount.toLocaleString('en-US')}
          </div>

          {displayPrices.secondary && (
            <div className="text-base font-semibold text-gray-500 mt-1">
              ≈ {displayPrices.secondary.symbol}{displayPrices.secondary.amount.toLocaleString('en-US')} {displayPrices.secondary.code}
            </div>
          )}

          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-full"></div>
        </div>

        <p className="text-gray-700 font-semibold text-xl mb-1">
          <span className="font-bold">{websites}</span> websites
        </p>

        <p className="text-gray-600 font-semibold text-base mb-2">
          ( {displayPerWebsite.main.symbol}{displayPerWebsite.main.amount.toLocaleString('en-US')} per website
          {displayPerWebsite.secondary && (
            <span className="text-sm text-gray-500 ml-1">
              / {displayPerWebsite.secondary.symbol}{displayPerWebsite.secondary.amount} {displayPerWebsite.secondary.code}
            </span>
          )}
          )
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

      <div className="block relative z-10">
        <Button
          onClick={() => onGetPlan(title, price)}
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
      </div>
    </Card>
  );
});

PricingCard.displayName = 'PricingCard';


const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getDisplayPrices, userRegion, loading: currencyLoading } = useSmartCurrency();

  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef(null);


  // ✨ UPDATED BUBBLE EFFECT - Kam bubbles, jaldi arrival
  useEffect(() => {
    const createBubble = () => {
      const section = document.getElementById('hero-section');
      if (!section) return;

      const bubble = document.createElement('div');
      bubble.className = 'floating-bubble';
      
      const size = Math.random() * 12 + 4;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      
      // Random color - Blue or Green
      const isBlue = Math.random() > 0.5;
      bubble.style.background = isBlue ? '#6498fe' : '#10b981';
      
      const duration = Math.random() * 8 + 12;
      bubble.style.animationDuration = `${duration}s`;
      
      section.appendChild(bubble);
      
      setTimeout(() => {
        bubble.remove();
      }, duration * 1000);
    };

    // ✅ Reduced: 10 initial bubbles (was 20)
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createBubble(), i * 100); // ✅ Faster arrival: 100ms (was 200ms)
    }

    // ✅ Less frequent generation: 2500ms (was 1500ms)
    const interval = setInterval(createBubble, 2500);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);


  const scrollToPricing = (e) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


  const handleGetPlan = (planTitle, planPrice) => {
    const planToken = {
      plan: planTitle,
      price: planPrice,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('selectedPlan', JSON.stringify(planToken));

    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };


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
      description: "Use our 100+ Website Designes, choose a design with your client, and submit only the Design ID in the dashboard. No heavy forms."
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
      price: 32000,
      websites: "8",
      bestFor: "Solo freelancers with steady clients",
      features: [
        "100+ Client Ready Website Design",
        "3-day delivery",
        "Fully white-label",
        "Standard customization",
        "Email support"
      ],
      popular: false,
      gradient: "from-blue-600 to-blue-700",
      badge: "/silver.png"
    },
    {
      title: "Growth",
      price: 60000,
      websites: "20",
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
      badge: "/gold.png"
    },
    {
      title: "Scale",
      price: 100000,
      websites: "40",
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
      badge: "/diamond.png"
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
      question: "What exactly do I get for ₹5,000 per website?",
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


  const singleWebsiteDisplay = getDisplayPrices(5000);


  if (currencyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
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
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.3;
          animation: float-up linear infinite;
          box-shadow: 0 0 20px currentColor;
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
          background: rgba(100, 152, 254, 0.1);
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

        @keyframes slideUpScale {
          0% { opacity: 0; transform: translateY(100px) scale(0.5); }
          60% { transform: translateY(-20px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="h-1.5 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600" aria-hidden="true"></div>


      {/* ✨ UPDATED HERO SECTION */}
      <section id="hero-section" className="relative bg-white py-28 overflow-hidden min-h-screen flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* ✅ 3Digree Badge */}
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-[#96b1e8] rounded-full px-8 py-3 shadow-xl">
                <span className="text-white font-bold text-2xl tracking-wide">3Digree</span>
              </div>
            </div>

            {/* Main Heading with Invisible Effect */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900 mb-2">
                Your{' '}
                <span 
                  className="relative inline-block cursor-pointer group"
                  onMouseEnter={(e) => e.currentTarget.classList.add('hover-active')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('hover-active')}
                  onClick={(e) => e.currentTarget.classList.toggle('hover-active')}
                >
                  <span className="invisible-text text-[#6498fe] transition-all duration-700 ease-in-out">
                    Invisible
                  </span>
                </span>
                {' '}Dev Team
              </span>
            </h1>

            {/* Typewriter - Smaller and below */}
            <div className="mb-10 font-mono" style={{ minHeight: "2.5em" }} >
              <TypewriterEffect texts={typewriterTexts} speed={100} delay={4500} />
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              3Digree is a website delivery infrastructure for freelancers and agencies. Use{" "}
              <span className="text-[#6498fe] font-bold">100+ battle-tested Website Designes</span> and a backend dev team so you can stay focused on clients and sales.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-12 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-lg relative overflow-hidden group cursor-pointer inline-flex items-center justify-center"
                style={{ borderRadius: "16px" }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>View Pricing Plans</span>
                  <span className="group-hover:rotate-90 transition-transform duration-300">💎</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
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

            <div ref={statsRef} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-3xl mx-auto px-4">
              {[
                { number: "100+", label: "Website Designes", icon: "/svg/lots.svg" },
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
                    <div className="relative text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:scale-110 transition-transform duration-500">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-bold flex items-center justify-center gap-2">
                    <span>{stat.label}</span>
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">
                      <img src={stat.icon} alt="." className="w-8 sm:w-10" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToPricing}
            className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#6498fe] transition-colors duration-300"
          >
            <span className="text-xs font-semibold">See Pricing</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>


      {/* Pricing Section - keeping rest unchanged */}
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

            {process.env.NODE_ENV === 'development' && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <span className="text-sm text-gray-600">
                  🌍 Detected Region: <span className="font-bold text-green-600">{userRegion}</span>
                   
                  (Only in Development mode)
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-24 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard 
                key={plan.title} 
                {...plan} 
                onGetPlan={handleGetPlan}
                getDisplayPrices={getDisplayPrices}
              />
            ))}
          </div>

          {/* Single Website Card */}
          <div className="max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl p-8 sm:p-10 relative overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-600 to-pink-600 opacity-5 rounded-full blur-3xl"></div>

              <div className="relative z-10">
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

                <div className="bg-white rounded-xl p-6 sm:p-8 border-2 border-gray-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 block mb-1">Single Website Delivery</span>
                      <span className="text-sm text-gray-500 font-medium">One-time payment, no commitment</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">
                        {singleWebsiteDisplay.main.symbol}{singleWebsiteDisplay.main.amount.toLocaleString('en-US')}
                      </div>
                      {singleWebsiteDisplay.secondary && (
                        <div className="text-base font-semibold text-gray-500 mt-1">
                          ≈ {singleWebsiteDisplay.secondary.symbol}{singleWebsiteDisplay.secondary.amount} {singleWebsiteDisplay.secondary.code}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1 font-semibold">Single Website</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    {[
                      { text: "Standard website" },
                      { text: "100+ Website Designes" },
                      { text: "3-day delivery" }
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

                <div className="text-center">
                  <button
                    onClick={() => handleGetPlan('Single Website', 5000)}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 sm:px-14 py-4 sm:py-5 shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg relative overflow-hidden group cursor-pointer rounded-xl inline-flex items-center justify-center hover:scale-105"
                  >
                    <span className="relative z-10">Get Plan</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};


export default Home;