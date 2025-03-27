// src/api/campaignService.js
import apiClient from './axios';

export const CampaignService = {
    // Get all campaigns
    getCampaigns: (page = 1, pageSize = 10, status = null) => {
        let url = `/Campaigns?page=${page}&pageSize=${pageSize}`;
        if (status) {
            url += `&status=${status}`;
        }
        return apiClient.get(url);
    },

    // Get campaign details
    getCampaign: (id) => {
        return apiClient.get(`/Campaigns/${id}`);
    },

    // Create a new campaign
    createCampaign: (campaign) => {
        return apiClient.post('/Campaigns', campaign);
    },

    // Update a campaign
    updateCampaign: (id, campaign) => {
        return apiClient.put(`/Campaigns/${id}`, campaign);
    },

    // Launch a campaign
    launchCampaign: (id) => {
        return apiClient.post(`/Campaigns/${id}/launch`);
    },

    // Cancel a campaign
    cancelCampaign: (id) => {
        return apiClient.post(`/Campaigns/${id}/cancel`);
    },

    // Delete a campaign
    deleteCampaign: (id) => {
        return apiClient.delete(`/Campaigns/${id}`);
    },

    // Get campaign analytics
    getCampaignAnalytics: (id) => {
        return apiClient.get(`/Campaigns/${id}/analytics`);
    },

    // Preview a campaign message
    previewCampaign: (preview) => {
        return apiClient.post('/Campaigns/preview', preview);
    }
};