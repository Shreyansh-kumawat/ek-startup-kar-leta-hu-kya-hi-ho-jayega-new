import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Card from '../components/Card';
import Button from '../components/Button';
import { createPlanOrder, openRazorpayCheckout } from '../services/planApi';
import { FaAndroid, FaCode, FaArrowRight, FaCheck, FaShoppingCart } from 'react-icons/fa';

// ✅ SMART CURRENCY HOOK
const useSmartCurrency = () => {
  const [rates, setRates] = useState({ USD: 0.012 });
  const [userRegion, setUserRegion] = useState('IN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        setUserRegion(ipData.country_code || 'IN');
        const ratesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);
        setLoading(false);
      } catch (error) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('America')) setUserRegion('US');
        else if (timezone.includes('Europe')) setUserRegion('GB');
        else if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) setUserRegion('IN');
        else setUserRegion('US');
        setRates({ USD: 0.012 });
        setLoading(false);
      }
    };
    detectRegion();
  }, []);

  const getDisplayPrices = (inrAmount) => {
    const usdAmount = Math.round(inrAmount * (rates.USD || 0.012));
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
      }
      return { main: { amount: usdAmount, symbol: '$', code: 'USD' }, secondary: null };
    }
  };

  return { getDisplayPrices, userRegion, loading };
};

