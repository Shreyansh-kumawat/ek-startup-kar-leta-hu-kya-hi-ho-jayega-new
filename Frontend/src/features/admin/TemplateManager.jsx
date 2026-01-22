// Frontend\src\features\admin\TemplateManager.jsx
import React, { useState, useEffect } from 'react';
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate, toggleTemplateStatus } from '../template/api';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { getServerImageUrl } from '../../services/apiClient';


const DEFAULT_INCLUDED_ITEMS = [
  { text: '1 Free Domain Name', included: true },
  { text: '1 Free Hosting', included: true },
  { text: '5 Pages Website', included: true },
  { text: 'Unlimited Images & Videos', included: true },
  { text: 'Unlimited (Bandwidth/ Space)', included: true },
  { text: '100% Responsive Website', included: true },
  { text: 'SEO Friendly Website', included: true },
  { text: 'WhatsApp Integration', included: true },
  { text: 'Call Button Integration', included: true },
  { text: 'SSL Certificate', included: true },
  { text: 'Social Media Integration', included: true },
];


const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDisabled, setShowDisabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='14' fill='%23718096' text-anchor='middle' dominant-baseline='middle'%3ENo Preview Available%3C/text%3E%3C/svg%3E";

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    liveDemo: '',
    previewImage: null,
    withBackend: false,
    creditsRequired: 1,
    whatsIncludedTitle: "What's Included",
    includedItems: [...DEFAULT_INCLUDED_ITEMS],
    customIncludedItems: [],
    templateInfoTitle: 'Template Information',
    templateDetails: [
      { label: 'Technology', value: 'Html, Css, JavaScript' },
      { label: 'Framework', value: 'jQuery, Bootstrap' },
      { label: 'Pages', value: '5' },
    ],
    developmentProcessTitle: '',
    developmentSteps: [],
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, searchTerm]);

  // ✅ FIXED: Proper image URL handling with debugging
  const getTemplateImageUrl = (template) => {
    if (!template?.previewImage) {
      console.log('⚠️ No preview image for:', template?.name);
      return fallbackImage;
    }

    // ✅ Direct Cloudinary/external URL
    if (typeof template.previewImage === 'string' && template.previewImage.startsWith('http')) {
      console.log('✅ Cloudinary URL:', template.previewImage);
      return template.previewImage;
    }

    // ✅ Relative path - construct server URL
    const serverUrl = getServerImageUrl(template.previewImage);
    console.log('🔗 Server URL:', serverUrl);
    return serverUrl;
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      };
      const response = await getAllTemplates(params);
      const templatesList = response?.data?.templates || response?.templates || response || [];

      console.log('📋 Fetched', templatesList.length, 'templates');
      templatesList.forEach(t => console.log('  -', t.name, ':', t.previewImage));

      setTemplates(Array.isArray(templatesList) ? templatesList : []);
      setTotalPages(response?.data?.pagination?.totalPages || response?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      addNotification('Error fetching templates', 'error');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      liveDemo: '',
      previewImage: null,
      withBackend: false,
      creditsRequired: 1,
      whatsIncludedTitle: "What's Included",
      includedItems: [...DEFAULT_INCLUDED_ITEMS],
      customIncludedItems: [],
      templateInfoTitle: 'Template Information',
      templateDetails: [
        { label: 'Technology', value: 'Html, Css, JavaScript' },
        { label: 'Framework', value: 'jQuery, Bootstrap' },
        { label: 'Pages', value: '5' },
      ],
      developmentProcessTitle: '',
      developmentSteps: [],
    });
  };

  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name || '',
        description: template.description || '',
        price: template.price || '',
        liveDemo: template.liveDemo || '',
        previewImage: null,
        withBackend: Boolean(template?.withBackend || template?.backend),
        creditsRequired: template?.creditsRequired || 1,
        whatsIncludedTitle: template.whatsIncluded?.title || "What's Included",
        includedItems: (template.whatsIncluded?.items && Array.isArray(template.whatsIncluded.items) && template.whatsIncluded.items.length > 0) ?
          template.whatsIncluded.items.map(i => ({
            text: i.text || '',
            included: typeof i.included === 'boolean' ? i.included : true
          })) : [...DEFAULT_INCLUDED_ITEMS],
        customIncludedItems: (template.whatsIncluded?.customItems && Array.isArray(template.whatsIncluded.customItems)) ?
          template.whatsIncluded.customItems.map(i => ({
            text: i.text || '',
            included: typeof i.included === 'boolean' ? i.included : true
          })) : [],
        templateInfoTitle: template.templateInfo?.title || "Template Information",
        templateDetails: (template.templateInfo?.details && Array.isArray(template.templateInfo.details) && template.templateInfo.details.length > 0) ?
          template.templateInfo.details.map(d => ({
            label: d.label || '',
            value: d.value || ''
          })) :
          [
            { label: 'Technology', value: 'Html, Css, JavaScript' },
            { label: 'Framework', value: 'jQuery, Bootstrap' },
            { label: 'Pages', value: '5' },
          ],
        developmentProcessTitle: "",
        developmentSteps: [],
      });
    } else {
      setEditingTemplate(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        liveDemo: formData.liveDemo,
        previewImage: formData.previewImage,
        withBackend: !!formData.withBackend,
        creditsRequired: parseInt(formData.creditsRequired) || 1,
        whatsIncluded: {
          title: formData.whatsIncludedTitle,
          items: formData.includedItems,
          customItems: formData.customIncludedItems.filter(item => item.text && item.text.trim())
        },
        templateInfo: {
          title: formData.templateInfoTitle,
          details: formData.templateDetails.filter(detail => detail.label && detail.value)
        },
        developmentProcess: {
          title: "",
          steps: []
        }
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, templateData);
        addNotification('Template updated successfully!', 'success');
      } else {
        await createTemplate(templateData);
        addNotification('Template created successfully!', 'success');
      }

      closeModal();
      fetchTemplates();
    } catch (error) {
      console.error('Submit error:', error);
      addNotification(error.message || 'Error saving template', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(templateId);
      addNotification('Template deleted successfully!', 'success');
      fetchTemplates();
    } catch (error) {
      addNotification(error.message || 'Error deleting template', 'error');
    }
  };

  const handleToggleStatus = async (templateId) => {
    try {
      await toggleTemplateStatus(templateId);
      addNotification('Template status updated successfully!', 'success');
      fetchTemplates();
    } catch (error) {
      addNotification(error.message || 'Error updating template status', 'error');
    }
  };

  const toggleIncludedItem = (index, included) => {
    setFormData(prev => {
      const next = [...prev.includedItems];
      next[index] = { ...next[index], included };
      return { ...prev, includedItems: next };
    });
  };

  const removeIncludedItem = (index) => {
    setFormData(prev => {
      const next = prev.includedItems.filter((_, i) => i !== index);
      return { ...prev, includedItems: next };
    });
  };

  const updateIncludedItemText = (index, text) => {
    setFormData(prev => {
      const next = [...prev.includedItems];
      next[index] = { ...next[index], text };
      return { ...prev, includedItems: next };
    });
  };

  const addCustomIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      customIncludedItems: [...prev.customIncludedItems, { text: '', included: true }]
    }));
  };

  const removeCustomIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      customIncludedItems: prev.customIncludedItems.filter((_, i) => i !== index)
    }));
  };

  const updateCustomIncludedItem = (index, patch) => {
    setFormData(prev => {
      const next = [...prev.customIncludedItems];
      next[index] = { ...next[index], ...patch };
      return { ...prev, customIncludedItems: next };
    });
  };

  const addTemplateDetail = () => {
    setFormData(prev => ({
      ...prev,
      templateDetails: [...prev.templateDetails, { label: '', value: '' }]
    }));
  };

  const removeTemplateDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      templateDetails: prev.templateDetails.filter((_, i) => i !== index)
    }));
  };

  const filteredTemplates = templates.filter(template =>
    showDisabled || template.isActive
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-lenis-prevent>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Management</h2>
          <p className="text-gray-600 text-sm mt-1">
            Total: {templates.length} templates | Active: {templates.filter(t => t.isActive).length} | Disabled: {templates.filter(t => !t.isActive).length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show Disabled:</label>
            <input
              type="checkbox"
              checked={showDisabled}
              onChange={(e) => setShowDisabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            ➕ Add Template
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template._id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${!template.isActive ? 'opacity-60 hover:opacity-80' : 'hover:shadow-lg'
              }`}
          >
            <div className="h-48 bg-gray-100 relative">
              <img loading="lazy"
                src={getTemplateImageUrl(template)}
                alt={template.name || 'Template'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ Image failed:', template.name, template.previewImage);
                  e.target.src = fallbackImage;
                  e.target.onerror = null;
                }}
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white ${template.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}>
                {template.isActive ? 'Active' : 'Disabled'}
              </div>

              {(template.withBackend || template.backend) && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs bg-purple-600 text-white font-semibold">
                  🔧 Backend
                </div>
              )}

              {!template.isActive && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    🚫 DISABLED
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className={`text-lg font-semibold mb-2 truncate ${template.isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                {template.name}
              </h3>
              <p className={`text-sm mb-3 line-clamp-2 ${template.isActive ? 'text-gray-600' : 'text-gray-400'
                }`}>
                {template.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className={`text-xl font-bold ${template.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  ₹{template.price?.toLocaleString() || 0}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  template.creditsRequired > 1 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                }`}>
                  💳 {template.creditsRequired || 1} Credit{(template.creditsRequired || 1) > 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <Button
                  onClick={() => openModal(template)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  ✏️ Edit
                </Button>
                <Button
                  onClick={() => handleToggleStatus(template._id)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${template.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                    }`}
                >
                  {template.isActive ? '❌ Disable' : '✅ Enable'}
                </Button>
                <Button
                  onClick={() => handleDelete(template._id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {!showDisabled ? 'No Active Templates Found' : 'No Templates Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {!showDisabled
              ? 'Enable "Show Disabled" to see all templates or create a new one'
              : 'Get started by creating your first template'
            }
          </p>
          <Button onClick={() => openModal()}>Create Template</Button>
        </div>
      )}

      <Modal className='data-lenis-prevent-wheel' isOpen={showModal} onClose={closeModal} title={editingTemplate ? 'Edit Template' : 'Add New Template'} size="xl"> 
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto data-lenis-prevent-wheel" data-lenis-prevent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Template Name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Price (₹)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
                maxLength="1500"
                placeholder="Enter template description (max 1500 characters)..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1500 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Live Demo URL" type="url" value={formData.liveDemo} onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })} required placeholder="https://demo.example.com" />
              <div />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="backend-checkbox"
                  checked={formData.withBackend}
                  onChange={(e) => {
                    const isBackend = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      withBackend: isBackend,
                      creditsRequired: isBackend ? 4 : 1
                    });
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="backend-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                  🔧 With Backend
                </label>
                <span className="text-xs text-gray-500 ml-2">
                  (Automatically sets credits to 4)
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💳 Credits Required
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.creditsRequired}
                  onChange={(e) => setFormData({ ...formData, creditsRequired: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.withBackend 
                    ? '⚡ Backend templates typically require 4 credits' 
                    : '⚡ Frontend templates typically require 1 credit'
                  }
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Input label="Preview Image" type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, previewImage: e.target.files[0] })} />
              <p className="text-xs text-gray-500 mt-1">Recommended: 800x600px. Image will be compressed and uploaded to Cloudinary automatically.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Input label="What's Included Section Title" type="text" value={formData.whatsIncludedTitle} onChange={(e) => setFormData({ ...formData, whatsIncludedTitle: e.target.value })} className="flex-1" />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Included Items</label>
              <div className="space-y-2">
                {formData.includedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleIncludedItem(index, false)}
                        className={`px-2 py-1 rounded text-sm ${!item.included ? 'bg-red-100 text-red-600 border border-red-300' : 'bg-gray-100 text-gray-600'}`}
                        title="Mark as excluded"
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleIncludedItem(index, true)}
                        className={`px-2 py-1 rounded text-sm ${item.included ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'}`}
                        title="Mark as included"
                      >
                        ✔
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateIncludedItemText(index, e.target.value)}
                      className={`flex-1 px-3 py-2 border border-gray-200 rounded text-sm ${item.included ? 'text-gray-900' : 'line-through text-red-600'}`}
                      placeholder="Item text"
                    />

                    <Button type="button" variant="outline" size="sm" className="text-red-600" onClick={() => removeIncludedItem(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Custom Items</label>
                <Button type="button" onClick={addCustomIncludedItem} variant="outline" size="sm">
                  ➕ Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {formData.customIncludedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateCustomIncludedItem(index, { included: false })}
                        className={`px-2 py-1 rounded text-sm ${!item.included ? 'bg-red-100 text-red-600 border border-red-300' : 'bg-gray-100 text-gray-600'}`}
                        title="Mark as excluded"
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCustomIncludedItem(index, { included: true })}
                        className={`px-2 py-1 rounded text-sm ${item.included ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600'}`}
                        title="Mark as included"
                      >
                        ✔
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateCustomIncludedItem(index, { text: e.target.value })}
                      className={`flex-1 px-3 py-2 border border-gray-200 rounded text-sm ${item.included ? 'text-gray-900' : 'line-through text-red-600'}`}
                      placeholder="Custom feature..."
                    />

                    <Button type="button" variant="outline" size="sm" className="text-red-600" onClick={() => removeCustomIncludedItem(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <Input label="Template Information Section Title" type="text" value={formData.templateInfoTitle} onChange={(e) => setFormData({ ...formData, templateInfoTitle: e.target.value })} className="flex-1 mr-4" />
              <Button type="button" onClick={addTemplateDetail} variant="outline" size="sm">
                ➕ Add Detail
              </Button>
            </div>

            {formData.templateDetails.map((detail, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                <input
                  type="text"
                  value={detail.label}
                  onChange={(e) => {
                    const newDetails = [...formData.templateDetails];
                    newDetails[index].label = e.target.value;
                    setFormData({ ...formData, templateDetails: newDetails });
                  }}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Label (e.g., Technology)"
                />
                <input
                  type="text"
                  value={detail.value}
                  onChange={(e) => {
                    const newDetails = [...formData.templateDetails];
                    newDetails[index].value = e.target.value;
                    setFormData({ ...formData, templateDetails: newDetails });
                  }}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Value (e.g., React, Next.js)"
                />
                <Button type="button" onClick={() => removeTemplateDetail(index)} variant="outline" size="sm" className="text-red-600">
                  ➖
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" onClick={closeModal} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TemplateManager;
