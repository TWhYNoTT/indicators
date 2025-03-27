
// src/pages/campaigns/CampaignFormPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignService } from '../../api/campaignService';
import { TemplateService } from '../../api/templateService';
import { ContactService } from '../../api/contactService';
import { toast } from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiUsers, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CampaignFormPage = () => {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [campaign, setCampaign] = useState({
        name: '',
        description: '',
        templateSid: '',
        scheduledDate: null,
        variable1: '',
        variable2: '',
        variable3: '',
        audienceFilter: '',
        contactIds: []
    });

    useEffect(() => {
        fetchTemplates();
        fetchContacts();
        fetchTags();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await TemplateService.getTemplates(true);
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await ContactService.getContacts(1, 1000, null, null, true);
            setContacts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await ContactService.getTags();
            setTags(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaign({
            ...campaign,
            [name]: value
        });
    };

    const handleDateChange = (date) => {
        setCampaign({
            ...campaign,
            scheduledDate: date
        });
    };

    const handleTagToggle = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newSelectedTags);
        updateSelectedContacts(newSelectedTags);
    };

    const updateSelectedContacts = (tags) => {
        if (tags.length === 0) {
            setSelectedContacts([]);
            setCampaign({
                ...campaign,
                contactIds: []
            });
            return;
        }

        const filteredContacts = contacts.filter(contact => {
            if (!contact.tags) return false;
            const contactTags = contact.tags.split(',').map(t => t.trim());
            return tags.some(tag => contactTags.includes(tag));
        });

        setSelectedContacts(filteredContacts);
        setCampaign({
            ...campaign,
            contactIds: filteredContacts.map(c => c.id),
            audienceFilter: tags.join(',')
        });
    };

    const handlePreviewTemplate = async () => {
        if (!campaign.templateSid) {
            toast.error('Please select a template first');
            return;
        }

        setPreviewLoading(true);
        try {
            const response = await CampaignService.previewCampaign({
                templateSid: campaign.templateSid,
                variable1: campaign.variable1,
                variable2: campaign.variable2,
                variable3: campaign.variable3
            });

            setPreview(response.data);
        } catch (error) {
            console.error('Error previewing template:', error);
            toast.error('Failed to preview template');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!campaign.name || !campaign.templateSid || campaign.contactIds.length === 0) {
            toast.error('Please fill in all required fields and select recipients');
            return;
        }

        setSaving(true);

        try {
            await CampaignService.createCampaign(campaign);
            toast.success('Campaign created successfully');
            navigate('/campaigns');
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error(error.response?.data?.Error || 'Failed to create campaign');
        } finally {
            setSaving(false);
        }
    };

    if (loading && templates.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                <button
                    onClick={() => navigate('/campaigns')}
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Campaigns
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaign Details Form */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Campaign Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={campaign.name}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., July Promotion"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={campaign.description || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="input"
                                    placeholder="Describe the purpose of this campaign"
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="templateSid" className="block text-sm font-medium text-gray-700 mb-1">
                                    Template <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="templateSid"
                                    name="templateSid"
                                    value={campaign.templateSid}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                >
                                    <option value="">-- Select Template --</option>
                                    {templates.map((template) => (
                                        <option key={template.id} value={template.contentSid}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Only approved templates can be used in campaigns.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Scheduled Date/Time
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCalendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <DatePicker
                                        selected={campaign.scheduledDate}
                                        onChange={handleDateChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="input pl-10"
                                        placeholderText="Select date and time"
                                        minDate={new Date()}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave empty to save as draft and schedule later.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="variable1" className="block text-sm font-medium text-gray-700 mb-1">
                                        Variable 1
                                    </label>
                                    <input
                                        type="text"
                                        id="variable1"
                                        name="variable1"
                                        value={campaign.variable1 || ''}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="First variable value"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="variable2" className="block text-sm font-medium text-gray-700 mb-1">
                                        Variable 2
                                    </label>
                                    <input
                                        type="text"
                                        id="variable2"
                                        name="variable2"
                                        value={campaign.variable2 || ''}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Second variable value"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="variable3" className="block text-sm font-medium text-gray-700 mb-1">
                                        Variable 3
                                    </label>
                                    <input
                                        type="text"
                                        id="variable3"
                                        name="variable3"
                                        value={campaign.variable3 || ''}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Third variable value"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handlePreviewTemplate}
                                    disabled={!campaign.templateSid || previewLoading}
                                    className={`btn ${campaign.templateSid ? 'btn-outline' : 'btn-outline opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    {previewLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading preview...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <FiMessageSquare className="mr-2" /> Preview Template
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Audience Selection</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag)
                                                ? 'bg-primary-100 text-primary-800 border border-primary-300'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag}
                                            {selectedTags.includes(tag) && (
                                                <span className="ml-1 text-primary-600">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Select tags to filter contacts. Only contacts with at least one of the selected tags will be included.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Selected Recipients ({selectedContacts.length})
                                    </label>
                                    {selectedContacts.length > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {selectedContacts.length} contacts selected
                                        </span>
                                    )}
                                </div>
                                {selectedContacts.length === 0 ? (
                                    <div className="border border-gray-200 rounded-md p-4 text-center text-gray-500">
                                        <FiUsers className="mx-auto h-10 w-10 mb-2" />
                                        <p className="text-sm">No contacts selected. Use the tags above to select recipients.</p>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-md overflow-y-auto max-h-48 p-2">
                                        <div className="space-y-1">
                                            {selectedContacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                                                >
                                                    <div>
                                                        <div className="text-sm font-medium">{contact.name || 'Unnamed Contact'}</div>
                                                        <div className="text-xs text-gray-500">{contact.phoneNumber}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/campaigns')}
                                className="btn btn-outline mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || selectedContacts.length === 0}
                                className={`btn btn-primary ${selectedContacts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {saving ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FiSave className="mr-2" /> Create Campaign
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>

                        {preview ? (
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="mb-2">
                                        <span className="text-sm font-medium text-gray-700">Template:</span>
                                        <span className="ml-2 text-sm">{
                                            templates.find(t => t.contentSid === preview.templateSid)?.name || preview.templateSid
                                        }</span>
                                    </div>

                                    {Object.entries(preview.variables || {}).length > 0 && (
                                        <div className="mb-2">
                                            <span className="text-sm font-medium text-gray-700">Variables:</span>
                                            <div className="mt-1 pl-2 border-l-2 border-gray-200">
                                                {Object.entries(preview.variables).map(([key, value]) => (
                                                    <div key={key} className="text-sm">
                                                        <span className="font-mono text-primary-600">{key}:</span> {value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 text-xs text-gray-500">
                                        {preview.previewNote}
                                    </div>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-medium text-gray-500">Recipients:</span>
                                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                                            {selectedContacts.length} contacts
                                        </span>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        {selectedContacts.slice(0, 3).map((contact) => (
                                            <div key={contact.id} className="text-sm flex items-center">
                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                                                    {contact.name ? contact.name[0].toUpperCase() : 'C'}
                                                </div>
                                                <span className="truncate">{contact.name || contact.phoneNumber}</span>
                                            </div>
                                        ))}

                                        {selectedContacts.length > 3 && (
                                            <div className="text-xs text-gray-500 text-center mt-1">
                                                + {selectedContacts.length - 3} more contacts
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="text-xs font-medium text-gray-500 mb-1">Schedule:</div>
                                    <div className="text-sm">
                                        {campaign.scheduledDate
                                            ? new Date(campaign.scheduledDate).toLocaleString()
                                            : 'Not scheduled (will be saved as draft)'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <FiMessageSquare className="h-12 w-12 mb-4" />
                                <p className="text-center">Select a template and click preview to see how your campaign will look</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CampaignFormPage;