// ✅ PRICING CARD — NaN FIXED (using credits number directly)
const PricingCard = memo(({
  title,
  price,
  credits,
  bestFor,
  features,
  popular,
  gradient,
  onGetPlan,
  loading,
  selectedPlan,
  getDisplayPrices
}) => {
  // FIX: use credits (number) instead of parseInt(websites) which was NaN
  const websiteCount = Number(credits) || 1;
  const pricePerWebsite = Math.round(price / websiteCount);
  const displayPrices = getDisplayPrices(price);
  const displayPerWebsite = getDisplayPrices(pricePerWebsite);

  return (
    <Card className={`relative p-8 sm:p-10 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group overflow-hidden ${
      popular
        ? 'border-[#6498fe] shadow-2xl scale-105 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        : 'border-gray-200 hover:border-[#6498fe] bg-white'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#6498fe] via-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

      <div className="relative z-10 text-center mb-8">
        {popular && (
          <div className="inline-block mb-3">
            <span className="bg-gradient-to-r from-[#6498fe] to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              ⭐ Most Popular
            </span>
          </div>
        )}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-[#6498fe] transition-colors duration-300">
          {title}
        </h3>

        <div className="relative inline-block mb-4">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform duration-500">
            {displayPrices.main.symbol}{displayPrices.main.amount.toLocaleString('en-US')}
          </div>
          {displayPrices.secondary && (
            <div className="text-base font-semibold text-gray-500 mt-1">
              ≈ {displayPrices.secondary.symbol}{displayPrices.secondary.amount.toLocaleString('en-US')} {displayPrices.secondary.code}
            </div>
          )}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-[3px] bg-[#6498fe] rounded-full"></div>
        </div>

        <p className="text-gray-700 font-semibold text-xl mb-1 mt-2">
          <span className="font-bold">{websiteCount}</span> websites
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
          disabled={loading && selectedPlan === title}
          className={`w-full font-bold py-5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden group/btn cursor-pointer ${
            popular
              ? 'bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
              : 'bg-black text-white border-2 border-gray-300 hover:bg-gradient-to-r hover:from-[#6498fe] hover:to-purple-600 hover:text-white hover:border-[#6498fe]'
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </div>
    </Card>
  );
});

PricingCard.displayName = 'PricingCard';

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateCredits } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { getDisplayPrices, userRegion, loading: currencyLoading } = useSmartCurrency();

  useEffect(() => {
    document.title = "Plans and Pricing | 3Digree";
  }, []);

  const pricingPlans = useMemo(() => [
    {
      id: 'growth',
      title: 'Starter',
      price: 10999,
      credits: 3,
      gradient: 'from-[#6498fe] to-purple-600',
      bestFor: 'Small teams and boutique agencies',
      features: [
        '3 website credits',
        '₹3,666 per website',
        'Priority delivery queue',
        'Advanced customization',
        'Dedicated support channel'
      ],
      popular: false
    },
    {
      id: 'scale',
      title: 'Growth',
      price: 29999,
      credits: 9,
      gradient: 'from-purple-600 to-pink-600',
      bestFor: 'High-volume agencies',
      features: [
        '9 website credits',
        '~₹3,333 per website',
        'Custom scope flexibility',
        'Account manager assigned',
        '24/7 priority support'
      ],
      popular: false
    }
  ], []);

  const handleGetPlan = async (planTitle, planPrice) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    try {
      setLoading(true);
      setSelectedPlan(planTitle);
      const orderResponse = await createPlanOrder(planTitle);
      await openRazorpayCheckout(
        orderResponse.data,
        (verifyResponse) => {
          addNotification({ type: 'success', message: `🎉 ${planTitle} plan activated! Credits added to your account.` });
          updateCredits(verifyResponse.data.user.credits);
          setTimeout(() => navigate('/dashboard'), 1500);
        },
        (error) => {
          addNotification({ type: 'error', message: error.message || 'Payment failed. Please try again.' });
          setLoading(false);
          setSelectedPlan(null);
        }
      );
    } catch (error) {
      addNotification({ type: 'error', message: error.message || 'Failed to initiate payment' });
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const singleWebsiteDisplay = getDisplayPrices(3999);
  const singleWebsiteStrikeDisplay = getDisplayPrices(9999);

  if (currencyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600" aria-hidden="true"></div>

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
                </span>
              </div>
            )}
          </div>

          {/* ✅ FIXED: 2-column grid (was 3, only 2 plans exist) */}
          <div className="grid md:grid-cols-2 gap-10 mb-24 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                {...plan}
                onGetPlan={handleGetPlan}
                loading={loading}
                selectedPlan={selectedPlan}
                getDisplayPrices={getDisplayPrices}
              />
            ))}
          </div>

          {/* SINGLE WEBSITE CARD */}
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
                      Not ready for a Bulk Plan?
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
                      <div className="text-sm font-medium text-gray-400 line-through mb-0.5">
                        {singleWebsiteStrikeDisplay.main.symbol}{singleWebsiteStrikeDisplay.main.amount.toLocaleString('en-US')}
                      </div>
                      <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
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
                      { text: "100+ Website Designs" },
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
                    onClick={() => handleGetPlan('Single Website', 3999)}
                    disabled={loading && selectedPlan === 'Single Website'}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 sm:px-14 py-4 sm:py-5 shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg relative overflow-hidden group cursor-pointer rounded-xl inline-flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && selectedPlan === 'Single Website' ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="relative z-10">Get Plan</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* CUSTOM SERVICES — Android / Software */}
          <div className="max-w-6xl mx-auto mt-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Custom Services</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                Beyond Websites
              </h3>
              <p className="text-slate-500">
                Mobile apps and custom software, quoted per project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* ANDROID APP CARD */}
              <div className="group relative bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 hover:border-slate-900 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center">
                    <FaAndroid className="text-white text-xl" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mobile Development
                  </div>
                </div>

                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  Android Apps
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Production-ready mobile apps built on React Native, with backend and admin panel.
                </p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">₹9,000</span>
                  <span className="text-sm text-slate-500">/ project</span>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {[
                    'All Android devices',
                    'Backend & admin panel included',
                    'Full source code delivery',
                    'Scalable architecture',
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg transition-colors group/btn"
                >
                  Request Quote
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* SOFTWARE CARD */}
              <div className="group relative bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 hover:border-slate-900 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[#6498fe] shadow-[0_0_0_4px_rgba(100,152,254,0.15)]"></div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center">
                    <FaCode className="text-white text-xl" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Custom Software
                  </div>
                </div>

                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  Custom Software
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Tailored software solutions built to your exact requirements — internal tools, dashboards, or SaaS.
                </p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">₹3,000</span>
                  <span className="text-sm text-slate-500">/ project</span>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {[
                    'Built to your specs',
                    'Web, desktop, or SaaS',
                    'Source code included',
                    'Post-delivery support',
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg transition-colors group/btn"
                >
                  Request Quote
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Pricing;
