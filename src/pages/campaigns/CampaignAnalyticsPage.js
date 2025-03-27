// src/pages/campaigns/CampaignAnalyticsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CampaignService } from '../../api/campaignService';
import { toast } from 'react-hot-toast';
import {
    FiEdit,
    FiCheck,
    FiX,
    FiArrowLeft,
    FiBarChart2,
    FiPieChart,
    FiMessageSquare,
    FiClock,
    FiAlertCircle,
    FiPlay,
    FiStopCircle,
    FiRefreshCw
} from 'react-icons/fi';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const CampaignAnalyticsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaignData();
    }, [id]);

    const fetchCampaignData = async () => {
        setLoading(true);
        try {
            // Fetch campaign details
            const campaignResponse = await CampaignService.getCampaign(id);
            setCampaign(campaignResponse.data.Data);

            // Fetch campaign analytics
            const analyticsResponse = await CampaignService.getCampaignAnalytics(id);
            setAnalytics(analyticsResponse.data.Data);
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            toast.error('Failed to load campaign data');
            navigate('/campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchCampaign = async () => {
        try {
            await CampaignService.launchCampaign(id);
            toast.success('Campaign launched successfully');
            fetchCampaignData();
        } catch (error) {
            console.error('Error launching campaign:', error);
            toast.error('Failed to launch campaign');
        }
    };

    const handleCancelCampaign = async () => {
        try {
            await CampaignService.cancelCampaign(id);
            toast.success('Campaign cancelled successfully');
            fetchCampaignData();
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

    // Prepare chart data
    const prepareStatusChartData = () => {
        if (!analytics || !analytics.StatusBreakdown) return [];

        const data = Object.entries(analytics.StatusBreakdown).map(([status, count]) => ({
            name: status,
            value: count
        }));

        return data;
    };

    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6565'];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Format rate for display
    const formatRate = (rate) => {
        return `${(rate * 100).toFixed(2)}%`;
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
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Campaign Analytics: {campaign?.name}
                    </h1>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={fetchCampaignData}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>

                    {campaign?.status === 'draft' && (
                        <button
                            onClick={handleLaunchCampaign}
                            className="btn btn-primary flex items-center"
                        >
                            <FiPlay className="mr-2" /> Launch Campaign
                        </button>
                    )}

                    {(campaign?.status === 'scheduled' || campaign?.status === 'in_progress') && (
                        <button
                            onClick={handleCancelCampaign}
                            className="btn btn-danger flex items-center"
                        >
                            <FiStopCircle className="mr-2" /> Cancel Campaign
                        </button>
                    )}
                </div>
            </div>

            {/* Campaign Overview Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Campaign Overview</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Status</div>
                            <div className="mt-1 flex items-center">
                                {getStatusBadge(campaign?.status)}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Schedule</div>
                            <div className="mt-1 text-sm">
                                {campaign?.scheduledDate
                                    ? new Date(campaign.scheduledDate).toLocaleString()
                                    : 'Not scheduled'}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Created</div>
                            <div className="mt-1 text-sm">
                                {new Date(campaign?.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Total Recipients</div>
                            <div className="mt-1 text-2xl font-semibold">{campaign?.totalMessages}</div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Messages Sent</div>
                            <div className="mt-1 text-2xl font-semibold">{campaign?.sentMessages}</div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Response Rate</div>
                            <div className="mt-1 text-2xl font-semibold">
                                {analytics ? formatRate(analytics.ResponseRate) : '0%'}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {campaign && (
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Campaign Progress</span>
                                <span>
                                    {campaign.sentMessages}/{campaign.totalMessages} messages sent
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full ${campaign.status === 'completed'
                                        ? 'bg-green-500'
                                        : campaign.status === 'cancelled' || campaign.status === 'error'
                                            ? 'bg-red-500'
                                            : 'bg-blue-500'
                                        }`}
                                    style={{
                                        width: `${campaign.totalMessages > 0
                                            ? Math.round((campaign.sentMessages / campaign.totalMessages) * 100)
                                            : 0
                                            }%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Message Status Breakdown */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Message Status Breakdown</h2>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={prepareStatusChartData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {prepareStatusChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Message Metrics */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Message Metrics</h2>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    {
                                        name: 'Sent',
                                        value: campaign?.sentMessages || 0
                                    },
                                    {
                                        name: 'Delivered',
                                        value: campaign?.deliveredMessages || 0
                                    },
                                    {
                                        name: 'Read',
                                        value: campaign?.readMessages || 0
                                    },
                                    {
                                        name: 'Failed',
                                        value: campaign?.failedMessages || 0
                                    },
                                    {
                                        name: 'Responses',
                                        value: campaign?.responses || 0
                                    }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0ea5e9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Campaign Name</div>
                            <div className="mt-1 text-sm">{campaign?.name}</div>
                        </div>

                        {campaign?.description && (
                            <div>
                                <div className="text-sm font-medium text-gray-500">Description</div>
                                <div className="mt-1 text-sm">{campaign.description}</div>
                            </div>
                        )}

                        <div>
                            <div className="text-sm font-medium text-gray-500">Template</div>
                            <div className="mt-1 text-sm">{campaign?.templateSid}</div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-gray-500">Created By</div>
                            <div className="mt-1 text-sm">{campaign?.createdBy || 'System'}</div>
                        </div>

                        {campaign?.audienceFilter && (
                            <div className="md:col-span-2">
                                <div className="text-sm font-medium text-gray-500">Audience Filter</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {campaign.audienceFilter.split(',').map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(campaign?.variable1 || campaign?.variable2 || campaign?.variable3) && (
                            <div className="md:col-span-2">
                                <div className="text-sm font-medium text-gray-500">Template Variables</div>
                                <div className="mt-1 space-y-1">
                                    {campaign.variable1 && (
                                        <div className="text-sm">Variable 1: {campaign.variable1}</div>
                                    )}
                                    {campaign.variable2 && (
                                        <div className="text-sm">Variable 2: {campaign.variable2}</div>
                                    )}
                                    {campaign.variable3 && (
                                        <div className="text-sm">Variable 3: {campaign.variable3}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default CampaignAnalyticsPage;