// src/api/conversationService.js
import apiClient from './axios';

export const ConversationService = {
    // Get active conversations
    getActiveConversations: (page = 1, pageSize = 20) => {
        return apiClient.get(`/ConversationAssignment/active?page=${page}&pageSize=${pageSize}`);
    },

    // Get assignment details for a specific contact
    getAssignment: (contactNumber) => {
        return apiClient.get(`/ConversationAssignment/${contactNumber}`);
    },

    // Assign conversation to agent
    assignConversation: (assignment) => {
        return apiClient.post('/ConversationAssignment/assign', assignment);
    },

    // Release conversation
    releaseConversation: (release) => {
        return apiClient.post('/ConversationAssignment/release', release);
    },

    // Toggle chatbot for a conversation
    toggleChatbot: (toggle) => {
        return apiClient.post('/ConversationAssignment/toggle-chatbot', toggle);
    },

    // Get assigned conversations for current agent
    getMyAssignments: () => {
        return apiClient.get('/ConversationAssignment/my-assignments');
    },

    // Update agent activity
    updateActivity: (activity) => {
        return apiClient.post('/ConversationAssignment/update-activity', activity);
    }
};