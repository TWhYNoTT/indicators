// src/api/whatsAppService.js
import apiClient from './axios';

export const WhatsAppService = {
    // Send a WhatsApp message
    sendMessage: (message) => {
        return apiClient.post('/WhatsApp/send', message);
    },

    // Send a template message
    sendTemplateMessage: (template) => {
        return apiClient.post('/WhatsApp/send-template', template);
    },

    // Get message history for a contact
    getMessageHistory: (phoneNumber, page = 1, pageSize = 20) => {
        return apiClient.get(`/WhatsApp/history/${phoneNumber}?page=${page}&pageSize=${pageSize}`);
    },

    // Get all active conversations
    getActiveConversations: (page = 1, pageSize = 10) => {
        return apiClient.get(`/WhatsApp/conversations?page=${page}&pageSize=${pageSize}`);
    },

    // Send a media message
    sendMediaMessage: (mediaMessage) => {
        // Using FormData for media upload
        const formData = new FormData();
        formData.append('ToNumber', mediaMessage.ToNumber);

        if (mediaMessage.Caption) {
            formData.append('Caption', mediaMessage.Caption);
        }

        if (mediaMessage.Media) {
            formData.append('Media', mediaMessage.Media);
        }

        if (mediaMessage.MediaUrl) {
            formData.append('MediaUrl', mediaMessage.MediaUrl);
        }

        if (mediaMessage.CustomerId) {
            formData.append('CustomerId', mediaMessage.CustomerId);
        }

        return apiClient.post('/WhatsApp/send-media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Check API health
    checkHealth: () => {
        return apiClient.get('/WhatsApp/health');
    },

    // Test webhook
    testWebhook: () => {
        return apiClient.post('/WhatsApp/test-webhook');
    }
};








