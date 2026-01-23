import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/useAuth';
import Button from './Button';
import Card from './Card';
import { formatCurrency } from '../utils/helpers';
import { useNotification } from '../hooks/useNotification';
import { initializePayment } from '../services/razorpay';

const PaymentProgress = ({ 
  templateBooking, 
  onPaymentComplete,
  className = "" 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculate payment details
  const totalAmount = templateBooking?.templatePrice || 0;
  const paidAmount = templateBooking?.paidAmount || 0;
  const remainingAmount = totalAmount - paidAmount;
  const paymentPercentage = templateBooking?.paymentPercentage || 0;
  const currentPaymentAmount = (totalAmount * paymentPercentage) / 100;

  // Payment status check
  const isPartialPaymentPending = paidAmount === 0 && paymentPercentage > 0;
  const isPartialPaymentDone = paidAmount > 0 && remainingAmount > 0;
  const isFullPaymentDone = paidAmount >= totalAmount;
  const isWebsiteReady = templateBooking?.websitePreviewUrl && templateBooking?.websiteStatus === 'ready';

  // Handle partial payment
  const handlePartialPayment = async () => {
    if (!templateBooking || currentPaymentAmount <= 0) {
      showError('Invalid payment amount');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Create order for partial payment
      const orderData = {
        templateBookingId: templateBooking._id,
        amount: currentPaymentAmount,
        currency: 'INR',
        paymentType: 'partial',
        description: `Partial payment for ${templateBooking.templateName}`
      };

      // console.removed.log('💳 Processing partial payment:', orderData);

      // Simulate order creation (replace with actual API call)
      const order = {
        razorpayOrderId: `order_${Date.now()}`,
        amount: currentPaymentAmount
      };

      // Initialize Razorpay payment
      await initializePayment({
        amount: currentPaymentAmount,
        orderId: order.razorpayOrderId,
        name: '3Degree-TBS',
        description: orderData.description,
        image: '/favicon.ico',
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        onSuccess: async (response) => {
          try {
            // console.removed.log('✅ Partial payment successful:', response);
            showSuccess('Partial payment completed successfully! Development will begin shortly.');
            if (onPaymentComplete) {
              onPaymentComplete('partial', response);
            }
          } catch (error) {
            showError('Payment verification failed. Please contact support.');
          }
        },
        onError: (error) => {
          showError('Payment failed. Please try again.');
          console.error('Payment error:', error);
        },
        onCancel: () => {
          showError('Payment cancelled.');
        }
      });

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      showError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle final payment
  const handleFinalPayment = async () => {
    if (!templateBooking || remainingAmount <= 0) {
      showError('Invalid payment amount');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderData = {
        templateBookingId: templateBooking._id,
        amount: remainingAmount,
        currency: 'INR',
        paymentType: 'final',
        description: `Final payment for ${templateBooking.templateName}`
      };

      // console.removed.log('💳 Processing final payment:', orderData);

      const order = {
        razorpayOrderId: `order_final_${Date.now()}`,
        amount: remainingAmount
      };

      await initializePayment({
        amount: remainingAmount,
        orderId: order.razorpayOrderId,
        name: '3Degree-TBS',
        description: orderData.description,
        image: '/favicon.ico',
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        onSuccess: async (response) => {
          try {
            // console.removed.log('✅ Final payment successful:', response);
            showSuccess('Payment completed! Your website is now ready for download.');
            if (onPaymentComplete) {
              onPaymentComplete('final', response);
            }
          } catch (error) {
            showError('Payment verification failed. Please contact support.');
          }
        },
        onError: (error) => {
          showError('Payment failed. Please try again.');
          console.error('Payment error:', error);
        },
        onCancel: () => {
          showError('Payment cancelled.');
        }
      });

    } catch (error) {
      console.error('❌ Final payment processing error:', error);
      showError('Failed to process final payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!templateBooking) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">⏰</div>
          <p>No payment information available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Payment Progress
        </h3>
        <div className="text-sm text-gray-500">
          Website: {templateBooking.templateName}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Payment Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(paidAmount)} of {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` 
            }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}% completed
        </div>
      </div>

      {/* Payment Status Cards */}
      <div className="space-y-4">

        {/* Partial Payment Status */}
        {paymentPercentage > 0 && (
          <div className={`border rounded-lg p-4 ${
            isPartialPaymentDone 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-xl mr-3 ${
                  isPartialPaymentDone ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {isPartialPaymentDone ? '✅' : '⏰'}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Partial Payment ({paymentPercentage}%)
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(currentPaymentAmount)} to start development
                  </p>
                </div>
              </div>

              <div className="text-right">
                {isPartialPaymentDone ? (
                  <div className="text-green-600 font-semibold">
                    ✅ Paid
                  </div>
                ) : (
                  <Button
                    onClick={handlePartialPayment}
                    disabled={isProcessingPayment}
                    size="sm"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="animate-spin mr-2">⚙️</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💳</span>
                        Pay Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Development Status */}
        {isPartialPaymentDone && (
          <div className={`border rounded-lg p-4 ${
            isWebsiteReady 
              ? 'border-green-200 bg-green-50' 
              : 'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center">
              <span className={`text-xl mr-3 ${
                isWebsiteReady ? 'text-green-500' : 'text-blue-500'
              }`}>
                {isWebsiteReady ? '✅' : (
                  <span className="animate-spin">⚙️</span>
                )}
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Website Development
                </h4>
                <p className="text-sm text-gray-600">
                  {isWebsiteReady 
                    ? 'Your website is ready for review!' 
                    : 'Development in progress...'
                  }
                </p>
              </div>
            </div>

            {/* Website Preview Link */}
            {isWebsiteReady && templateBooking.websitePreviewUrl && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(templateBooking.websitePreviewUrl, '_blank')}
                  className="mr-2"
                >
                  <span className="mr-2">👁️</span>
                  Preview Website
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Final Payment Status */}
        {isWebsiteReady && remainingAmount > 0 && (
          <div className={`border rounded-lg p-4 ${
            isFullPaymentDone 
              ? 'border-green-200 bg-green-50' 
              : 'border-orange-200 bg-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-xl mr-3 ${
                  isFullPaymentDone ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {isFullPaymentDone ? '✅' : '⏰'}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Final Payment
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(remainingAmount)} to get your website
                  </p>
                </div>
              </div>

              <div className="text-right">
                {isFullPaymentDone ? (
                  <div className="text-green-600 font-semibold">
                    ✅ Completed
                  </div>
                ) : (
                  <Button
                    onClick={handleFinalPayment}
                    disabled={isProcessingPayment}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="animate-spin mr-2">⚙️</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💳</span>
                        Complete Payment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final Website Link */}
        {isFullPaymentDone && templateBooking.finalWebsiteUrl && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✅</span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    🎉 Website Ready!
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your website is live and ready to use
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(templateBooking.finalWebsiteUrl, '_blank')}
                >
                  <span className="mr-2">🔗</span>
                  Visit Website
                </Button>
                {templateBooking.downloadUrl && (
                  <Button
                    size="sm"
                    onClick={() => window.open(templateBooking.downloadUrl, '_blank')}
                  >
                    <span className="mr-2">⬇️</span>
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount)}
            </div>
            <div className="text-sm text-gray-500">Paid</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(remainingAmount)}
            </div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      {!isFullPaymentDone && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Don't worry!</strong> You can pay the remaining amount after your website is ready and deployed.
          </p>
        </div>
      )}
    </Card>
  );
};

export default PaymentProgress;