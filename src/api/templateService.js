// src/api/templateService.js
import apiClient from './axios';

export const TemplateService = {
    // Get all templates
    getTemplates: (approvedOnly = false, page = 1, pageSize = 20) => {
        return apiClient.get(`/Templates?approvedOnly=${approvedOnly}&page=${page}&pageSize=${pageSize}`);
    },

    // Get a template by ID
    getTemplate: (id) => {
        return apiClient.get(`/Templates/${id}`);
    },

    // Get a template by Content SID
    getTemplateBySid: (contentSid) => {
        return apiClient.get(`/Templates/sid/${contentSid}`);
    },

    // Create a new template
    createTemplate: (template) => {
        return apiClient.post('/Templates', template);
    },

    // Update a template
    updateTemplate: (id, template) => {
        return apiClient.put(`/Templates/${id}`, template);
    },

    // Delete a template
    deleteTemplate: (id) => {
        return apiClient.delete(`/Templates/${id}`);
    },

    // Update approval status
    updateApprovalStatus: (id, isApproved) => {
        return apiClient.patch(`/Templates/${id}/approval`, { isApproved });
    },

    // Test a template
    testTemplate: (test) => {
        return apiClient.post('/Templates/test', test);
    },

    // Get template categories
    getTemplateCategories: () => {
        return apiClient.get('/Templates/categories');
    }
};