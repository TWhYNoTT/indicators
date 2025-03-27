// src/pages/templates/TemplateFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TemplateService } from '../../api/templateService';
import { toast } from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const TemplateFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [template, setTemplate] = useState({
        name: '',
        description: '',
        contentSid: '',
        language: 'en',
        type: ''
    });

    useEffect(() => {
        fetchCategories();

        if (isEditing) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        setLoading(true);
        try {
            const response = await TemplateService.getTemplate(id);
            setTemplate(response.data.data);
        } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Failed to load template details');
            navigate('/templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await TemplateService.getTemplateCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching template categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTemplate({
            ...template,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!template.name || !template.contentSid) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            if (isEditing) {
                await TemplateService.updateTemplate(id, template);
                toast.success('Template updated successfully');
            } else {
                await TemplateService.createTemplate(template);
                toast.success('Template created successfully');
            }
            navigate('/templates');
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error(error.response?.data?.Error || 'Failed to save template');
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
                    {isEditing ? 'Edit Template' : 'New Template'}
                </h1>
                <button
                    onClick={() => navigate('/templates')}
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Templates
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Template Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={template.name}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="e.g., Order Confirmation"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={template.description || ''}
                                onChange={handleChange}
                                rows="2"
                                className="input"
                                placeholder="Describe the purpose of this template"
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="contentSid" className="block text-sm font-medium text-gray-700 mb-1">
                                Content SID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="contentSid"
                                name="contentSid"
                                value={template.contentSid}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="e.g., HX123456abcdef"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                This is the Twilio Content SID for your approved template.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={template.language || 'en'}
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
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Template Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={template.type || ''}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">-- Select Type --</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/templates')}
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
                                    <FiSave className="mr-2" /> Save Template
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Template Preview - Placeholder */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Template Preview</h2>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-2">
                            Note: This is a simplified preview. Actual template appearance may vary.
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="text-sm font-medium">{template.name}</div>
                            <div className="text-sm mt-2">
                                {template.description || 'No description provided'}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Content SID: {template.contentSid}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Language: {template.language || 'en'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Type: {template.type || 'Not specified'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TemplateFormPage;