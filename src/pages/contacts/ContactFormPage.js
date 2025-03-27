// src/pages/contacts/ContactFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContactService } from '../../api/contactService';
import { toast } from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const ContactFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [contact, setContact] = useState({
        phoneNumber: '',
        name: '',
        email: '',
        language: 'en',
        tags: '',
        hasOptedIn: false,
        notes: '',
        customerId: null
    });

    useEffect(() => {
        if (isEditing) {
            fetchContact();
        }
    }, [id]);

    const fetchContact = async () => {
        setLoading(true);
        try {
            const response = await ContactService.getContact(id);
            setContact(response.data.data);
        } catch (error) {
            console.error('Error fetching contact:', error);
            toast.error('Failed to load contact details');
            navigate('/contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContact({
            ...contact,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleCustomerIdChange = (e) => {
        const { value } = e.target;
        setContact({
            ...contact,
            customerId: value === '' ? null : parseInt(value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!contact.phoneNumber) {
            toast.error('Phone number is required');
            return;
        }

        setSaving(true);

        try {
            if (isEditing) {
                await ContactService.updateContact(id, contact);
                toast.success('Contact updated successfully');
            } else {
                await ContactService.createContact(contact);
                toast.success('Contact created successfully');
            }
            navigate('/contacts');
        } catch (error) {
            console.error('Error saving contact:', error);
            toast.error(error.response?.data?.Error || 'Failed to save contact');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Contact' : 'New Contact'}
                </h1>
                <button
                    onClick={() => navigate('/contacts')}
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Contacts
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={contact.phoneNumber}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="+1234567890"
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={contact.name || ''}
                                onChange={handleChange}
                                className="input"
                                placeholder="Contact Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={contact.email || ''}
                                onChange={handleChange}
                                className="input"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                id="language"
                                name="language"
                                value={contact.language || 'en'}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="ar">Arabic</option>
                                <option value="zh">Chinese</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={contact.tags || ''}
                                onChange={handleChange}
                                className="input"
                                placeholder="customer, vip, new"
                            />
                        </div>

                        <div>
                            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                                Customer ID
                            </label>
                            <input
                                type="number"
                                id="customerId"
                                name="customerId"
                                value={contact.customerId || ''}
                                onChange={handleCustomerIdChange}
                                className="input"
                                placeholder="Customer ID (if applicable)"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={contact.notes || ''}
                                onChange={handleChange}
                                rows="4"
                                className="input"
                                placeholder="Additional notes about this contact"
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="hasOptedIn"
                                    name="hasOptedIn"
                                    checked={contact.hasOptedIn || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="hasOptedIn" className="ml-2 block text-sm text-gray-700">
                                    Has opted in to receive WhatsApp messages
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Ensure you have proper consent before sending messages to this contact.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/contacts')}
                            className="btn btn-outline mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <FiSave className="mr-2" /> Save Contact
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};




export default ContactFormPage;