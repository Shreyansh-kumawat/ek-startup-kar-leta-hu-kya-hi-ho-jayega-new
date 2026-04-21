import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";
import Lenis from "lenis";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaCode,
  FaEnvelope,
  FaGlobe,
  FaHandshake,
  FaLayerGroup,
  FaPhone,
  FaRocket,
  FaShieldAlt,
  FaWhatsapp,
} from "react-icons/fa";
import SectionTestimonials from "../components/SectionTestimonials";

const useSmartCurrency = () => {
  const [rates, setRates] = useState({ USD: 0.012 });
  const [userRegion, setUserRegion] = useState("IN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        const ipResponse = await fetch("https://ipapi.co/json/");
        const ipData = await ipResponse.json();
        setUserRegion(ipData?.country_code || "IN");

        const ratesResponse = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
        const ratesData = await ratesResponse.json();
        setRates(ratesData?.rates || { USD: 0.012 });
      } catch (error) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes("America")) setUserRegion("US");
        else if (timezone.includes("Europe")) setUserRegion("GB");
        else setUserRegion("IN");
        setRates({ USD: 0.012, GBP: 0.0095, EUR: 0.011, CAD: 0.016, AUD: 0.018 });
      } finally {
        setLoading(false);
      }
    };

    detectRegion();
  }, []);

  const getDisplayPrices = (inrAmount) => {
    if (inrAmount === undefined || inrAmount === null) {
      return {
        main: { amount: 0, symbol: "₹", code: "INR" },
        secondary: null,
      };
    }

    const usdAmount = Math.round(inrAmount * (rates?.USD || 0.012));

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
      GB: { rate: rates?.GBP || 0.0095, symbol: "£", code: "GBP" },
      CA: { rate: rates?.CAD || 0.016, symbol: "CA$", code: "CAD" },
      AU: { rate: rates?.AUD || 0.018, symbol: "A$", code: "AUD" },
      DE: { rate: rates?.EUR || 0.011, symbol: "€", code: "EUR" },
      FR: { rate: rates?.EUR || 0.011, symbol: "€", code: "EUR" },
      IT: { rate: rates?.EUR || 0.011, symbol: "€", code: "EUR" },
      ES: { rate: rates?.EUR || 0.011, symbol: "€", code: "EUR" },
    };

    const localCurrency = localCurrencyMap[userRegion];

    if (!localCurrency) {
      return {
        main: { amount: usdAmount, symbol: "$", code: "USD" },
        secondary: null,
      };
    }

    return {
      main: { amount: usdAmount, symbol: "$", code: "USD" },
      secondary: {
        amount: Math.round(inrAmount * localCurrency.rate),
        symbol: localCurrency.symbol,
        code: localCurrency.code,
      },
    };
  };

  return { getDisplayPrices, userRegion, loading };
};

const TypewriterEffect = memo(({ texts, speed = 90, hold = 1800 }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex] || "";
    const isDoneTyping = charIndex === current.length;
    const isDoneDeleting = charIndex === 0;

    const timeout = setTimeout(
      () => {
        if (!isDeleting && !isDoneTyping) {
          setCharIndex((prev) => prev + 1);
          return;
        }

        if (!isDeleting && isDoneTyping) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !isDoneDeleting) {
          setCharIndex((prev) => prev - 1);
          return;
        }

        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      },
      !isDeleting && isDoneTyping ? hold : isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, hold, isDeleting, speed, textIndex, texts]);

  return (
    <span className="inline-flex min-h-[2.5rem] items-center text-lg font-semibold text-slate-700 sm:text-2xl">
      {texts[textIndex]?.slice(0, charIndex)}
      <span className="ml-1 animate-pulse text-[#6498fe]">|</span>
    </span>
  );
});

TypewriterEffect.displayName = "TypewriterEffect";

const SectionHeader = memo(({ badge, title, description }) => (
  <div className="mx-auto mb-14 max-w-3xl text-center">
    <div className="mb-4 inline-flex items-center rounded-full border border-[#6498fe]/20 bg-[#6498fe]/10 px-4 py-2 text-sm font-semibold text-[#3b6fe0]">
      {badge}
    </div>
    <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
      {title}
    </h2>
    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
      {description}
    </p>
  </div>
));

SectionHeader.displayName = "SectionHeader";

const StatCard = memo(({ value, label }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="text-3xl font-black text-slate-900 sm:text-4xl">{value}</div>
    <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">{label}</p>
  </div>
));

StatCard.displayName = "StatCard";

