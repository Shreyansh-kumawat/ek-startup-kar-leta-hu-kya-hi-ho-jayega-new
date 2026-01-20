//  Frontend/src/features/template/api.js
import apiClient from "../../services/apiClient";

// Get all templates (support pagination, filtering, sorting)
export const getAllTemplates = async (params = {}) => {
  try {
    // params: { page, limit, search, category, priceMin, priceMax, sortBy }
    const response = await apiClient.get('/templates', { params });
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.templates)) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get template by ID
export const getTemplateById = async (id) => {
  try {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get template by Website ID / Public ID / Slug
export const getByWebsiteId = async (websiteId) => {
  try {
    const response = await apiClient.get(`/templates/by-website-id/${websiteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new template (admin only)
export const createTemplate = async (templateData) => {
  try {
    const formData = new FormData();

    // Append basic fields to form data
    if (templateData.name) formData.append('name', templateData.name);
    if (templateData.description) formData.append('description', templateData.description);
    formData.append('price', templateData.price ?? 0);
    formData.append('liveDemo', templateData.liveDemo);
    formData.append('withBackend', String(!!templateData.withBackend)); // ✅ CHANGED: backend → withBackend
    formData.append('creditsRequired', String(templateData.creditsRequired || 1)); // ✅ NEW: Credits field

    // Append image file if any
    if (templateData.previewImage && templateData.previewImage instanceof File) {
      formData.append("previewImage", templateData.previewImage);
    }

    // Append serialized structured objects
    const whatsIncluded = {
      title: templateData.whatsIncludedTitle || "What's Included",
      items: templateData.includedItems || [],
      customItems: (templateData.customIncludedItems || templateData.customItems || []).filter(
        (item) => item.text && item.text.trim()
      ),
    };
    formData.append("whatsIncluded", JSON.stringify(whatsIncluded));

    const templateInfo = {
      title: templateData.templateInfoTitle || "Template Information",
      details:
        (templateData.templateDetails || []).filter(
          (d) => d.label && d.value
        ) || [],
    };
    formData.append("templateInfo", JSON.stringify(templateInfo));

    const developmentProcess = {
      title: templateData.developmentProcessTitle || "",
      steps: templateData.developmentSteps || [],
    };
    formData.append("developmentProcess", JSON.stringify(developmentProcess));

    const response = await apiClient.post("/templates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update existing template (admin only)
export const updateTemplate = async (id, templateData) => {
  try {
    const formData = new FormData();
    if (templateData.name) formData.append('name', templateData.name);
    if (templateData.description) formData.append('description', templateData.description);
    formData.append('price', templateData.price ?? 0);
    formData.append('liveDemo', templateData.liveDemo);

    // ✅ CHANGED: backend → withBackend
    if (typeof templateData.withBackend !== 'undefined') {
      formData.append('withBackend', String(!!templateData.withBackend));
    }

    // ✅ NEW: Credits field
    if (typeof templateData.creditsRequired !== 'undefined') {
      formData.append('creditsRequired', String(templateData.creditsRequired || 1));
    }

    if (templateData.previewImage && templateData.previewImage instanceof File) {
      formData.append("previewImage", templateData.previewImage);
    }

    if (
      templateData.whatsIncluded ||
      templateData.whatsIncludedTitle ||
      templateData.includedItems
    ) {
      const whatsIncluded = {
        title:
          templateData.whatsIncludedTitle ||
          templateData.whatsIncluded?.title ||
          "What's Included",
        items: templateData.includedItems || templateData.whatsIncluded?.items || [],
        customItems:
          (templateData.customIncludedItems ||
            templateData.customItems ||
            templateData.whatsIncluded?.customItems ||
            []
          ).filter((item) => item.text && item.text.trim()),
      };
      formData.append("whatsIncluded", JSON.stringify(whatsIncluded));
    }

    if (
      templateData.templateInfo ||
      templateData.templateInfoTitle ||
      templateData.templateDetails
    ) {
      const templateInfo = {
        title:
          templateData.templateInfoTitle ||
          templateData.templateInfo?.title ||
          "Template Information",
        details:
          (templateData.templateDetails ||
            templateData.templateInfo?.details ||
            []
          ).filter((d) => d.label && d.value),
      };
      formData.append("templateInfo", JSON.stringify(templateInfo));
    }

    if (
      templateData.developmentProcess ||
      templateData.developmentProcessTitle ||
      templateData.developmentSteps
    ) {
      const developmentProcess = {
        title:
          templateData.developmentProcessTitle ||
          templateData.developmentProcess?.title ||
          "",
        steps:
          templateData.developmentSteps ||
          templateData.developmentProcess?.steps ||
          [],
      };
      formData.append("developmentProcess", JSON.stringify(developmentProcess));
    }

    const response = await apiClient.put(`/templates/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete template (admin only)
export const deleteTemplate = async (id) => {
  try {
    const response = await apiClient.delete(`/templates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Toggle template active status (admin only)
export const toggleTemplateStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/templates/${id}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search templates (optional; general search can be with params in getAllTemplates)
export const searchTemplates = async (params) => {
  try {
    const response = await apiClient.get("/templates/search", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: get all templates with pagination & filtering
export const getAdminTemplates = async (params = {}) => {
  try {
    const response = await apiClient.get("/templates/admin/all", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ DEFAULT EXPORT - Backward compatibility
export default {
  getAllTemplates,
  getTemplateById,
  getByWebsiteId,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  searchTemplates,
  getAdminTemplates
};