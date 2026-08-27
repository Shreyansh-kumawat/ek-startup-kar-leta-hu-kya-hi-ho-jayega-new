import { supabase } from '../../lib/supabase';
import { templateApi } from '../../services/apiClient';

export const getAllTemplates = async (params = {}) => {
  const result = await templateApi.getAll(params);
  return result.data || result;
};

export const getTemplateById = async (id) => {
  const result = await templateApi.getById(id);
  return result;
};

export const getByWebsiteId = async (websiteId) => {
  const cleanId = websiteId.startsWith('#') ? websiteId : `#${websiteId}`;
  const result = await templateApi.getByDisplayId(cleanId);
  return result;
};

export const createTemplate = async (templateData) => {
  const formData = new FormData();

  if (templateData.name) formData.append('name', templateData.name);
  if (templateData.description) formData.append('description', templateData.description);
  formData.append('price', templateData.price ?? 0);
  formData.append('liveDemo', templateData.liveDemo);
  formData.append('withBackend', String(!!templateData.withBackend));
  formData.append('creditsRequired', String(templateData.creditsRequired || 1));

  if (templateData.previewImage instanceof File) {
    formData.append('file', templateData.previewImage);
  }

  const whatsIncluded = {
    title: templateData.whatsIncludedTitle || "What's Included",
    items: templateData.includedItems || [],
    customItems: (templateData.customIncludedItems || templateData.customItems || []).filter(
      (item) => item.text && item.text.trim()
    ),
  };
  formData.append('whatsIncluded', JSON.stringify(whatsIncluded));

  const templateInfo = {
    title: templateData.templateInfoTitle || 'Template Information',
    details: (templateData.templateDetails || []).filter((d) => d.label && d.value),
  };
  formData.append('templateInfo', JSON.stringify(templateInfo));

  const developmentProcess = {
    title: templateData.developmentProcessTitle || '',
    steps: templateData.developmentSteps || [],
  };
  formData.append('developmentProcess', JSON.stringify(developmentProcess));

  // Upload image first if present
  let previewImageUrl = null;
  if (templateData.previewImage instanceof File) {
    const uploadForm = new FormData();
    uploadForm.append('file', templateData.previewImage);
    uploadForm.append('folder', '3degree-tbs/templates');

    const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-image', {
      body: uploadForm,
    });
    if (uploadError) throw uploadError;
    previewImageUrl = uploadResult?.data?.url;
  }

  // Insert into templates table
  const insertData = {
    name: templateData.name,
    description: templateData.description || '',
    price: parseFloat(templateData.price) || 0,
    live_demo: templateData.liveDemo || '',
    with_backend: !!templateData.withBackend,
    credits_required: parseInt(templateData.creditsRequired) || 1,
    category: templateData.category || 'other',
    tags: templateData.tags || [],
    whats_included: whatsIncluded,
    template_info: templateInfo,
    development_process: developmentProcess,
  };

  if (previewImageUrl) insertData.preview_image = previewImageUrl;

  const { data, error } = await supabase
    .from('templates')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return { success: true, message: 'Template created', data };
};

export const updateTemplate = async (id, templateData) => {
  let previewImageUrl = null;
  if (templateData.previewImage instanceof File) {
    const uploadForm = new FormData();
    uploadForm.append('file', templateData.previewImage);
    uploadForm.append('folder', '3degree-tbs/templates');

    const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-image', {
      body: uploadForm,
    });
    if (uploadError) throw uploadError;
    previewImageUrl = uploadResult?.data?.url;
  }

  const updateData = {};
  if (templateData.name) updateData.name = templateData.name;
  if (templateData.description) updateData.description = templateData.description;
  if (templateData.price !== undefined) updateData.price = parseFloat(templateData.price) || 0;
  if (templateData.liveDemo !== undefined) updateData.live_demo = templateData.liveDemo;
  if (templateData.category) updateData.category = templateData.category;

  if (typeof templateData.withBackend !== 'undefined') {
    updateData.with_backend = !!templateData.withBackend;
  }
  if (typeof templateData.creditsRequired !== 'undefined') {
    updateData.credits_required = parseInt(templateData.creditsRequired) || 1;
  }

  if (previewImageUrl) updateData.preview_image = previewImageUrl;

  if (templateData.whatsIncluded || templateData.whatsIncludedTitle || templateData.includedItems) {
    updateData.whats_included = {
      title: templateData.whatsIncludedTitle || templateData.whatsIncluded?.title || "What's Included",
      items: templateData.includedItems || templateData.whatsIncluded?.items || [],
      customItems: (templateData.customIncludedItems || templateData.customItems || templateData.whatsIncluded?.customItems || [])
        .filter((item) => item.text && item.text.trim()),
    };
  }

  if (templateData.templateInfo || templateData.templateInfoTitle || templateData.templateDetails) {
    updateData.template_info = {
      title: templateData.templateInfoTitle || templateData.templateInfo?.title || 'Template Information',
      details: (templateData.templateDetails || templateData.templateInfo?.details || []).filter((d) => d.label && d.value),
    };
  }

  if (templateData.developmentProcess || templateData.developmentProcessTitle || templateData.developmentSteps) {
    updateData.development_process = {
      title: templateData.developmentProcessTitle || templateData.developmentProcess?.title || '',
      steps: templateData.developmentSteps || templateData.developmentProcess?.steps || [],
    };
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, message: 'Template updated', data };
};

export const deleteTemplate = async (id) => {
  return templateApi.delete(id);
};

export const toggleTemplateStatus = async (id) => {
  return templateApi.toggleStatus(id);
};

export const searchTemplates = async (params) => {
  const result = await templateApi.search(params.query || params.search || '');
  return result;
};

export const getAdminTemplates = async (params = {}) => {
  const result = await templateApi.getAll({ ...params, isActive: undefined });
  return result.data || result;
};

export default {
  getAllTemplates,
  getTemplateById,
  getByWebsiteId,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  searchTemplates,
  getAdminTemplates,
};
