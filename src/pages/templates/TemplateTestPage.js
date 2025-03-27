// src/pages/templates/TemplateTestPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TemplateService } from '../../api/templateService';
import { toast } from 'react-hot-toast';
// src/pages/templates/TemplateTestPage.js
import {
    FiSend,
    FiArrowLeft,
    FiMessageSquare,
    FiCommand,
    FiCheckCircle,
    FiXCircle,     // Add this missing import
    FiX           // Make sure this is also included
} from 'react-icons/fi';

const TemplateTestPage = () => {
    const { sid } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [testData, setTestData] = useState({
        toNumber: '',
        variable1: '',
        variable2: '',
        variable3: ''
    });
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (sid) {
            fetchTemplate();
        } else {
            setLoading(false);
        }
    }, [sid]);

    const fetchTemplate = async () => {
        setLoading(true);
        try {
            const response = await TemplateService.getTemplateBySid(sid);
            setTemplate(response.data.data);
        } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Failed to load template details');
            navigate('/templates');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTestData({
            ...testData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!testData.toNumber) {
            toast.error('Please provide a phone number');
            return;
        }

        setSending(true);

        try {
            // Prepare variables array
            const variables = [];
            if (testData.variable1) variables.push(testData.variable1);
            if (testData.variable2) variables.push(testData.variable2);
            if (testData.variable3) variables.push(testData.variable3);

            const response = await TemplateService.testTemplate({
                toNumber: testData.toNumber,
                templateSid: template?.contentSid || sid,
                ...variables.length > 0 && { variables }
            });

            setResult(response.data);
            toast.success('Template message sent successfully');
        } catch (error) {
            console.error('Error testing template:', error);
            toast.error(error.response?.data?.Error || 'Failed to send test message');
        } finally {
            setSending(false);
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
                    Test Template
                    {template ? `: ${template.name}` : ''}
                </h1>
                <button
                    onClick={() => navigate('/templates')}
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Templates
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Info */}
                {template && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Template Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Name:</span>
                                    <div className="mt-1 text-sm">{template.name}</div>
                                </div>
                                {template.description && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Description:</span>
                                        <div className="mt-1 text-sm">{template.description}</div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Content SID:</span>
                                    <div className="mt-1 text-sm font-mono">{template.contentSid}</div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Language:</span>
                                    <div className="mt-1 text-sm">{template.language}</div>
                                </div>
                                {template.type && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Type:</span>
                                        <div className="mt-1 text-sm">{template.type}</div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status:</span>
                                    <div className="mt-1 flex items-center">
                                        {template.isApproved ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <FiCheckCircle className="mr-1 h-3 w-3" /> Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <FiXCircle className="mr-1 h-3 w-3" /> Not Approved
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Form */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Test Template</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="toNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="toNumber"
                                    name="toNumber"
                                    value={testData.toNumber}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., +1234567890"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter the phone number with country code.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="variable1" className="block text-sm font-medium text-gray-700 mb-1">
                                    Variable 1
                                </label>
                                <input
                                    type="text"
                                    id="variable1"
                                    name="variable1"
                                    value={testData.variable1}
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
                                    value={testData.variable2}
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
                                    value={testData.variable3}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Third variable value"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={sending || !template?.isApproved}
                                    className={`w-full btn ${template?.isApproved ? 'btn-primary' : 'btn-outline cursor-not-allowed'
                                        }`}
                                >
                                    {sending ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <FiSend className="mr-2" /> Send Test Message
                                        </span>
                                    )}
                                </button>

                                {!template?.isApproved && (
                                    <p className="mt-2 text-xs text-center text-red-500">
                                        Template must be approved before testing.
                                    </p>
                                )}
                            </div>
                        </form>

                        {/* Result Display */}
                        {result && (
                            <div className="mt-6 p-4 border rounded-md bg-gray-50">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Test Result:</h3>
                                <div className="flex items-center text-sm mb-2">
                                    <FiMessageSquare className="h-5 w-5 mr-2 text-primary-500" />
                                    <span>Message SID: {result.messageSid}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiCommand className="h-5 w-5 mr-2 text-primary-500" />
                                    <span>Status: {result.status}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default TemplateTestPage;