import React, { useState } from 'react';
import { requestMeeting } from './api';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/Button';
import Input from '../../components/Input';

const MeetingForm = ({ templateId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    templateId: templateId || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.preferredDate = 'Please select a future date';
      }
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Preferred time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await requestMeeting(formData);
      addNotification('Meeting request submitted successfully!', 'success');

      // Reset form
      setFormData({
        title: '',
        description: '',
        preferredDate: '',
        preferredTime: '',
        templateId: templateId || ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      addNotification(error.message || 'Failed to submit meeting request', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-blue-600 text-xl">👤</span>
        <h2 className="text-xl font-semibold text-gray-900">Schedule a Meeting</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📄 Meeting Title *
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Discuss website customization"
            error={errors.title}
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe what you'd like to discuss in this meeting..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preferred Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Preferred Date *
            </label>
            <Input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={getMinDate()}
              error={errors.preferredDate}
              className="w-full"
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🕐 Preferred Time *
            </label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.preferredTime ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="20:00">08:00 PM</option>

            </select>
            {errors.preferredTime && (
              <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">📋</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Meeting Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Our team will review your request and confirm the meeting</li>
                  <li>You'll receive an email with the meeting link once confirmed</li>
                  <li>Meetings are typically 30-60 minutes long</li>
                  <li>We'll discuss your requirements and project details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            className="px-6 py-2"
          >
            Submit Meeting Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;