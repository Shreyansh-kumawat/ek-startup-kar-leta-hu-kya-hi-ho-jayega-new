import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Card from '../components/Card';
import Button from '../components/Button';
import { createPlanOrder, openRazorpayCheckout } from '../services/planApi';

// ✅ SMART CURRENCY HOOK - NO LIBRARY NEEDED
const useSmartCurrency = () => {
  const [rates, setRates] = useState({ USD: 0.012 });
  const [userRegion, setUserRegion] = useState('IN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Method 1: IP Geolocation (Most Reliable)
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        console.log('🌍 Detected Region:', ipData.country_code, ipData.country_name);
        setUserRegion(ipData.country_code || 'IN');

        // Fetch live exchange rates
        const ratesResponse = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);

        setLoading(false);
      } catch (error) {
        console.error('❌ Region detection failed:', error);
        // Fallback: Use browser timezone to guess region
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('⏰ Timezone fallback:', timezone);

        // Guess region from timezone
        if (timezone.includes('America')) setUserRegion('US');
        else if (timezone.includes('Europe')) setUserRegion('GB');
        else if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) setUserRegion('IN');
        else setUserRegion('US'); // Default to US

        setRates({ USD: 0.012 }); // Fallback rate
        setLoading(false);
      }
    };

    detectRegion();
  }, []);

  // Smart currency display logic
  const getDisplayPrices = (inrAmount) => {
    const usdAmount = Math.round(inrAmount * rates.USD);

    if (userRegion === 'IN') {
      // India: INR big, USD small
      return {
        main: { amount: inrAmount, symbol: '₹', code: 'INR' },
        secondary: { amount: usdAmount, symbol: '$', code: 'USD' }
      };
    } else if (userRegion === 'US') {
      // USA: Only USD
      return {
        main: { amount: usdAmount, symbol: '$', code: 'USD' },
        secondary: null
      };
    } else {
      // Other regions: USD big, Local small
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
        // Unknown region: Only USD
        return {
          main: { amount: usdAmount, symbol: '$', code: 'USD' },
          secondary: null
        };
      }
    }
  };

  return { getDisplayPrices, userRegion, loading };
};

// ✅ PRICING CARD WITH SMART CURRENCY
const PricingCard = memo(({ 
  title, 
  price, 
  websites, 
  bestFor, 
  features, 
  popular, 
  gradient, 
  badge, 
  onGetPlan, 
  loading, 
  selectedPlan,
  getDisplayPrices 
}) => {
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

        {/* SMART PRICE DISPLAY */}
        <div className="relative inline-block mb-4">
          {/* Main Price (Big) */}
          <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500`}>
            {displayPrices.main.symbol}{displayPrices.main.amount.toLocaleString('en-US')}
          </div>

          {/* Secondary Price (Small) - Only if exists */}
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

        {/* Per Website Price */}
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
      title: "Starter",
      price: 32000,
      websites: "8",
      bestFor: "Solo freelancers with steady clients",
      features: [
        "100+ Client Ready Website Templates",
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
          addNotification({
            type: 'success',
            message: `🎉 ${planTitle} plan activated! Credits added to your account.`
          });
          updateCredits(verifyResponse.data.user.credits);
          setTimeout(() => navigate('/dashboard'), 1500);
        },
        (error) => {
          addNotification({
            type: 'error',
            message: error.message || 'Payment failed. Please try again.'
          });
          setLoading(false);
          setSelectedPlan(null);
        }
      );

    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to initiate payment'
      });
      setLoading(false);
      setSelectedPlan(null);
    }
  };

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

            {/* Region Detection Debug Badge (Only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <span className="text-sm text-gray-600">
                  🌍 Detected Region: <span className="font-bold text-green-600">{userRegion}</span>
                </span>
              </div>
            )}
          </div>

          {/* 3 PRICING CARDS */}
          <div className="grid md:grid-cols-3 gap-10 mb-24 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard 
                key={plan.title} 
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
                    onClick={() => handleGetPlan('Single Website', 5000)}
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
