import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useNotification } from "../hooks/useNotification";
import Button from "../components/Button";
import Card from "../components/Card";
import Lenis from "lenis";
import { createPlanOrder, openRazorpayCheckout } from "../services/planApi";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaRocket,
  FaShieldAlt,
  FaCode,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaHandshake,
  FaAndroid,
  FaArrowRight,
  FaCheck,
  FaGem,
  FaCog,
  FaStar,
  FaQuestionCircle,
  FaComments,
  FaLightbulb,
  FaMobileAlt,
} from "react-icons/fa";
import SectionTestimonials from "../components/SectionTestimonials";

const useSmartCurrency = () => {
  const [rates, setRates] = useState({ USD: 0.012 });
  const [userRegion, setUserRegion] = useState("IN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        const debugRegion = typeof localStorage !== "undefined" ? localStorage.getItem("debug_region") : null;
        if (debugRegion) {
          setUserRegion(debugRegion);
          setRates({ USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018 });
          setLoading(false);
          return;
        }

        const ipResponse = await fetch("https://ipapi.co/json/");
        const ipData = await ipResponse.json();
        setUserRegion(ipData?.country_code || "IN");

        const ratesResponse = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
        const ratesData = await ratesResponse.json();
        setRates(ratesData?.rates || { USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018 });

        setLoading(false);
      } catch (error) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (timezone.includes("America")) setUserRegion("US");
        else if (timezone.includes("Europe")) setUserRegion("GB");
        else if (timezone.includes("Asia/Kolkata") || timezone.includes("Asia/Calcutta")) setUserRegion("IN");
        else setUserRegion("US");

        setRates({ USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018 });
        setLoading(false);
      }
    };

    detectRegion();
  }, []);

  const getDisplayPrices = (inrAmount) => {
    if (inrAmount === undefined || inrAmount === null || !rates || !rates.USD) {
      return {
        main: { amount: inrAmount || 0, symbol: "₹", code: "INR" },
        secondary: null,
      };
    }

    const usdAmount = Math.round(inrAmount * rates.USD);

    if (userRegion === "IN") {
      return {
        main: { amount: inrAmount, symbol: "₹", code: "INR" },
        secondary: { amount: usdAmount, symbol: "$", code: "USD" },
      };
    }

    if (userRegion === "US") {
      return {
        main: { amount: usdAmount, symbol: "$", code: "USD" },
        secondary: null,
      };
    }

    const localCurrencyMap = {
      GB: { rate: rates.GBP || 0.0095, symbol: "£", code: "GBP" },
      CA: { rate: rates.CAD || 0.016, symbol: "CA$", code: "CAD" },
      AU: { rate: rates.AUD || 0.018, symbol: "A$", code: "AUD" },
      DE: { rate: rates.EUR || 0.011, symbol: "€", code: "EUR" },
      FR: { rate: rates.EUR || 0.011, symbol: "€", code: "EUR" },
      IT: { rate: rates.EUR || 0.011, symbol: "€", code: "EUR" },
      ES: { rate: rates.EUR || 0.011, symbol: "€", code: "EUR" },
    };

    const localCurrency = localCurrencyMap[userRegion];

    if (localCurrency) {
      const localAmount = Math.round(inrAmount * localCurrency.rate);
      return {
        main: { amount: usdAmount, symbol: "$", code: "USD" },
        secondary: { amount: localAmount, symbol: localCurrency.symbol, code: localCurrency.code },
      };
    }

    return {
      main: { amount: usdAmount, symbol: "$", code: "USD" },
      secondary: null,
    };
  };

  return { getDisplayPrices, userRegion, loading };
};

