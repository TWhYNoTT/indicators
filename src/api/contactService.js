import apiClient from './axios';
// src/api/contactService.js
export const ContactService = {
    // Get all contacts
    getContacts: (page = 1, pageSize = 20, searchTerm = null, tag = null, optedIn = null) => {
        let url = `/Contacts?page=${page}&pageSize=${pageSize}`;

        if (searchTerm) {
            url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        }

        if (tag) {
            url += `&tag=${encodeURIComponent(tag)}`;
        }

        if (optedIn !== null) {
            url += `&optedIn=${optedIn}`;
        }

        return apiClient.get(url);
    },

    // Get a contact by ID
    getContact: (id) => {
        return apiClient.get(`/Contacts/${id}`);
    },

    // Get a contact by phone number
    getContactByPhone: (phoneNumber) => {
        return apiClient.get(`/Contacts/phone/${phoneNumber}`);
    },

    // Create a new contact
    createContact: (contact) => {
        return apiClient.post('/Contacts', contact);
    },

    // Update a contact
    updateContact: (id, contact) => {
        return apiClient.put(`/Contacts/${id}`, contact);
    },

    // Delete a contact
    deleteContact: (id) => {
        return apiClient.delete(`/Contacts/${id}`);
    },

    // Get all tags
    getTags: () => {
        return apiClient.get('/Contacts/tags');
    },

    // Import contacts from invoices
    importFromInvoices: () => {
        return apiClient.post('/Contacts/import-from-invoices');
    }
};