// src/pages/campaigns/CampaignsListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CampaignService } from '../../api/campaignService';
import { toast } from 'react-hot-toast';
import {
    FiEdit,
    FiCheck,

    FiPlus,
    FiEye,
    FiTrash2,
    FiBarChart2,
    FiClock,

    FiX,
    FiFilter,
    FiRefreshCw,
    FiPlay,
    FiStopCircle,
    FiAlertCircle,
    FiArchive,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';

const CampaignsListPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0
    });

    useEffect(() => {
        fetchCampaigns();
    }, [pagination.currentPage, pagination.pageSize, statusFilter]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await CampaignService.getCampaigns(
                pagination.currentPage,
                pagination.pageSize,
                statusFilter
            );
            setCampaigns(response.data.data || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 1,
                totalCount: response.data.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handleDeleteClick = (campaign) => {
        setCampaignToDelete(campaign);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await CampaignService.deleteCampaign(campaignToDelete.id);
            setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDelete.id));
            toast.success('Campaign deleted successfully');
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Failed to delete campaign');
        } finally {
            setShowDeleteModal(false);
            setCampaignToDelete(null);
        }
    };

    const handleLaunchCampaign = async (id) => {
        try {
            await CampaignService.launchCampaign(id);
            toast.success('Campaign launched successfully');
            fetchCampaigns();
        } catch (error) {
            console.error('Error launching campaign:', error);
            toast.error('Failed to launch campaign');
        }
    };

    const handleCancelCampaign = async (id) => {
        try {
            await CampaignService.cancelCampaign(id);
            toast.success('Campaign cancelled successfully');
            fetchCampaigns();
        } catch (error) {
            console.error('Error cancelling campaign:', error);
            toast.error('Failed to cancel campaign');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FiEdit className="mr-1 h-3 w-3" /> Draft
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FiClock className="mr-1 h-3 w-3" /> Scheduled
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FiPlay className="mr-1 h-3 w-3" /> In Progress
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1 h-3 w-3" /> Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiX className="mr-1 h-3 w-3" /> Cancelled
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiAlertCircle className="mr-1 h-3 w-3" /> Error
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const renderActionButtons = (campaign) => {
        const actions = [];

        // View details/analytics
        actions.push(
            <Link
                key="view"
                to={`/campaigns/${campaign.id}`}
                className="text-primary-600 hover:text-primary-900"
                title="View details"
            >
                <FiEye className="h-5 w-5" />
            </Link>
        );

        // Launch campaign (only for draft or scheduled)
        if (campaign.status === 'draft' || campaign.status === 'scheduled') {
            actions.push(
                <button
                    key="launch"
                    onClick={() => handleLaunchCampaign(campaign.id)}
                    className="text-green-600 hover:text-green-900"
                    title="Launch campaign"
                >
                    <FiPlay className="h-5 w-5" />
                </button>
            );
        }

        // Cancel campaign (only for scheduled or in_progress)
        if (campaign.status === 'scheduled' || campaign.status === 'in_progress') {
            actions.push(
                <button
                    key="cancel"
                    onClick={() => handleCancelCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Cancel campaign"
                >
                    <FiStopCircle className="h-5 w-5" />
                </button>
            );
        }

        // Delete campaign (only for draft)
        if (campaign.status === 'draft') {
            actions.push(
                <button
                    key="delete"
                    onClick={() => handleDeleteClick(campaign)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete campaign"
                >
                    <FiTrash2 className="h-5 w-5" />
                </button>
            );
        }

        // Analytics (for all campaigns)
        actions.push(
            <Link
                key="analytics"
                to={`/campaigns/${campaign.id}/analytics`}
                className="text-blue-600 hover:text-blue-900"
                title="View analytics"
            >
                <FiBarChart2 className="h-5 w-5" />
            </Link>
        );

        return actions;
    };

    const StatusFilterButton = ({ status, label, icon }) => (
        <button
            onClick={() => handleStatusFilterChange(status)}
            className={`px-3 py-1 rounded-md text-sm flex items-center ${statusFilter === status
                ? 'bg-primary-100 text-primary-800 border border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
        >
            {icon}
            <span className="ml-1">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchCampaigns}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                    <Link
                        to="/campaigns/new"
                        className="btn btn-primary flex items-center"
                    >
                        <FiPlus className="mr-2" /> New Campaign
                    </Link>
                </div>
            </div>

            {/* Status Filters */}
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="flex flex-wrap gap-2">
                    <StatusFilterButton
                        status=""
                        label="All"
                        icon={<FiFilter className="h-4 w-4" />}
                    />
                    <StatusFilterButton
                        status="draft"
                        label="Draft"
                        icon={<FiEdit className="h-4 w-4" />}
                    />
                    <StatusFilterButton
                        status="scheduled"
                        label="Scheduled"
                        icon={<FiClock className="h-4 w-4" />}
                    />
                    <StatusFilterButton
                        status="in_progress"
                        label="In Progress"
                        icon={<FiPlay className="h-4 w-4" />}
                    />
                    <StatusFilterButton
                        status="completed"
                        label="Completed"
                        icon={<FiCheck className="h-4 w-4" />}
                    />
                    <StatusFilterButton
                        status="cancelled"
                        label="Cancelled"
                        icon={<FiX className="h-4 w-4" />}
                    />
                </div>
            </div>

            {/* Campaigns List */}
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
                ) : campaigns.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiArchive className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No campaigns found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter
                                ? `No campaigns with status "${statusFilter}". Try another filter or create a new campaign.`
                                : 'Get started by creating your first campaign.'}
                        </p>
                        <Link
                            to="/campaigns/new"
                            className="mt-4 btn btn-primary"
                        >
                            <FiPlus className="mr-2" /> New Campaign
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipients
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Scheduled Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                            <div className="text-xs text-gray-500">{campaign.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(campaign.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {campaign.totalMessages} recipients
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {campaign.scheduledDate
                                                ? new Date(campaign.scheduledDate).toLocaleString()
                                                : 'Not scheduled'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${campaign.status === 'completed'
                                                            ? 'bg-green-600'
                                                            : campaign.status === 'cancelled' || campaign.status === 'error'
                                                                ? 'bg-red-600'
                                                                : 'bg-blue-600'
                                                            }`}
                                                        style={{
                                                            width: `${campaign.totalMessages > 0
                                                                ? Math.round((campaign.sentMessages / campaign.totalMessages) * 100)
                                                                : 0
                                                                }%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {campaign.totalMessages > 0
                                                        ? Math.round((campaign.sentMessages / campaign.totalMessages) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {campaign.sentMessages}/{campaign.totalMessages} sent
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                {renderActionButtons(campaign)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && campaigns.length > 0 && (
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
                                            Delete Campaign
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the campaign "{campaignToDelete?.name}"?
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
                                        setCampaignToDelete(null);
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




export default CampaignsListPage;