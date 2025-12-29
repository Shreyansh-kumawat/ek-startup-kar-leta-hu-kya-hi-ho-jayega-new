import React, { useState, useEffect } from 'react';
import { createPlanOrder, openRazorpayCheckout } from '../services/planApi';
import { useNotification } from '../hooks/useNotification';


const PlanPurchaseModal = ({ isOpen, onClose, onSuccess, preSelectedPlan }) => { // ✅ ADDED preSelectedPlan
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);


  // ✅ NEW: Handle preSelectedPlan from Pricing page
  useEffect(() => {
    if (preSelectedPlan) {
      setSelectedPlan(preSelectedPlan);
    }
  }, [preSelectedPlan]);


  // Plan configuration
  const plans = [
    {
      id: 'starter', // ✅ ADDED id
      type: 'Starter',
      price: 30000,
      credits: 12,
      pricePerWebsite: 2500,
      badge: '/silver.png',
      gradient: 'from-blue-600 to-blue-700',
      bestFor: 'Solo freelancers with steady clients',
      features: [
        '12 website credits',
        '₹2,500 per website',
        '3-day delivery',
        'Fully white-label',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'growth', // ✅ ADDED id
      type: 'Growth',
      price: 60000,
      credits: 30,
      pricePerWebsite: 2000,
      badge: '/gold.png',
      gradient: 'from-[#6498fe] to-purple-600',
      bestFor: 'Small teams and boutique agencies',
      features: [
        '30 website credits',
        '₹2,000 per website',
        'Priority delivery queue',
        'Advanced customization',
        'Dedicated support channel'
      ],
      popular: true
    },
    {
      id: 'scale', // ✅ ADDED id
      type: 'Scale',
      price: 100000,
      credits: 65,
      pricePerWebsite: 1538,
      badge: '/diamond.png',
      gradient: 'from-purple-600 to-pink-600',
      bestFor: 'High-volume agencies',
      features: [
        '65 website credits',
        '~₹1,500 per website',
        'Custom scope flexibility',
        'Account manager assigned',
        '24/7 priority support'
      ],
      popular: false
    }
  ];


  // Handle plan purchase
  const handlePurchasePlan = async (plan) => {
    try {
      setLoading(true);
      setSelectedPlan(plan.type);


      console.log('💎 Starting plan purchase:', plan.type);


      // Step 1: Create order on backend
      const orderResponse = await createPlanOrder(plan.type);


      console.log('✅ Order created:', orderResponse.data);


      // Step 2: Open Razorpay checkout
      await openRazorpayCheckout(
        orderResponse.data,
        // Success callback
        (verifyResponse) => {
          console.log('✅ Payment successful:', verifyResponse);
          
          addNotification({
            type: 'success',
            message: `🎉 ${plan.credits} credits added successfully!`
          });


          // Call parent success callback
          if (onSuccess) {
            onSuccess(verifyResponse.data.user.credits);
          }


          // Close modal
          onClose();
        },
        // Failure callback
        (error) => {
          console.error('❌ Payment failed:', error);
          
          addNotification({
            type: 'error',
            message: error.message || 'Payment failed. Please try again.'
          });


          setLoading(false);
          setSelectedPlan(null);
        }
      );


    } catch (error) {
      console.error('❌ Purchase error:', error);
      
      addNotification({
        type: 'error',
        message: error.message || 'Failed to initiate payment'
      });


      setLoading(false);
      setSelectedPlan(null);
    }
  };


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>


      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>


          {/* Header */}
          <div className="text-center pt-12 pb-8 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-full px-6 py-3 shadow-lg">
                <span className="text-2xl">💎</span>
                <span className="text-sm font-bold text-white">Buy Credits</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Purchase credits to book templates instantly. Credits never expire!
            </p>
          </div>


          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 p-8">
            {plans.map((plan) => (
              <div
                key={plan.id} // ✅ CHANGED from plan.type to plan.id
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? 'border-[#6498fe] shadow-xl scale-105 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
                    : 'border-gray-200 hover:border-[#6498fe] bg-white'
                } ${
                  preSelectedPlan === plan.id ? 'ring-4 ring-blue-400 ring-opacity-50' : '' // ✅ HIGHLIGHT SELECTED
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#6498fe] to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}


                {/* ✅ PreSelected Badge */}
                {preSelectedPlan === plan.id && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✓ Selected
                    </div>
                  </div>
                )}


                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                    {plan.type}
                  </h3>
                  <div className="mb-3">
                    <div className={`text-4xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      ₹{plan.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ( ₹{plan.pricePerWebsite.toLocaleString('en-IN')} per website )
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-700 mb-1">
                    <span className="text-2xl text-[#6498fe]">{plan.credits}</span> Credits
                  </p>
                  <p className="text-xs text-gray-500 italic">{plan.bestFor}</p>
                </div>


                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mt-0.5">
                        <span className="text-white font-bold text-xs">✓</span>
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>


                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchasePlan(plan)}
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-xl transition-all duration-300 text-base relative overflow-hidden ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                      : 'bg-gray-900 text-white hover:bg-gradient-to-r hover:from-[#6498fe] hover:to-purple-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && selectedPlan === plan.type ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Buy Now</span>
                      <span>→</span>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>


          {/* Single Website Option */}
          <div className="p-8 pt-0">
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <span className="text-2xl">💡</span>
                    <h4 className="text-xl font-black text-gray-900">
                      Need just one website?
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pay per project with the same quality
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">
                      ₹3,500
                    </div>
                    <div className="text-xs text-gray-500">1 Credit</div>
                  </div>
                  <button
                    onClick={() => handlePurchasePlan({ type: 'Single Website', price: 3500, credits: 1 })}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#6498fe] to-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading && selectedPlan === 'Single Website' ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      'Buy Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Footer Note */}
          <div className="text-center pb-8 px-8">
            <p className="text-xs text-gray-500">
              🔒 Secure payment via Razorpay • Credits never expire • Instant activation
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};


export default PlanPurchaseModal;
