import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WebsiteBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [templateId, setTemplateId] = useState('');
  const [templatePreview, setTemplatePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Fetch template details when ID is pasted
  const fetchTemplateDetails = async (id) => {
    if (!id || !id.startsWith('#3di-')) {
      setTemplatePreview(null);
      return;
    }

    setFetchingTemplate(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/templates/display/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTemplatePreview(response.data.data);
      }
    } catch (err) {
      console.error('❌ Fetch template error:', err);
      setError(err.response?.data?.message || 'Template not found');
      setTemplatePreview(null);
    } finally {
      setFetchingTemplate(false);
    }
  };

  // ✅ Handle template ID input change
  const handleTemplateIdChange = (e) => {
    const value = e.target.value.trim();
    setTemplateId(value);
    
    if (value.length >= 10) { // #3di-XXXXXX = 11 chars
      fetchTemplateDetails(value);
    } else {
      setTemplatePreview(null);
    }
  };

  // ✅ Handle website purchase
  const handlePurchase = async () => {
    if (!templateId || !templatePreview) {
      setError('Please enter a valid template ID');
      return;
    }

    if (user.credits < 1) {
      setError('Insufficient credits! Please purchase a plan.');
      setTimeout(() => navigate('/pricing'), 2000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/website-booking/purchase`,
        { templateDisplayId: templateId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('✅ Website purchased successfully! Redirecting to progress page...');
        setTimeout(() => {
          navigate('/progress');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Purchase error:', err);
      setError(err.response?.data?.message || 'Failed to purchase website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌐 Book Your Website
          </h1>
          <p className="text-gray-600">
            Paste the template ID from our gallery to get started
          </p>
          <div className="mt-4 inline-block bg-blue-100 px-4 py-2 rounded-lg">
            <span className="text-sm font-semibold text-blue-800">
              💎 Your Credits: {user?.credits || 0}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
          {/* Template ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Paste ID here (e.g., #3di-a1b2c3)"
              value={templateId}
              onChange={handleTemplateIdChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Copy the template ID from our gallery (WEB2)
            </p>
          </div>

          {/* Loading State */}
          {fetchingTemplate && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Fetching template details...</p>
            </div>
          )}

          {/* Template Preview */}
          {templatePreview && !fetchingTemplate && (
            <div className="border-2 border-blue-300 rounded-xl p-6 mb-6 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ✅ Template Found!
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Template Image */}
                <div>
                  <img
                    src={templatePreview.previewImage}
                    alt={templatePreview.name}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Template Details */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {templatePreview.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      ID: <span className="font-mono font-bold">{templatePreview.displayId}</span>
                    </p>
                    
                    {templatePreview.liveDemo && (
                      <a
                        href={templatePreview.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition mb-4"
                      >
                        🔗 View Live Demo
                      </a>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-green-600">Cost:</span> 1 Credit
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Delivery: 3 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handlePurchase}
            disabled={!templatePreview || loading || user?.credits < 1}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              !templatePreview || loading || user?.credits < 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              '🚀 Buy Website (1 Credit)'
            )}
          </button>

          {/* Info Box */}
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">📌 How it works:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Copy template ID from our gallery (WEB2)</li>
              <li>Paste the ID here to preview the template</li>
              <li>Click "Buy Website" (1 credit will be deducted)</li>
              <li>Track progress on your dashboard</li>
              <li>Get your website in 3 business days!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBooking;
