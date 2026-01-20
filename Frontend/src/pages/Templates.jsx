// Frontend\src\pages\Templates.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import TemplateGrid from '../components/TemplateGrid';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getAllTemplates } from '../features/template/api';
import { purchaseWebsite } from '../services/templateBookingApi';

const Templates = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateCredits } = useAuth();
  const { addNotification } = useNotification();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // ✅ NEW: Credit validation modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // ✅ NEW: Meeting modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    meetingDate: '',
    meetingTime: ''
  });
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    document.title = "Browse Templates | 3Digree";
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getAllTemplates();
      const templatesList = response?.templates || response?.data?.templates || response || [];
      setTemplates(Array.isArray(templatesList) ? templatesList : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      addNotification('Failed to load templates', 'error');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle book template with credit validation
  const handleBookTemplate = useCallback((template) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/templates' } });
      return;
    }

    const creditsRequired = template?.creditsRequired || 1;
    const userCredits = user?.credits || 0;

    // ✅ Check if user has enough credits
    if (userCredits < creditsRequired) {
      setSelectedTemplate(template);
      setShowCreditModal(true);
      return;
    }

    // ✅ Proceed to meeting modal if credits are sufficient
    setSelectedTemplate(template);
    setShowMeetingModal(true);
  }, [isAuthenticated, user, navigate]);

  // ✅ NEW: Handle purchase after meeting details
  const handlePurchase = async () => {
    if (!selectedTemplate) return;

    try {
      setPurchasing(true);

      const displayId = `#3di-${selectedTemplate._id.toString().slice(-6)}`;

      const response = await purchaseWebsite(displayId, meetingDetails);

      addNotification(
        `🎉 Successfully purchased ${selectedTemplate.name}!`,
        'success'
      );

      // Update user credits
      if (response?.data?.user?.credits !== undefined) {
        updateCredits(response.data.user.credits);
      }

      // Close modal and reset
      setShowMeetingModal(false);
      setMeetingDetails({ meetingDate: '', meetingTime: '' });
      setSelectedTemplate(null);

      // Navigate to dashboard
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Purchase error:', error);
      addNotification(
        error?.message || 'Failed to purchase template',
        'error'
      );
    } finally {
      setPurchasing(false);
    }
  };

  // ✅ NEW: Redirect to pricing
  const handleBuyCredits = () => {
    setShowCreditModal(false);
    navigate('/pricing');
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory && template.isActive;
    });
  }, [templates, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(templates.map(t => t.category).filter(Boolean))];
    return cats;
  }, [templates]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Templates
          </h1>
          <p className="text-xl text-gray-600">
            Choose from {templates.length}+ professional templates
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
            >
              Grid
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
            >
              List
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <TemplateGrid
          templates={filteredTemplates}
          viewMode={viewMode}
          onBookTemplate={handleBookTemplate}
        />

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No templates found</p>
          </div>
        )}
      </div>

      {/* ✅ NEW: Credit Validation Modal */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="❌ Not Enough Credits"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">💳</div>

              <h3 className="text-2xl font-bold text-gray-900">
                {selectedTemplate?.name}
              </h3>

              {selectedTemplate?.withBackend && (
                <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-purple-300">
                  🔧 With Backend
                </div>
              )}

              <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                <p className="text-lg text-gray-700 mb-2">
                  This template requires{' '}
                  <span className="font-black text-red-600 text-2xl">
                    {selectedTemplate?.creditsRequired || 1} Credit{(selectedTemplate?.creditsRequired || 1) > 1 ? 's' : ''}
                  </span>
                </p>
                <p className="text-lg text-gray-700">
                  You currently have{' '}
                  <span className="font-black text-orange-600 text-2xl">
                    {user?.credits || 0} Credit{(user?.credits || 0) !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-gray-800 font-semibold">
                  ⚠️ You need{' '}
                  <span className="text-red-600 font-black">
                    {(selectedTemplate?.creditsRequired || 1) - (user?.credits || 0)} more credit{((selectedTemplate?.creditsRequired || 1) - (user?.credits || 0)) > 1 ? 's' : ''}
                  </span>
                  {' '}to purchase this template
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowCreditModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuyCredits}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold"
            >
              💎 Buy More Credits
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Meeting Details Modal */}
      <Modal
        isOpen={showMeetingModal}
        onClose={() => !purchasing && setShowMeetingModal(false)}
        title="📅 Schedule Meeting"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {selectedTemplate?.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-semibold">
                💳 {selectedTemplate?.creditsRequired || 1} Credit{(selectedTemplate?.creditsRequired || 1) > 1 ? 's' : ''}
              </span>
              {selectedTemplate?.withBackend && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                  🔧 Backend
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="date"
              label="Meeting Date"
              value={meetingDetails.meetingDate}
              onChange={(e) => setMeetingDetails(prev => ({
                ...prev,
                meetingDate: e.target.value
              }))}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              type="time"
              label="Meeting Time"
              value={meetingDetails.meetingTime}
              onChange={(e) => setMeetingDetails(prev => ({
                ...prev,
                meetingTime: e.target.value
              }))}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowMeetingModal(false)}
              variant="outline"
              className="flex-1"
              disabled={purchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!meetingDetails.meetingDate || !meetingDetails.meetingTime || purchasing}
              className="flex-1"
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                `Purchase (${selectedTemplate?.creditsRequired || 1} Credit${(selectedTemplate?.creditsRequired || 1) > 1 ? 's' : ''})`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Templates;