const BenefitCard = memo(({ icon: Icon, title, description }) => (
  <Card className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6498fe]/30 hover:shadow-xl">
    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6498fe]/10 text-xl text-[#3b6fe0]">
      <Icon />
    </div>
    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-3 leading-7 text-slate-600">{description}</p>
  </Card>
));

BenefitCard.displayName = "BenefitCard";

const StepCard = memo(({ number, title, description }) => (
  <Card className="relative h-full rounded-3xl border border-slate-200 bg-white p-7 pt-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6498fe]/30 hover:shadow-xl">
    <div className="absolute left-6 top-0 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white shadow-lg">
      {number}
    </div>
    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-3 leading-7 text-slate-600">{description}</p>
  </Card>
));

StepCard.displayName = "StepCard";

const FAQItem = memo(({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="text-base font-bold text-slate-900 sm:text-lg">{question}</span>
        <span className={`text-2xl font-light text-[#6498fe] transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}>
          +
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-6 py-5 text-slate-600">{answer}</div>
        </div>
      </div>
    </Card>
  );
});

FAQItem.displayName = "FAQItem";

const PricingCard = memo(({ title, websites, price, strikePrice, bestFor, features, popular, onGetPlan, getDisplayPrices }) => {
  const main = getDisplayPrices(price);
  const strike = getDisplayPrices(strikePrice);
  const perWebsite = getDisplayPrices(Math.round(price / websites));

  return (
    <Card
      className={`relative h-full rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        popular
          ? "border-[#6498fe] bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {popular && (
        <div className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
          Most popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className={`mt-2 text-sm ${popular ? "text-slate-300" : "text-slate-500"}`}>{bestFor}</p>
      </div>

      <div className="mb-6">
        <div className={`text-sm line-through ${popular ? "text-slate-400" : "text-slate-400"}`}>
          {strike.main.symbol}
          {strike.main.amount.toLocaleString("en-US")}
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-black">
            {main.main.symbol}
            {main.main.amount.toLocaleString("en-US")}
          </span>
          <span className={`pb-1 text-sm ${popular ? "text-slate-300" : "text-slate-500"}`}>
            / plan
          </span>
        </div>
        <div className={`mt-2 text-sm ${popular ? "text-slate-300" : "text-slate-500"}`}>
          {websites} websites · {perWebsite.main.symbol}
          {perWebsite.main.amount.toLocaleString("en-US")} per website
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <FaCheckCircle className={`mt-1 shrink-0 ${popular ? "text-[#8fb2ff]" : "text-[#3b6fe0]"}`} />
            <span className={`${popular ? "text-slate-200" : "text-slate-600"}`}>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onGetPlan(title, price)}
        className={`mt-8 w-full rounded-2xl px-6 py-4 font-bold transition-all duration-300 ${
          popular
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-900 text-white hover:bg-[#3b6fe0]"
        }`}
      >
        Choose {title}
      </Button>
    </Card>
  );
});

