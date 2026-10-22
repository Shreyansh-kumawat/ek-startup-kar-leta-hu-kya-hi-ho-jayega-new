import React, { useState, useEffect, useMemo, memo, useRef, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, MotionConfig, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useAuth } from "../features/auth/useAuth";
import { useNotification } from "../hooks/useNotification";
import Lenis from "lenis";
import { createPlanOrder, openRazorpayCheckout } from "../services/planApi";
import {
  FaWhatsapp,
  FaEnvelope,
  FaCode,
  FaArrowRight,
  FaCheck,
  FaMobileAlt,
  FaBolt,
  FaLock,
  FaRocket,
  FaBullseye,
  FaHandshake,
  FaCoins,
  FaShieldAlt,
  FaGlobe,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import SectionTestimonials from "../components/SectionTestimonials";

const AssemblyScene = lazy(() => import("../components/AssemblyScene"));
const XRayScene = lazy(() => import("../components/XRayScene"));

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
};

const WHATSAPP_URL = "https://wa.me/919256129813";
const SUPPORT_EMAIL = "info.3digree@gmail.com";

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

const formatPrice = (p) => `${p.symbol}${p.amount.toLocaleString("en-US")}`;

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
    <span className="relative text-gray-700 text-xl sm:text-2xl md:text-3xl">
      {currentText}
      <img src="/gifs/blueball_transparent.gif" alt="" className="inline-block ml-1 align-middle" style={{ height: "1.2em", width: "auto" }} />
    </span>
  );
});

TypewriterEffect.displayName = "TypewriterEffect";

