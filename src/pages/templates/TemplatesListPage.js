// src/pages/templates/TemplatesListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TemplateService } from '../../api/templateService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
// src/pages/templates/TemplatesListPage.js
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiFilter,
    FiRefreshCw,
    FiCheck,
    FiX,
    FiGlobe,
    FiCommand,
    FiMessageSquare,
    FiChevronLeft,  // Add this missing import
    FiChevronRight  // Add this missing import
} from 'react-icons/fi';

const TemplatesListPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showOnlyApproved, setShowOnlyApproved] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0
    });
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole('SuperAdmin');

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, [pagination.currentPage, pagination.pageSize, showOnlyApproved]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await TemplateService.getTemplates(
                showOnlyApproved,
                pagination.currentPage,
                pagination.pageSize
            );
            setTemplates(response.data.data || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 1,
                totalCount: response.data.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
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

    const handleApprovalToggle = async (id, isApproved) => {
        try {
            await TemplateService.updateApprovalStatus(id, !isApproved);
            const updatedTemplates = templates.map(template =>
                template.id === id ? { ...template, isApproved: !isApproved } : template
            );
            setTemplates(updatedTemplates);
            toast.success(`Template ${!isApproved ? 'approved' : 'unapproved'} successfully`);
        } catch (error) {
            console.error('Error toggling approval status:', error);
            toast.error('Failed to toggle approval status');
        }
    };

    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await TemplateService.deleteTemplate(templateToDelete.id);
            setTemplates(templates.filter(template => template.id !== templateToDelete.id));
            toast.success('Template deleted successfully');
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
        } finally {
            setShowDeleteModal(false);
            setTemplateToDelete(null);
        }
    };

    const handleTestTemplate = (templateSid) => {
        // Navigate to test page
        window.location.href = `/templates/test/${templateSid}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Templates</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowOnlyApproved(!showOnlyApproved)}
                        className={`btn btn-outline flex items-center ${showOnlyApproved ? 'bg-primary-50' : ''}`}
                    >
                        <FiFilter className="mr-2" /> {showOnlyApproved ? 'Show All Templates' : 'Show Approved Only'}
                    </button>
                    <button
                        onClick={fetchTemplates}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                    <Link
                        to="/templates/new"
                        className="btn btn-primary flex items-center"
                    >
                        <FiPlus className="mr-2" /> New Template
                    </Link>
                </div>
            </div>

            {/* Templates List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <div className="animate-pulse space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiCommand className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No templates found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {showOnlyApproved
                                ? 'There are no approved templates. Try showing all templates or create a new one.'
                                : 'Get started by creating your first WhatsApp template.'}
                        </p>
                        <Link
                            to="/templates/new"
                            className="mt-4 btn btn-primary"
                        >
                            <FiPlus className="mr-2" /> New Template
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Template
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Content SID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Language
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.map((template) => (
                                    <tr key={template.id} className={template.isApproved ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                            <div className="text-xs text-gray-500">{template.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{template.contentSid}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FiGlobe className="mr-1.5 h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-900">{template.language}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {template.type || 'Generic'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isSuperAdmin ? (
                                                <button
                                                    onClick={() => handleApprovalToggle(template.id, template.isApproved)}
                                                    className={`flex items-center ${template.isApproved
                                                        ? 'text-green-600 hover:text-green-900'
                                                        : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                >
                                                    {template.isApproved ? (
                                                        <>
                                                            <FiCheckCircle className="mr-1.5 h-5 w-5" />
                                                            <span className="text-sm">Approved</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiXCircle className="mr-1.5 h-5 w-5" />
                                                            <span className="text-sm">Not Approved</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className={`flex items-center ${template.isApproved ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {template.isApproved ? (
                                                        <>
                                                            <FiCheckCircle className="mr-1.5 h-5 w-5" />
                                                            <span className="text-sm">Approved</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiXCircle className="mr-1.5 h-5 w-5" />
                                                            <span className="text-sm">Not Approved</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <Link
                                                    to={`/templates/edit/${template.id}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <FiEdit2 className="h-5 w-5" />
                                                </Link>
                                                {template.isApproved && (
                                                    <button
                                                        onClick={() => handleTestTemplate(template.contentSid)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <FiMessageSquare className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteClick(template)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FiTrash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination - similar to previous implementations */}
                {!loading && templates.length > 0 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
                                    </span>{' '}
                                    of <span className="font-medium">{pagination.totalCount}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                        disabled={pagination.currentPage === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <FiChevronLeft className="h-5 w-5" />
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setPagination({ ...pagination, currentPage: index + 1 })}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === index + 1
                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === pagination.totalPages
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <FiChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FiAlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Delete Template
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the template "{templateToDelete?.name}"?
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setTemplateToDelete(null);
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};





export default TemplatesListPage;