PricingCard.displayName = "PricingCard";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getDisplayPrices, loading: currencyLoading } = useSmartCurrency();
  const heroRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return undefined;

    const interval = setInterval(() => {
      const bubble = document.createElement("span");
      bubble.className = "hero-bubble";
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.width = `${Math.random() * 18 + 8}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.animationDuration = `${Math.random() * 6 + 8}s`;
      section.appendChild(bubble);

      setTimeout(() => bubble.remove(), 10000);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  const displayName = user?.name || user?.username;

  const typewriterTexts = useMemo(
    () => [
      "without hiring a full-time dev team",
      "in 3 business days",
      "without breaking your margins",
    ],
    []
  );

  const stats = useMemo(
    () => [
      { value: "100+", label: "Ready website designs" },
      { value: "3 days", label: "Typical delivery time" },
      { value: "100%", label: "White-label friendly" },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: FaLayerGroup,
        title: "Delivery infrastructure, not another tool",
        description:
          "Tum design choose karo, client ka content do, aur build hum handle karein. No builder learning curve, no random freelancer chasing.",
      },
      {
        icon: FaHandshake,
        title: "Pure white-label backend partner",
        description:
          "Client relation tumhari rahegi. Pricing tumhari, branding tumhari, credit tumhara. Hum background mein invisible delivery team ki tarah kaam karte hain.",
      },
      {
        icon: FaShieldAlt,
        title: "Predictable cost, scalable margin",
        description:
          "Hiring, HR, revision chaos aur uneven freelancer quality ki tension kam. Clear pricing ke saath website delivery ko system bana do.",
      },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        number: "01",
        title: "Plan choose karo",
        description:
          "Apni agency ke flow ke hisaab se yearly plan ya single website option choose karo.",
      },
      {
        number: "02",
        title: "Dashboard access lo",
        description:
          "Tumhe ek simple dashboard milta hai jahan se credits, submissions aur project flow manage hota hai.",
      },
      {
        number: "03",
        title: "Template + content submit karo",
        description:
          "Client ke saath website design choose karo, content finalize karo, aur details bhej do.",
      },
      {
        number: "04",
        title: "Website deliver lo",
        description:
          "3 business days ke around polished marketing website ready mil jaati hai jo tum apne brand ke naam se present kar sakte ho.",
      },
    ],
    []
  );

  const pricingPlans = useMemo(
    () => [
      {
        title: "Growth",
        websites: 3,
        price: 11999,
        strikePrice: 15000,
        bestFor: "Small teams and boutique agencies",
        features: [
          "3 website credits",
          "Priority delivery queue",
          "Better unit economics from day one",
          "Customization support",
        ],
        popular: true,
      },
      {
        title: "Scale",
        websites: 9,
        price: 29999,
        strikePrice: 45000,
        bestFor: "Agencies handling regular monthly volume",
        features: [
          "9 website credits",
          "Lower per-site cost",
          "Flexible scope handling",
          "Priority support + faster coordination",
        ],
        popular: false,
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        question: "Agar plan ke saare website credits use na ho to?",
        answer:
          "Credits tumhare account mein safe rehte hain. Agar access issue aaye to support se recover karwa sakte ho.",
      },
      {
        question: "Single website mein exactly kya milta hai?",
        answer:
          "A branded marketing website, selected design reference ke basis par, client content ke saath customized build aur delivery timeline ke andar handoff.",
      },
      {
        question: "Hosting kaun handle karega?",
        answer:
          "Deployment hum help kar sakte hain, ya source code handoff kar sakte hain. Domain aur client relationship tumhare control mein rehti hai.",
      },
      {
        question: "Kya yeh fully white-label hai?",
        answer:
          "Haan. Client side par tumhari agency hi visible rahegi. Hum backend execution partner ki tarah kaam karte hain.",
      },
    ],
    []
  );

  const handleGetPlan = (plan, price) => {
    const payload = { plan, price, timestamp: new Date().toISOString() };
    localStorage.setItem("selectedPlan", JSON.stringify(payload));
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (currencyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#6498fe]" />
      </div>
    );
  }

  const singleWebsite = getDisplayPrices(4999);
  const singleStrike = getDisplayPrices(7999);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
      <style>{`
        .hero-bubble {
          position: absolute;
          bottom: -30px;
          border-radius: 9999px;
          pointer-events: none;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(100,152,254,0.45));
          box-shadow: 0 10px 30px rgba(100,152,254,0.18);
          animation: floatBubble linear forwards;
          opacity: 0.7;
        }

        @keyframes floatBubble {
          0% {
            transform: translateY(0) translateX(0) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(-110vh) translateX(40px) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>

      <section ref={heroRef} className="relative isolate overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(100,152,254,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,111,224,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#6498fe]/20 bg-[#6498fe]/10 px-4 py-2 text-sm font-semibold text-[#3b6fe0]">
                3Digree · White-label website delivery partner
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-7xl">
                Agencies ke liye
                <span className="block text-[#3b6fe0]">invisible dev team</span>
                jo websites deliver kare
              </h1>

              <div className="mt-5">
                <TypewriterEffect texts={typewriterTexts} />
              </div>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Paste reference ke content ko clean karke yahan ek proper homepage banaya gaya hai — clearer messaging, better hierarchy, stronger CTAs aur mobile-friendly layout ke saath.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b6fe0]"
                >
                  View pricing plans
                  <FaArrowRight />
                </button>
                <Link
                  to="/templates"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-bold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:text-slate-900"
                >
                  Explore website designs
                </Link>
              </div>

              {isAuthenticated && displayName && (
                <div className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  Welcome back, <span className="ml-1 font-black text-slate-900">{displayName}</span>
                </div>
              )}

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Agency workflow</p>
                    <h3 className="mt-2 text-2xl font-black">Client se delivery tak sorted flow</h3>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-xl">
                    <FaCode />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["Template selected", "Client ne design approve kiya"],
                    ["Content submitted", "Branding, copy aur assets lock hue"],
                    ["Build in progress", "Backend team execution handle kar rahi hai"],
                    ["Ready to present", "Tum apne brand ke under client ko dikhate ho"],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <FaCheckCircle className="mt-1 shrink-0 text-[#8fb2ff]" />
                        <div>
                          <p className="font-bold text-white">{title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-4 text-slate-900">
                    <p className="text-sm text-slate-500">Single website</p>
                    <p className="mt-1 text-2xl font-black">
                      {singleWebsite.main.symbol}
                      {singleWebsite.main.amount.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-4">
                    <p className="text-sm text-slate-400">Delivery target</p>
                    <p className="mt-1 text-2xl font-black text-white">3 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Why agencies use this"
          title="Homepage ko proper business pitch mein convert kiya"
          description="Reference content ka core idea same rakha gaya hai, but messy visuals, inconsistent cards aur broken hierarchy hata ke ek structured landing experience banaya gaya hai."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            badge="How it works"
            title="Simple process, kam friction"
            description="Freelancers aur agencies ko extra operations load na aaye, isliye flow ko intentionally lean rakha gaya hai."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Pricing"
          title="Clear pricing, better conversion"
          description="Pricing cards ko clean kiya gaya hai taaki value instantly samajh aaye aur CTA direct lage."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.title}
              {...plan}
              onGetPlan={handleGetPlan}
              getDisplayPrices={getDisplayPrices}
            />
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b6fe0]">Single website option</p>
              <h3 className="mt-3 text-3xl font-black text-slate-900">Not ready for a plan yet?</h3>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Ek project ke basis par bhi start kar sakte ho. Same white-label quality, same delivery intent, no yearly commitment.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <div className="text-sm text-slate-400 line-through">
                {singleStrike.main.symbol}
                {singleStrike.main.amount.toLocaleString("en-US")}
              </div>
              <div className="mt-1 text-4xl font-black text-slate-900">
                {singleWebsite.main.symbol}
                {singleWebsite.main.amount.toLocaleString("en-US")}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {[
                "Standard business website",
                "Reference design based build",
                "Fast delivery flow",
              ].map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>

            <Button
              onClick={() => handleGetPlan("Single Website", 4999)}
              className="rounded-2xl bg-slate-900 px-7 py-4 font-bold text-white transition-all duration-300 hover:bg-[#3b6fe0]"
            >
              Get single website
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Trust + support"
            title="Operational confidence bhi visible hona chahiye"
            description="Homepage mein sales ke saath trust signals aur support channels ka section bhi add kiya gaya hai."
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <Card className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
              <h3 className="text-2xl font-black">What agencies care about</h3>
              <div className="mt-6 space-y-5">
                {[
                  {
                    icon: FaClock,
                    title: "Faster turnaround",
                    desc: "Client wait time kam hota hai aur tum more deals close kar paate ho.",
                  },
                  {
                    icon: FaGlobe,
                    title: "Consistent delivery quality",
                    desc: "Har project ko random freelancer dependency ke bina system se nikaala ja sakta hai.",
                  },
                  {
                    icon: FaRocket,
                    title: "Better scaling path",
                    desc: "Sales pe focus maintain karte hue backend execution outsource jaisa nahin, process-driven lagta hai.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="rounded-2xl bg-white/10 p-3 text-[#8fb2ff]">
                      <Icon />
                    </div>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900">Direct support channels</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Homepage mein contact-related signals ko bhi clean tarike se present kiya gaya hai.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { icon: FaWhatsapp, title: "WhatsApp support", desc: "Quick communication for urgent coordination" },
                  { icon: FaEnvelope, title: "Email coordination", desc: "Structured updates and asset flow" },
                  { icon: FaPhone, title: "Call alignment", desc: "Fast clarity when scope needs discussion" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="rounded-2xl bg-slate-100 p-3 text-[#3b6fe0]">
                      <Icon />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Testimonials"
          title="Social proof section preserve kiya"
          description="Agar imported testimonial component available hai to usko page flow ke andar cleaner spacing ke saath retain kiya gaya hai."
        />
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <SectionTestimonials />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            badge="FAQ"
            title="Important objections bhi cover kiye"
            description="Conversion page ko complete feel dene ke liye FAQ structure ko bhi clean accordion ke saath retain kiya gaya hai."
          />
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-slate-900 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Final CTA</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Ready to turn website delivery into a system?</h2>
              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                Agar tum deals close kar sakte ho, to delivery side ko process bana ke margins aur speed dono improve kar sakte ho.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={scrollToPricing}
                className="rounded-2xl bg-white px-7 py-4 font-bold text-slate-900 transition-all duration-300 hover:bg-slate-100"
              >
                View pricing
              </button>
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="rounded-2xl border border-white/20 px-7 py-4 text-center font-bold text-white transition-all duration-300 hover:bg-white/10"
              >
                {isAuthenticated ? "Go to dashboard" : "Get started"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