// ── Shared building blocks ───────────────────────────────────────────────────

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ eyebrow, title, subtitle, align = "center", className = "" }) => {
  const centered = align === "center";
  return (
    <Reveal className={`max-w-3xl mb-10 sm:mb-14 ${centered ? "mx-auto text-center" : "text-center lg:text-left"} ${className}`}>
      <div className={`inline-flex items-center gap-2 mb-4 ${centered ? "" : "lg:justify-start"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#6498fe]"></span>
        <span className="text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-[#6498fe]">{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-[1.1] mb-4">{title}</h2>
      {subtitle && <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
};

// ── Pricing card ─────────────────────────────────────────────────────────────

const PricingCard = memo(
  ({ title, price, strikePrice, websites, bestFor, features, badge, onGetPlan, getDisplayPrices, loading, selectedPlan }) => {
    const websiteCount = Number(websites) || 1;
    const displayPrice = getDisplayPrices(price);
    const strikeDisplay = getDisplayPrices(strikePrice);
    const perWebsite = getDisplayPrices(Math.round(price / websiteCount));
    const highlighted = Boolean(badge);
    const isProcessing = loading && selectedPlan === title;

    return (
      <div
        className={`relative flex flex-col h-full rounded-3xl bg-white p-6 sm:p-8 transition-shadow duration-300 ${
          highlighted
            ? "border-2 border-[#6498fe] shadow-[0_24px_60px_-24px_rgba(100,152,254,0.55)]"
            : "border border-gray-200 hover:shadow-xl"
        }`}
      >
        {badge && (
          <span className="absolute -top-3.5 left-6 sm:left-8 bg-[#6498fe] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            {badge}
          </span>
        )}

        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{bestFor}</p>
        </div>

        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-400 line-through mb-1">{formatPrice(strikeDisplay.main)}</div>
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">{formatPrice(displayPrice.main)}</span>
            {displayPrice.secondary && (
              <span className="text-sm font-semibold text-gray-500">
                ≈ {formatPrice(displayPrice.secondary)} {displayPrice.secondary.code}
              </span>
            )}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700">
            {websiteCount} {websiteCount === 1 ? "website" : "websites"}
            {websiteCount > 1 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[#6498fe]">{formatPrice(perWebsite.main)} each</span>
              </>
            )}
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                <FaCheck className="text-emerald-600 text-[10px]" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onGetPlan(title)}
          disabled={isProcessing}
          className={`mt-auto w-full inline-flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group ${
            highlighted
              ? "bg-[#6498fe] text-white hover:bg-[#4f86f5] shadow-lg shadow-blue-500/20"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              Processing...
            </>
          ) : (
            <>
              Get {title}
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>
      </div>
    );
  }
);

PricingCard.displayName = "PricingCard";

// ── FAQ item ─────────────────────────────────────────────────────────────────

const FAQItem = memo(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 sm:py-6 flex items-center justify-between gap-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#6498fe] transition-colors duration-200">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-all duration-300 ${
            isOpen ? "rotate-45 bg-gray-900 border-gray-900 text-white" : "group-hover:border-[#6498fe]"
          }`}
        >
          <FaPlus className="text-xs" />
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-6 pr-12 text-gray-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = "FAQItem";

// ── Scroll-driven pieces ─────────────────────────────────────────────────────

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#6498fe] origin-left z-[70] pointer-events-none"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

const StoryHowItWorks = ({ steps }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const lineScale = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(steps.length - 1, Math.floor(v * steps.length * 0.999)));
  });

  return (
    <section ref={ref} className="relative bg-white" style={{ height: `${steps.length * 75 + 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="hero-dots absolute inset-0 pointer-events-none opacity-60" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-8 w-full grid grid-cols-[0.9fr_1.1fr] gap-10 items-center pt-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6498fe]"></span>
              <span className="text-sm font-bold tracking-[0.18em] uppercase text-[#6498fe]">How it works</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black tracking-tight text-gray-900 leading-[1.1] mb-10">
              From signed client to live website in four steps
            </h2>

            <div className="relative pl-16">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-200" aria-hidden="true"></div>
              <motion.div
                className="absolute left-6 top-6 bottom-6 w-px bg-[#6498fe] origin-top"
                style={{ scaleY: lineScale }}
                aria-hidden="true"
              ></motion.div>

              {steps.map((step, i) => {
                const isActive = i === active;
                const isDone = i <= active;
                return (
                  <div key={step.number} className="relative py-3">
                    <div
                      className={`absolute -left-16 top-3 w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-colors duration-300 ${
                        isDone ? "bg-[#6498fe] border-[#6498fe] text-white" : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}>
                      <h3 className="text-lg font-bold text-gray-900 pt-3">{step.title}</h3>
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <p className="text-gray-600 leading-relaxed pt-2 pr-6">{step.description}</p>
                          <span className="inline-block mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                            {step.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative h-[560px] xl:h-[620px]">
            <Suspense fallback={null}>
              <AssemblyScene progress={scrollYProgress} step={active} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyXRay = ({ reasons, lite }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const [finale, setFinale] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(reasons.length - 1, Math.floor(v * reasons.length * 0.999)));
    setFinale(v > 0.93);
  });

  const reason = reasons[active];

  return (
    <section ref={ref} className="relative bg-gray-50" style={{ height: `${reasons.length * 70 + 100}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex items-center">
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 lg:pt-10 grid lg:grid-cols-[1.15fr_0.85fr] lg:grid-rows-[auto_auto] gap-x-12 gap-y-3 sm:gap-y-5 items-center">
          <div className="lg:col-start-2 lg:row-start-1 self-end">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6498fe]"></span>
              <span className="text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-[#6498fe]">Why agencies choose us</span>
            </div>
            <h2 className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Your client sees your brand. Here's what they don't see.
            </h2>
          </div>

          <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 relative h-[240px] sm:h-[380px] lg:h-[560px]">
            <Suspense fallback={null}>
              <XRayScene progress={scrollYProgress} stage={active} lite={lite} />
            </Suspense>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 lg:bottom-2 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-gray-600 shadow-sm pointer-events-none whitespace-nowrap">
              <span className="w-2 h-2 rounded-full border-2 border-[#6498fe]"></span>
              {lite ? "Tap the site to aim the x-ray" : "Move your cursor over the site"}
            </div>
          </div>

          <div className="lg:col-start-2 lg:row-start-2 self-start">
            <div className="relative min-h-[178px] sm:min-h-[200px] lg:min-h-[230px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={finale ? "finale" : active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {finale ? (
                    <>
                      <div className="text-xs sm:text-sm font-black text-[#6498fe] font-mono mb-2">BEHIND THE CURTAIN</div>
                      <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">Now you see us.</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        This is the part your client never sees. Everything they see says <span className="font-bold text-gray-900">Your Agency</span>.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-xs sm:text-sm font-black text-[#6498fe] font-mono mb-2">
                        {String(active + 1).padStart(2, "0")} / {String(reasons.length).padStart(2, "0")}
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">{reason.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">{reason.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {reason.chips.map((c) => (
                          <span key={c} className="text-[11px] sm:text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1">
                            {c}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5 mt-3 sm:mt-5">
              {reasons.map((r, i) => (
                <div
                  key={r.title}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= active ? "bg-gray-900" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA_WORDS = ["Start", "closing", "more", "website", "deals."];

const RevealWord = ({ word, index, total, progress }) => {
  const start = 0.3 + (index / total) * 0.35;
  const opacity = useTransform(progress, [start, start + 0.08], [0.12, 1]);
  const y = useTransform(progress, [start, start + 0.08], [14, 0]);
  const blur = useTransform(progress, [start, start + 0.08], [8, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span style={{ opacity, y, filter }} className={`inline-block mr-[0.25em] ${index === total - 1 ? "text-[#6498fe]" : ""}`}>
      {word}
    </motion.span>
  );
};

const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        setOffset({ x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35 });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const FinalCTA = ({ onViewPlans }) => {
  const ref = useRef(null);
  const boxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const scale = useTransform(scrollYProgress, [0.05, 0.4], [0.82, 1]);
  const radius = useTransform(scrollYProgress, [0.05, 0.4], [48, 0]);
  const wordmarkX = useTransform(scrollYProgress, [0, 1], ["12%", "-28%"]);
  const gridOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const actionsOpacity = useTransform(scrollYProgress, [0.68, 0.8], [0, 1]);
  const actionsY = useTransform(scrollYProgress, [0.68, 0.8], [24, 0]);
  const subOpacity = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);

  const onMove = (e) => {
    const el = boxRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={ref} className="relative bg-white" style={{ height: "190vh" }}>
      <div className="sticky top-0 h-[100svh] flex items-center justify-center overflow-hidden">
        <motion.div
          ref={boxRef}
          onPointerMove={onMove}
          style={{ scale, borderRadius: radius }}
          className="cta-box relative w-full h-full bg-gray-950 overflow-hidden flex items-center justify-center"
        >
          {/* giant parallax wordmark */}
          <motion.div
            style={{ x: wordmarkX }}
            className="cta-wordmark absolute top-[12%] left-0 whitespace-nowrap font-black leading-none select-none pointer-events-none"
            aria-hidden="true"
          >
            3DIGREE 3DIGREE
          </motion.div>

          {/* perspective grid floor */}
          <motion.div style={{ opacity: gridOpacity }} className="cta-floor-wrap absolute inset-x-0 bottom-0 h-[55%] pointer-events-none" aria-hidden="true">
            <div className="cta-floor" />
          </motion.div>

          <div className="cta-spot absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[760px] h-[300px] bg-[#6498fe] rounded-full blur-[130px] opacity-20 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-[-0.035em] mb-6">
              {CTA_WORDS.map((w, i) => (
                <RevealWord key={w} word={w} index={i} total={CTA_WORDS.length} progress={scrollYProgress} />
              ))}
            </h2>
            <motion.p style={{ opacity: subOpacity }} className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Let 3Digree handle the delivery while you stay focused on your clients, sales, and growth.
            </motion.p>

            <motion.div style={{ opacity: actionsOpacity, y: actionsY }}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <MagneticButton
                  onClick={onViewPlans}
                  className="inline-flex items-center justify-center gap-3 bg-white text-gray-950 font-bold px-9 py-4 rounded-xl hover:bg-gray-100 shadow-[0_0_0_6px_rgba(255,255,255,0.06),0_20px_50px_-12px_rgba(100,152,254,0.6)] group"
                >
                  View Plans
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                </MagneticButton>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:border-white/50 hover:bg-white/5 transition-colors duration-200"
                >
                  <FaWhatsapp className="text-lg" /> Chat on WhatsApp
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-2"><FaBolt className="text-[#6498fe]" /> 3-day delivery</span>
                <span className="flex items-center gap-2"><FaLock className="text-[#6498fe]" /> 100% white-label</span>
                <span className="flex items-center gap-2"><FaShieldAlt className="text-[#6498fe]" /> Secure payments</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const Home = () => {
  const { isAuthenticated, user, updateCredits } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { getDisplayPrices, userRegion, loading: currencyLoading } = useSmartCurrency();

  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const statsRef = useRef(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { scrollY } = useScroll();
  const heroProgress = useTransform(scrollY, (v) =>
    Math.min(1, Math.max(0, v / (typeof window !== "undefined" ? window.innerHeight : 800)))
  );
  const heroTextY = useTransform(heroProgress, [0, 1], [0, -70]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.85], [1, 0.1]);

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

    const node = statsRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [currencyLoading]);

  const typewriterTexts = useMemo(
    () => ["without hiring developers", "in 3 business days", "with predictable pricing"],
    []
  );

  const trustItems = useMemo(
    () => [
      { icon: <FaBolt />, text: "3-Day Delivery" },
      { icon: <FaLock />, text: "White Label Always" },
      { icon: <FaRocket />, text: "You Close, We Build" },
      { icon: <FaBullseye />, text: "Your Brand Only" },
      { icon: <FaHandshake />, text: "Long-Term Partner" },
      { icon: <FaCoins />, text: "Better Margins" },
      { icon: <FaShieldAlt />, text: "NDA Protected" },
      { icon: <FaGlobe />, text: "Remote Delivery" },
    ],
    []
  );

  const comparison = useMemo(
    () => [
      { label: "Cost per website", hire: "Fixed salary, even in slow months", market: "Varies with every freelancer", us: "From ₹3,333" },
      { label: "Delivery time", hire: "Depends on their bandwidth", market: "Unpredictable, often weeks", us: "3 business days" },
      { label: "Quality", hire: "Depends on one person", market: "Inconsistent between projects", us: "100+ battle-tested designs" },
      { label: "White-label & NDA", hire: "Only if you draft contracts", market: "Not guaranteed", us: "White-label by default, NDA protected" },
      { label: "Management", hire: "Hiring, HR and reviews", market: "Briefing and chasing updates", us: "Share a Design ID. Done." },
      { label: "Scaling up or down", hire: "Slow and expensive", market: "Re-hire every single time", us: "Buy credits when you need them" },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        number: "01",
        title: "Choose a plan & book a call",
        description: "Pick the plan that fits your pipeline (or go per-website), then jump on a quick call to align expectations.",
        tag: "Quick call",
      },
      {
        number: "02",
        title: "Get your partner dashboard",
        description: "See your plan, remaining websites, and template Design IDs in one simple dashboard.",
        tag: "Instant access",
      },
      {
        number: "03",
        title: "Pick a template with your client",
        description: "Choose from 100+ Website Designs together and submit only the Design ID. No heavy forms.",
        tag: "Just a Design ID",
      },
      {
        number: "04",
        title: "Delivered in 3 business days",
        description: "Once content is clear, we deliver. You present it to your client under your own brand.",
        tag: "3 business days",
      },
    ],
    []
  );

  const pricingPlans = useMemo(
    () => [
      {
        id: "single",
        title: "Single Website",
        price: 3999,
        strikePrice: 9999,
        websites: 1,
        bestFor: "Try us on one client project",
        features: ["1 website credit", "Standard marketing website", "Any of 100+ Website Designs", "3-day delivery", "One-time payment, no commitment"],
      },
      {
        id: "growth",
        title: "Starter",
        price: 10999,
        strikePrice: 15000,
        websites: 3,
        bestFor: "Small teams and boutique agencies",
        features: ["3 website credits", "Priority delivery queue", "Advanced customization", "Dedicated support channel"],
      },
      {
        id: "scale",
        title: "Growth",
        price: 29999,
        strikePrice: 45000,
        websites: 9,
        bestFor: "High-volume agencies",
        badge: "Best value",
        features: ["9 website credits", "Custom scope flexibility", "Account manager assigned", "24/7 priority support"],
      },
    ],
    []
  );

  const services = useMemo(
    () => [
      {
        icon: <FaShoppingCart />,
        label: "E-commerce",
        title: "E-commerce Websites",
        description: "Online stores with product catalog, cart, checkout and payments - ready to sell from day one.",
        price: "₹9,000",
        unit: "per website",
        points: ["Product catalog & cart", "Payment gateway integration", "Admin panel for orders"],
      },
      {
        icon: <FaMobileAlt />,
        label: "Mobile Development",
        title: "Mobile Apps",
        description: "Production-ready Android and iOS apps on React Native, with backend and admin panel.",
        price: "₹9,000",
        unit: "per project",
        points: ["Android and iOS support", "Backend & admin panel included", "Full source code delivery"],
      },
      {
        icon: <FaCode />,
        label: "Custom Software",
        title: "Custom Software",
        description: "Internal tools, dashboards, or SaaS - built to your exact requirements.",
        price: "₹3,000",
        unit: "per project",
        points: ["Built to your specs", "Web, desktop, or SaaS", "Post-delivery support"],
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        question: "Can I white-label everything?",
        answer: "Absolutely. Your clients will only see your brand. We stay completely invisible in the background as your delivery infrastructure.",
      },
      {
        question: "What exactly do I get for ₹3,999 per website?",
        answer: "A standard marketing website using one of our Website Designs, customized with your client's branding and content, delivered in 3 business days after content is confirmed.",
      },
      {
        question: "Who are your ideal partners?",
        answer: "Freelancers managing 3–20+ client websites per year, and agencies that want to scale delivery without hiring.",
      },
      {
        question: "What if I don't use all websites in my plan?",
        answer: "No problem, your credits stay safe in your account. Even if you lose access to your account, contact our support and we will recover it or give you a new account with the same credit balance.",
      },
      {
        question: "Who handles hosting?",
        answer: "We can deploy the website on Vercel, or hand over the source code so you can host it yourself. You stay in control of domains and client relationships.",
      },
      {
        question: "Do I pay on the website?",
        answer: "Yes, payments on our website are secured by Razorpay. If you prefer, contact our support and pay via UPI or bank transfer instead.",
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

  const growthPerSite = getDisplayPrices(Math.round(29999 / 9));

  const whyReasons = [
    {
      title: "We stay invisible",
      description: "We never compete with you for clients. You own the relationship, the pricing and the credit - we stay behind the curtain.",
      chips: ["No client conflict", "Your brand only"],
    },
    {
      title: "Delivered in 3 business days",
      description: "From confirmed content to a live website in three days. Slow delivery kills deals.",
      chips: ["Day 1 brief", "Day 2 build", "Day 3 live"],
    },
    {
      title: "Predictable cost, zero hiring",
      description: `No salaries, no HR, no surprise invoices. From ${formatPrice(growthPerSite.main)} per website on the Growth plan - you set your own price.`,
      chips: ["No salaries", "Healthy margins"],
    },
    {
      title: "Infrastructure, not another tool",
      description: "No builders to learn. Pick a template with your client and share its Design ID. That's the whole brief.",
      chips: ["100+ designs", "Just a Design ID"],
    },
    {
      title: "Partner-first, always",
      description: "Freelancers and agencies are our only customers. We never sell to end clients, and every project is NDA protected.",
      chips: ["NDA protected", "Partners only"],
    },
  ];

  const contactCard = (
    <div className="rounded-3xl bg-white border border-gray-200 p-6">
      <p className="font-bold text-gray-900 mb-1">Still have questions?</p>
      <p className="text-sm text-gray-600 mb-5">Talk to a founder directly. We usually reply within a few hours.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors duration-200"
        >
          <FaWhatsapp className="text-base" /> WhatsApp
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-[#6498fe] hover:text-[#6498fe] text-gray-900 text-sm font-bold px-5 py-[10px] rounded-xl transition-colors duration-200"
        >
          <FaEnvelope /> Email us
        </a>
      </div>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-white overflow-x-clip">
        <style>{`
          #hero-section { position: relative; overflow: hidden; }

          .hero-glow {
            background:
              radial-gradient(ellipse 70% 55% at 50% 0%, rgba(100,152,254,0.16), transparent 70%),
              radial-gradient(ellipse 40% 35% at 85% 85%, rgba(100,152,254,0.08), transparent 70%);
          }
          .hero-dots-center {
            background-image: radial-gradient(rgba(100, 152, 254, 0.2) 1px, transparent 1px);
            background-size: 24px 24px;
            -webkit-mask-image: radial-gradient(ellipse 65% 55% at 50% 40%, #000 15%, transparent 75%);
            mask-image: radial-gradient(ellipse 65% 55% at 50% 40%, #000 15%, transparent 75%);
          }

          .hero-dots {
            background-image: radial-gradient(rgba(100, 152, 254, 0.22) 1px, transparent 1px);
            background-size: 22px 22px;
            -webkit-mask-image: radial-gradient(ellipse 70% 60% at 72% 45%, #000 20%, transparent 75%);
            mask-image: radial-gradient(ellipse 70% 60% at 72% 45%, #000 20%, transparent 75%);
          }

          .invisible-text { position: relative; display: inline-block; }
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
          .hover-active .invisible-text::before { opacity: 1; }
          @media (max-width: 768px) {
            .hover-active .invisible-text { filter: blur(12px); }
          }

          @keyframes slideUpScale {
            0% { opacity: 0; transform: translateY(40px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }

          .home-marquee-mask {
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }
          .home-marquee-track {
            display: flex;
            width: max-content;
            animation: home-marquee 40s linear infinite;
          }
          @keyframes home-marquee { to { transform: translateX(-50%); } }

          .cta-wordmark {
            font-size: clamp(7rem, 24vw, 22rem);
            letter-spacing: -0.04em;
            color: transparent;
            -webkit-text-stroke: 1px rgba(255,255,255,0.09);
          }
          .cta-floor-wrap {
            perspective: 600px;
            perspective-origin: 50% 0%;
            -webkit-mask-image: linear-gradient(to top, #000 10%, transparent 95%);
            mask-image: linear-gradient(to top, #000 10%, transparent 95%);
          }
          .cta-floor {
            position: absolute;
            left: -50%;
            right: -50%;
            top: 0;
            height: 320%;
            transform: rotateX(68deg);
            transform-origin: 50% 0%;
            background-image:
              linear-gradient(rgba(100,152,254,0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,152,254,0.35) 1px, transparent 1px);
            background-size: 64px 64px;
            will-change: transform;
            animation: cta-floor-move 2.4s linear infinite;
          }
          @keyframes cta-floor-move {
            from { transform: rotateX(68deg) translateY(-64px); }
            to { transform: rotateX(68deg) translateY(0); }
          }
          .cta-spot {
            background: radial-gradient(520px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(100,152,254,0.16), transparent 60%);
          }
          @media (prefers-reduced-motion: reduce) {
            .cta-floor { animation: none; }
          }

          @media (prefers-reduced-motion: reduce) {
            .home-marquee-track { animation: none; }
          }
        `}</style>

        <ScrollProgressBar />

        {/* ── HERO ── */}
        <section
          id="hero-section"
          className="relative min-h-[calc(100svh-68px)] sm:min-h-[calc(100svh-80px)] flex flex-col bg-white overflow-hidden"
        >
          <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true"></div>
          <div className="hero-dots-center absolute inset-0 pointer-events-none" aria-hidden="true"></div>

          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-3.5 py-1.5 mb-7 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                <span className="sm:hidden">White-label delivery for agencies</span>
                <span className="hidden sm:inline">White-label web delivery for agencies & freelancers</span>
              </span>
            </div>

            <h1 className="text-[2.9rem] leading-[0.98] sm:text-6xl lg:text-7xl xl:text-[5.75rem] font-black tracking-[-0.035em] text-gray-950 mb-6">
              Your{" "}
              <span
                className="relative inline-block cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.classList.add("hover-active")}
                onMouseLeave={(e) => e.currentTarget.classList.remove("hover-active")}
                onClick={(e) => e.currentTarget.classList.toggle("hover-active")}
              >
                <span className="invisible-text text-[#6498fe] transition-all duration-700 ease-in-out">Invisible</span>
              </span>
              <br />
              Dev Team
            </h1>

            <div className="mb-6 font-mono min-h-[2.5em] flex items-center justify-center">
              <TypewriterEffect texts={typewriterTexts} speed={100} delay={4500} />
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-9 leading-relaxed max-w-2xl mx-auto font-medium">
              3Digree is a website delivery infrastructure for freelancers and agencies. Use{" "}
              <span className="text-gray-950 font-bold">100+ battle-tested Website Designs</span> and a backend dev team so you can stay focused on clients and sales.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <button
                type="button"
                onClick={scrollToPricing}
                className="bg-gray-950 text-white font-bold px-8 py-4 shadow-xl shadow-gray-900/20 hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] text-base group inline-flex items-center justify-center gap-3 rounded-xl"
              >
                View Pricing Plans
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="bg-white/80 backdrop-blur border border-gray-200 text-gray-900 font-bold px-8 py-4 hover:border-gray-900 transition-colors duration-200 text-base inline-flex items-center justify-center rounded-xl"
              >
                Talk to Us
              </button>
            </div>

            {isAuthenticated && displayName && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 px-4 py-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Welcome back, <span className="font-bold text-gray-950">{displayName}</span>
              </div>
            )}
          </motion.div>

          <div className="relative z-10 mt-auto w-full px-4 pt-12 pb-6 sm:pb-10">
            <div
              ref={statsRef}
              className="mx-auto max-w-xl grid grid-cols-3 divide-x divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)]"
            >
              {[
                { number: "100+", label: "Website designs" },
                { number: "3 days", label: "Delivery" },
                { number: "100%", label: "White-label" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="py-4 sm:py-5 px-2 text-center"
                  style={{
                    opacity: isStatsVisible ? undefined : 0,
                    animation: isStatsVisible ? `slideUpScale 0.7s ease-out ${0.2 + index * 0.12}s both` : "none",
                  }}
                >
                  <div className="text-xl sm:text-3xl font-black text-gray-950 tracking-tight">{stat.number}</div>
                  <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST MARQUEE ── */}
        <section className="py-4 sm:py-5 bg-white border-y border-gray-100 overflow-hidden" aria-label="What we stand for">
          <div className="home-marquee-mask">
            <div className="home-marquee-track">
              {[...trustItems, ...trustItems].map((item, i) => (
                <span key={i} className="flex items-center gap-2 pr-10 text-sm font-semibold text-gray-400 whitespace-nowrap">
                  <span className="text-[#6498fe]">{item.icon}</span>
                  {item.text}
                  <span className="pl-8 text-blue-200 text-xs">◆</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON ── */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="The smarter way to deliver"
              title="Stop choosing between closing deals and delivering them"
              subtitle="Freelancers and agencies hit the same wall: great at selling, stuck on delivery. Here's how your options stack up."
            />

            <div className="md:hidden space-y-3">
              {comparison.map((row, i) => (
                <Reveal key={row.label} delay={i * 0.04}>
                  <div className="rounded-2xl bg-white border border-gray-200 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">{row.label}</div>
                    <div className="flex items-start gap-2 font-bold text-gray-900 mb-3">
                      <FaCheck className="text-emerald-500 mt-1 flex-shrink-0 text-xs" />
                      <span>
                        {row.us}
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6498fe]">3Digree</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
                      <div>
                        <div className="font-semibold text-gray-400 mb-0.5">Hiring a developer</div>
                        {row.hire}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-400 mb-0.5">Marketplaces</div>
                        {row.market}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="hidden md:block">
              <div>
                <div className="grid grid-cols-[1.15fr_1fr_1fr_1.1fr] text-[15px]">
                  <div className="py-4"></div>
                  <div className="py-4 px-4 font-bold text-gray-500">Hiring a developer</div>
                  <div className="py-4 px-4 font-bold text-gray-500">Freelance marketplaces</div>
                  <div className="py-4 px-5 font-black text-white bg-[#6498fe] rounded-t-2xl">3Digree</div>

                  {comparison.map((row, i) => {
                    const last = i === comparison.length - 1;
                    return (
                      <React.Fragment key={row.label}>
                        <div className="py-4 pr-4 font-bold text-gray-900 border-t border-gray-200">{row.label}</div>
                        <div className="py-4 px-4 text-gray-500 border-t border-gray-200 flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0"></span>
                          {row.hire}
                        </div>
                        <div className="py-4 px-4 text-gray-500 border-t border-gray-200 flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0"></span>
                          {row.market}
                        </div>
                        <div
                          className={`py-4 px-5 font-semibold text-gray-900 bg-white border-x-2 border-[#6498fe] border-t border-t-blue-100 flex items-start gap-2 ${
                            last ? "border-b-2 rounded-b-2xl" : ""
                          }`}
                        >
                          <FaCheck className="text-emerald-500 mt-1 flex-shrink-0 text-xs" />
                          {row.us}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        {isDesktop ? (
          <StoryHowItWorks steps={steps} />
        ) : (
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="How it works"
              title="From signed client to live website in four steps"
              subtitle="A smooth white-label workflow, built so you never have to manage developers again."
            />

            <div className="relative grid lg:grid-cols-4 gap-0 lg:gap-8 max-w-xl lg:max-w-none mx-auto">
              <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-100 via-[#6498fe] to-blue-100" aria-hidden="true"></div>
              {steps.map((step, index) => (
                <Reveal key={step.number} delay={index * 0.1}>
                  <div className="relative flex lg:flex-col gap-5 lg:gap-6 lg:items-center lg:text-center pb-10 lg:pb-0">
                    {index < steps.length - 1 && (
                      <div className="lg:hidden absolute left-6 top-14 bottom-2 w-px bg-blue-100" aria-hidden="true"></div>
                    )}
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#6498fe] text-[#6498fe] font-black flex items-center justify-center shadow-[0_0_0_6px_white]">
                      {step.number}
                    </div>
                    <div>
                      <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                        {step.tag}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── WHY AGENCIES CHOOSE US (x-ray) ── */}
        <WhyXRay reasons={whyReasons} lite={!isDesktop} />

        {/* ── PRICING ── */}
        <section id="pricing" className="py-16 sm:py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Pricing"
              title="Simple plans. Healthy margins."
              subtitle="Buy credits once and use them whenever a client signs. One credit = one website."
            />

            {process.env.NODE_ENV === "development" && (
              <div className="text-center -mt-6 mb-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs text-gray-600">
                  Detected Region: <span className="font-bold text-green-600">{userRegion}</span> (dev only)
                </span>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6 max-w-6xl mx-auto pt-4">
              {pricingPlans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 0.08} className={index === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
                  <PricingCard
                    {...plan}
                    onGetPlan={handleGetPlan}
                    getDisplayPrices={getDisplayPrices}
                    loading={loading}
                    selectedPlan={selectedPlan}
                  />
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs sm:text-sm font-medium text-gray-500">
              <span className="flex items-center gap-2"><FaShieldAlt className="text-[#6498fe]" /> Secure payments via Razorpay</span>
              <span className="flex items-center gap-2"><FaCoins className="text-[#6498fe]" /> UPI & bank transfer on request</span>
              <span className="flex items-center gap-2"><FaLock className="text-[#6498fe]" /> Unused credits stay in your account</span>
            </div>

            {/* Beyond websites */}
            <div className="max-w-6xl mx-auto mt-16 sm:mt-20">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Beyond websites</h3>
                <p className="text-gray-500">E-commerce stores, mobile apps and custom software.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((s, index) => (
                  <Reveal key={s.title} delay={index * 0.08} className={index === services.length - 1 ? "md:col-span-2 lg:col-span-1" : ""}>
                    <div className="h-full rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 flex flex-col gap-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-gray-900 text-white text-lg flex items-center justify-center">{s.icon}</div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{s.label}</span>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">{s.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.description}</p>
                        <ul className="space-y-2">
                          {s.points.map((p) => (
                            <li key={p} className="flex items-start gap-2.5 text-sm text-gray-700">
                              <FaCheck className="text-emerald-500 text-xs mt-1 flex-shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between items-end gap-4 pt-5 border-t border-gray-100">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Starting</div>
                          <div className="text-3xl font-black text-gray-900">{s.price}</div>
                          <div className="text-xs text-gray-500">{s.unit}</div>
                        </div>
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors duration-200 group"
                        >
                          Get a quote
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <SectionTestimonials />

        {/* ── FOUNDERS ── */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
                <div className="flex -space-x-4 flex-shrink-0">
                  {["/f1.png", "/f2.png"].map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={i === 0 ? "Akshat Raj" : "Shreyansh Kumawat"}
                      loading="lazy"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover object-top border-4 border-white shadow-md bg-blue-50"
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-2">
                    Built by two
                    <br />
                    freelancers who
                    <br />
                    hit the same wall
                    <br />
                    you did.
                  </p>
                  <p className="text-gray-600">
                    Akshat Raj & Shreyansh Kumawat built the delivery infrastructure they wished they had - so you can grow without limits.
                  </p>
                </div>
                <Link
                  to="/about"
                  className="flex-shrink-0 inline-flex items-center gap-2 font-bold text-gray-900 border-2 border-gray-200 bg-white rounded-xl px-6 py-3 hover:border-[#6498fe] hover:text-[#6498fe] transition-colors duration-200 group"
                >
                  Read our story
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-16">
            <div className="lg:sticky lg:top-28 self-start">
              <SectionHeader
                align="left"
                eyebrow="FAQ"
                title="Questions, answered"
                subtitle="Everything you need to know before getting started with white-label website delivery."
                className="mb-8"
              />
              <Reveal className="hidden lg:block">{contactCard}</Reveal>
            </div>

            <Reveal>
              <div className="rounded-3xl bg-white border border-gray-200 px-5 sm:px-8">
                {faqs.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
              <div className="lg:hidden mt-5">{contactCard}</div>
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <FinalCTA onViewPlans={scrollToPricing} />
      </div>
    </MotionConfig>
  );
};

export default Home;