const TypewriterEffect = memo(({ texts, speed = 100, delay = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const fullText = texts[currentTextIndex] || "";

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < fullText.length) {
          setCurrentText(fullText.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else if (charIndex > 0) {
        setCurrentText(fullText.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, currentTextIndex, isDeleting, texts, speed, delay]);

  return (
    <span className="relative text-gray-700 text-2xl md:text-3xl">
      {currentText}
      <img src="/gifs/blueball_transparent.gif" alt="" className="inline-block ml-1 align-middle" style={{ height: '1.2em', width: 'auto' }} />
    </span>
  );
});

TypewriterEffect.displayName = "TypewriterEffect";

const StepCard = memo(({ number, title, description }) => (
  <Card className="relative p-6 sm:p-7 bg-white border-2 border-gray-100 hover:border-[#6498fe] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group backdrop-blur-sm h-full">
    <div className="absolute -top-5 sm:-top-6 left-5 sm:left-6 bg-gradient-to-br from-[#6498fe] via-blue-600 to-purple-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
      {number}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-3 mt-4 group-hover:text-[#6498fe] transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#6498fe] group-hover:w-full transition-all duration-500"></div>
  </Card>
));

StepCard.displayName = "StepCard";

const FeatureCard = memo(({ title, description, icon }) => (
  <Card className="relative p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-gray-100 hover:border-[#6498fe] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden h-full">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500 -mr-16 -mt-16"></div>
    <div className="relative z-10">
      <div className="text-5xl mb-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 inline-block">
        <img src={icon} alt={title} className="w-16 sm:w-20" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6498fe] transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </Card>
));

FeatureCard.displayName = "FeatureCard";

const FAQItem = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-5 overflow-hidden border-2 border-gray-200 hover:border-[#6498fe] transition-all duration-300 hover:shadow-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-7 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
        aria-expanded={isOpen}
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 pr-4 sm:pr-8 group-hover:text-[#6498fe] transition-colors duration-300">
          {question}
        </h3>
        <div
          className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#6498fe] to-blue-600 flex items-center justify-center text-white font-bold text-2xl transition-all duration-500 shadow-lg group-hover:shadow-xl ${isOpen ? "rotate-45 scale-110" : "group-hover:scale-110"}`}
        >
          +
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="px-5 sm:px-7 pb-5 sm:pb-7 pt-2">
          <div className="bg-gray-50 p-4 sm:p-5 rounded-xl">
            <p className="text-gray-700 leading-relaxed font-medium">{answer}</p>
          </div>
        </div>
      </div>
    </Card>
  );
});

FAQItem.displayName = "FAQItem";

const PricingCard = memo(
  ({
    id,
    title,
    price,
    strikePrice,
    websites,
    bestFor,
    features,
    popular,
    gradient,
    onGetPlan,
    getDisplayPrices,
    loading,
    selectedPlan,
  }) => {
    const websiteCount = Number(websites) || 1;
    const pricePerWebsite = Math.round(price / websiteCount);
    const displayPrices = getDisplayPrices(price);
    const displayPerWebsite = getDisplayPrices(pricePerWebsite);
    const strikeDisplay = getDisplayPrices(strikePrice);

    return (
      <Card
        className={`relative p-5 sm:p-7 md:p-10 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group overflow-hidden ${
          popular
            ? "border-[#6498fe] shadow-2xl scale-100 md:scale-105 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
            : "border-gray-200 hover:border-[#6498fe] bg-white"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6498fe] via-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

        <div className="relative z-10 text-center mb-5 sm:mb-8">
          <h3 className="text-lg sm:text-xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 group-hover:text-[#6498fe] transition-colors duration-300">
            {title}
          </h3>

          <div className="relative inline-block mb-4">
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 mb-1">
              <span className="text-xs sm:text-sm md:text-lg font-medium text-gray-400 line-through">
                {strikeDisplay.main.symbol}
                {strikeDisplay.main.amount.toLocaleString("en-US")}
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform duration-500">
                {displayPrices.main.symbol}
                {displayPrices.main.amount.toLocaleString("en-US")}
              </div>
            </div>

            {displayPrices.secondary && (
              <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-500 mt-1">
                ≈ {displayPrices.secondary.symbol}
                {displayPrices.secondary.amount.toLocaleString("en-US")} {displayPrices.secondary.code}
              </div>
            )}

            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-14 sm:w-16 h-[3px] bg-[#6498fe] rounded-full"></div>
          </div>

          <p className="text-gray-700 font-semibold text-base sm:text-lg md:text-xl mb-1">
            <span className="font-bold">{websiteCount}</span> websites
          </p>

          <p className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base mb-2">
            ({" "}
            {displayPerWebsite.main.symbol}
            {displayPerWebsite.main.amount.toLocaleString("en-US")} per website
            {displayPerWebsite.secondary && (
              <span className="text-xs text-gray-500 ml-1">
                / {displayPerWebsite.secondary.symbol}
                {displayPerWebsite.secondary.amount} {displayPerWebsite.secondary.code}
              </span>
            )}
            )
          </p>

          <br />
          <p className="text-xs sm:text-sm text-gray-500 italic px-2 sm:px-4">{bestFor}</p>
        </div>

        <div className="relative z-10 space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 sm:gap-3 group/item">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md group-hover/item:scale-125 transition-transform duration-300">
                <span className="text-white font-bold text-xs">✓</span>
              </div>
              <span className="text-gray-700 text-xs sm:text-sm leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors duration-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="block relative z-10">
          <Button
            onClick={() => onGetPlan(title, price)}
            disabled={loading && selectedPlan === title}
            className={`w-full font-bold py-3 sm:py-4 md:py-5 rounded-xl transition-all duration-300 text-sm sm:text-base md:text-lg relative overflow-hidden group/btn cursor-pointer ${
              popular
                ? "bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl"
                : "bg-black text-white border-2 border-gray-300 hover:bg-gradient-to-r hover:from-[#6498fe] hover:to-purple-600 hover:border-[#6498fe]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading && selectedPlan === title ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>Get Plan</span>
                <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
              </span>
            )}
          </Button>
        </div>
      </Card>
    );
  }
);

PricingCard.displayName = "PricingCard";

const Home = () => {
  const { isAuthenticated, user, updateCredits } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { getDisplayPrices, userRegion, loading: currencyLoading } = useSmartCurrency();

  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const createBubble = () => {
      const section = document.getElementById("hero-section");
      if (!section) return;

      const bubble = document.createElement("div");
      bubble.className = "floating-bubble";

      const size = Math.random() * 12 + 4;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.background = Math.random() > 0.5 ? "#6498fe" : "#10b981";
      const duration = Math.random() * 8 + 12;
      bubble.style.animationDuration = `${duration}s`;

      section.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    };

    for (let i = 0; i < 10; i += 1) {
      setTimeout(() => createBubble(), i * 100);
    }

    const interval = setInterval(createBubble, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const scrollToPricing = (e) => {
    if (e) e.preventDefault();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleGetPlan = async (planTitle) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/" } });
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planTitle);

      const orderResponse = await createPlanOrder(planTitle);
      await openRazorpayCheckout(
        orderResponse.data,
        (verifyResponse) => {
          addNotification({
            type: "success",
            message: `🎉 ${planTitle} plan activated! Credits added to your account.`,
          });
          updateCredits(verifyResponse.data.user.credits);
          setLoading(false);
          setSelectedPlan(null);
          setTimeout(() => navigate("/dashboard"), 1500);
        },
        (error) => {
          addNotification({
            type: "error",
            message: error.message || "Payment failed. Please try again.",
          });
          setLoading(false);
          setSelectedPlan(null);
        }
      );
    } catch (error) {
      addNotification({
        type: "error",
        message: error.message || "Failed to initiate payment",
      });
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsStatsVisible(true);
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  const typewriterTexts = useMemo(
    () => ["without hiring developers", "in 3 business days", "with predictable pricing"],
    []
  );

  const steps = useMemo(
    () => [
      {
        number: "1",
        title: "Choose a plan & book a call",
        description:
          "Pick the plan that fits your pipeline (or go per-website), then jump on a quick call to align expectations.",
      },
      {
        number: "2",
        title: "Get your partner dashboard",
        description:
          "After onboarding, you get access to a simple dashboard showing your plan, remaining websites, and template/design IDs.",
      },
      {
        number: "3",
        title: "Pick a template with your client",
        description:
          "Use our 100+ Website Designs, choose a design with your client, and submit only the Design ID in the dashboard. No heavy forms.",
      },
      {
        number: "4",
        title: "Website delivered in 3 business days",
        description:
          "Once content is clear, we deliver the website in 3 business days. You present it to your client under your own brand.",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: "./jcb.png",
        title: "Infrastructure, not another tool",
        description:
          "No need to learn new tools or drag-and-drop builders. You just pick a template and share a Design ID — we handle the build.",
      },
      {
        icon: "./hand.png",
        title: "No client conflict",
        description:
          "We never compete with you for clients. You own the relationship, pricing, and credit; we stay invisible in the background.",
      },
      {
        icon: "./money.png",
        title: "Predictable costs, zero hiring",
        description:
          "Forget salaries, HR, or managing multiple freelancers. Use simple yearly plans or per-website pricing to keep your margins healthy.",
      },
    ],
    []
  );

  const pricingPlans = useMemo(
    () => [
      {
        id: "growth",
        title: "Starter",
        price: 10999,
        strikePrice: 15000,
        websites: 3,
        pricePerWebsite: 3666,
        gradient: "from-[#6498fe] to-purple-600",
        bestFor: "Small teams and boutique agencies",
        features: [
          "3 website credits",
          "₹3,666 per website",
          "Priority delivery queue",
          "Advanced customization",
          "Dedicated support channel",
        ],
        popular: false,
      },
      {
        id: "scale",
        title: "Growth",
        price: 29999,
        strikePrice: 45000,
        websites: 9,
        pricePerWebsite: 3333,
        gradient: "from-[#6498fe] to-blue-600",
        bestFor: "High-volume agencies",
        features: [
          "9 website credits",
          "~₹3,333 per website",
          "Custom scope flexibility",
          "Account manager assigned",
          "24/7 priority support",
        ],
        popular: false,
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        question: "What if I don't use all websites in my plan?",
        answer:
          "No problem, your credits will remain safe in your account as long as you don't forget your account password. And even if that happens, there is no issue — we still keep your data. You can contact our support number, and we will either recover your account or provide you with a new account with the same credit balance.",
      },
      {
        question: "What exactly do I get for ₹3,999 per website?",
        answer:
          "A standard marketing website using one of our Website Designs, customized with your client's branding and content, delivered in 3 business days after content is confirmed.",
      },
      {
        question: "Who handles hosting?",
        answer:
          "We can deploy the website on Vercel, or we can provide you with the source code so that you can handle it yourself. You stay in control of domains and client relationships.",
      },
      {
        question: "Can I white-label everything?",
        answer:
          "Absolutely. Your clients will only see your brand. We stay completely invisible in the background as your delivery infrastructure.",
      },
      {
        question: "Do I pay on the website?",
        answer:
          "Yes, you can make the payment on our website — it is secured by Razorpay. If you have any concern regarding payment security, you can contact our support number and pay through various methods such as UPI or bank transfer.",
      },
    ],
    []
  );

  const displayName = useMemo(() => user?.name || user?.username, [user?.name, user?.username]);

  if (currencyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const singleWebsiteDisplay = getDisplayPrices(3999);
  const singleWebsiteStrikeDisplay = getDisplayPrices(9999);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(30px);
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

      <section id="hero-section" className="relative bg-white pt-24 sm:pt-28 pb-20 overflow-hidden min-h-screen flex items-center">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-[#96b1e8] rounded-full px-6 sm:px-8 py-3 shadow-xl">
                <span className="text-white font-bold text-xl sm:text-2xl tracking-wide">3Digree</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900 mb-2">
                Your{" "}
                <span
                  className="relative inline-block cursor-pointer group"
                  onMouseEnter={(e) => e.currentTarget.classList.add("hover-active")}
                  onMouseLeave={(e) => e.currentTarget.classList.remove("hover-active")}
                  onClick={(e) => e.currentTarget.classList.toggle("hover-active")}
                >
                  <span className="invisible-text text-[#6498fe] transition-all duration-700 ease-in-out">Invisible</span>
                </span>{" "}
                Dev Team
              </span>
            </h1>

            <div className="mb-10 font-mono min-h-[2.5em] sm:min-h-[3em] flex items-center justify-center px-2">
              <TypewriterEffect texts={typewriterTexts} speed={100} delay={4500} />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto font-medium px-2">
              3Digree is a website delivery infrastructure for freelancers and agencies. Use{" "}
              <span className="text-[#6498fe] font-bold">100+ battle-tested Website Designs</span> and a backend dev team so you can stay focused on clients and sales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 px-2">
              <button
                type="button"
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 shadow-2xl hover:scale-105 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] text-base sm:text-lg relative overflow-hidden group inline-flex items-center justify-center rounded-2xl"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>View Pricing Plans</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>

            {isAuthenticated && displayName && (
              <div className="mb-12 inline-block px-2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#6498fe] via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-2xl px-6 sm:px-10 py-4 sm:py-5 shadow-xl">
                    <p className="text-gray-700 font-medium text-base sm:text-lg">
                      Welcome back,{" "}
                      <span className="font-black text-[#6498fe] text-lg sm:text-xl">
                        {displayName}
                      </span>
                      !
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={statsRef} className="mt-20 sm:mt-28 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-3xl mx-auto px-4">
              {[
                { number: "100+", label: "Website Designs", icon: "/svg/lots.svg" },
                { number: "3", label: "Days Delivery", icon: "/svg/day.svg" },
                { number: "100%", label: "White-label", icon: "/svg/happy.svg" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group"
                  style={{
                    animation: isStatsVisible ? `slideUpScale 0.8s ease-out ${index * 0.2}s forwards` : "none",
                  }}
                >
                  <div className="relative inline-block mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6498fe] to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <div className="relative text-4xl sm:text-5xl font-black text-[#6498fe] group-hover:scale-110 transition-transform duration-500">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-bold flex items-center justify-center gap-2">
                    <span>{stat.label}</span>
                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">
                      <img src={stat.icon} alt={stat.label} className="w-8 sm:w-10" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      <section id="pricing" className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-full px-6 sm:px-8 py-4 shadow-xl">
                <FaGem className="text-xl text-white" />
                <span className="text-sm font-bold text-white">Transparent Pricing</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium px-2">
              Select the plan that matches your agency's deal flow and scale effortlessly
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <span className="text-sm text-gray-600">
                  🌍 Detected Region: <span className="font-bold text-green-600">{userRegion}</span>
                  (Only in Development mode)
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-16 sm:mb-24 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                {...plan}
                onGetPlan={handleGetPlan}
                getDisplayPrices={getDisplayPrices}
                loading={loading}
                selectedPlan={selectedPlan}
              />
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl p-6 sm:p-8 md:p-10 relative overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#6498fe] to-blue-600 opacity-5 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#6498fe] to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaLightbulb className="text-white text-lg sm:text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">Not ready for a Bulk Plan?</h3>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg font-medium mt-1">Pay per project with the same quality</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 border-2 border-gray-200 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 block mb-1">Single Website Delivery</span>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">One-time payment, no commitment</span>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex flex-col items-start sm:items-end gap-0.5 mb-1">
                        <span className="text-xs sm:text-sm md:text-lg font-medium text-gray-400 line-through">
                          {singleWebsiteStrikeDisplay.main.symbol}
                          {singleWebsiteStrikeDisplay.main.amount.toLocaleString("en-US")}
                        </span>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                          {singleWebsiteDisplay.main.symbol}
                          {singleWebsiteDisplay.main.amount.toLocaleString("en-US")}
                        </div>
                      </div>

                      {singleWebsiteDisplay.secondary && (
                        <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-500 mt-1">
                          ≈ {singleWebsiteDisplay.secondary.symbol}
                          {singleWebsiteDisplay.secondary.amount} {singleWebsiteDisplay.secondary.code}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1 font-semibold">Single Website</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                    {[
                      { text: "Standard website" },
                      { text: "100+ Website Designs" },
                      { text: "3-day delivery" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 group">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-xs">✓</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs sm:text-sm text-gray-700 font-semibold">{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleGetPlan("Single Website")}
                    disabled={loading && selectedPlan === "Single Website"}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 sm:px-14 py-4 sm:py-5 shadow-xl hover:shadow-2xl transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] text-base sm:text-lg relative overflow-hidden group rounded-xl inline-flex items-center justify-center hover:scale-105 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && selectedPlan === "Single Website" ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="relative z-10">Get Plan</span>
                    )}
                      </button>
                </div>
              </div>
            </Card>
          </div>

          {/* CUSTOM SERVICES — Android / Software */}
          <div className="max-w-6xl mx-auto mt-14 sm:mt-16">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-widest">Custom Services</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2">
                Beyond Websites
              </h3>
              <p className="text-slate-500 text-sm sm:text-base">
                Mobile apps and custom software, quoted per project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              {/* MOBILE APP CARD */}
              <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-slate-900 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center">
                    <FaMobileAlt className="text-white text-xl" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mobile Development
                  </div>
                </div>

                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Mobile Apps
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Production-ready Android and iOS apps built on React Native, with backend and admin panel.
                </p>

                <div className="flex items-baseline flex-wrap gap-2 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">₹9,000</span>
                  <span className="text-xs sm:text-sm text-slate-500">/ project</span>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {[
                    "Android and iOS support",
                    "Backend & admin panel included",
                    "Full source code delivery",
                    "Scalable architecture",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <FaCheck className="text-emerald-600 text-xs mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/919256129813"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.97] text-white font-semibold py-3.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group/btn"
                >
                  Request Quote
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* SOFTWARE CARD */}
              <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-slate-900 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[#6498fe] shadow-[0_0_0_4px_rgba(100,152,254,0.15)]"></div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center">
                    <FaCode className="text-white text-xl" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Custom Software
                  </div>
                </div>

                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Custom Software
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Tailored software built to your exact requirements — internal tools, dashboards, or SaaS.
                </p>

                <div className="flex items-baseline flex-wrap gap-2 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">₹3,000</span>
                  <span className="text-xs sm:text-sm text-slate-500">/ project</span>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {[
                    "Built to your specs",
                    "Web, desktop, or SaaS",
                    "Source code included",
                    "Post-delivery support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <FaCheck className="text-[#6498fe] text-xs mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/919256129813"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.97] text-white font-semibold py-3.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group/btn"
                >
                  Request Quote
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-6 sm:px-8 py-4 shadow-lg">
                <FaCog className="text-xl text-[#6498fe]" />
                <span className="text-sm font-bold text-[#6498fe]">Simple Process</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium px-2">
              From first order to final delivery — a smooth white-label workflow for your agency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 pt-6">
            {steps.map((step, index) => (
              <div key={step.number} style={{ animationDelay: `${index * 0.15}s` }}>
                <StepCard {...step} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-6 sm:px-8 py-4 shadow-xl">
                <FaStar className="text-xl text-white" />
                <span className="text-sm font-bold text-white">Why Choose 3Digree</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">Why Agencies Love Us</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium px-2">
              We help you fulfill more websites without hiring, managing freelancers, or losing control over your client relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} style={{ animationDelay: `${index * 0.2}s` }}>
                <FeatureCard {...benefit} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-white border-2 border-orange-300 rounded-full px-6 sm:px-8 py-4 shadow-lg">
                <FaQuestionCircle className="text-xl text-orange-600" />
                <span className="text-sm font-bold text-orange-600">Got Questions?</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium px-2">
              Everything you need to know before getting started with our white-label website delivery service.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full px-6 sm:px-8 py-4 shadow-xl">
                <FaComments className="text-xl text-white" />
                <span className="text-sm font-bold text-white">Client Stories</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900">What Our Partners Say</h2>
          </div>
          <SectionTestimonials />
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 sm:px-8 py-4 border border-white/20">
              <FaRocket className="text-xl text-white" />
              <span className="text-sm font-bold text-white">Ready to Scale?</span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white">Start Closing More Website Deals</h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto font-medium leading-relaxed px-2">
            Let 3Digree handle the backend delivery while you stay focused on your clients, sales, and growth.
          </p>

          <button
            type="button"
            onClick={scrollToPricing}
            className="bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 sm:px-14 py-4 sm:py-5 rounded-2xl shadow-2xl hover:scale-105 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] text-base sm:text-lg inline-flex items-center justify-center"
          >
            View Plans
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
