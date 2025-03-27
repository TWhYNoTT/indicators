// src/api/chatbotService.js
import apiClient from './axios';
export const ChatbotService = {
    // Get all chatbot rules
    getRules: (activeOnly = false) => {
        return apiClient.get(`/Chatbot/rules?activeOnly=${activeOnly}`);
    },

    // Get a specific rule
    getRule: (id) => {
        return apiClient.get(`/Chatbot/rules/${id}`);
    },

    // Create a new rule
    createRule: (rule) => {
        return apiClient.post('/Chatbot/rules', rule);
    },

    // Update a rule
    updateRule: (id, rule) => {
        return apiClient.put(`/Chatbot/rules/${id}`, rule);
    },

    // Toggle rule status
    toggleRuleStatus: (id) => {
        return apiClient.patch(`/Chatbot/rules/${id}/toggle-status`);
    },

    // Delete a rule
    deleteRule: (id) => {
        return apiClient.delete(`/Chatbot/rules/${id}`);
    },

    // Test a message against chatbot rules
    testMessage: (message, customerId = null) => {
        return apiClient.post('/Chatbot/test', { message, customerId });
    }
};