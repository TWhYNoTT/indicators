// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUsers, FiArchive, FiCommand, FiActivity } from 'react-icons/fi';
import { WhatsAppService } from '../api/whatsAppService';
import { ContactService } from '../api/contactService';
import { CampaignService } from '../api/campaignService';
import { TemplateService } from '../api/templateService';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        activeConversations: 0,
        totalContacts: 0,
        activeCampaigns: 0,
        totalTemplates: 0,
        approvedTemplates: 0,
        systemHealth: 'Unknown'
    });
    const [recentConversations, setRecentConversations] = useState([]);
    const [messageTrend, setMessageTrend] = useState([]);

    // Generate mock data for message trend
    const generateMessageTrend = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            name: day,
            sent: Math.floor(Math.random() * 50) + 10,
            received: Math.floor(Math.random() * 30) + 5
        }));
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Check system health
                const healthResponse = await WhatsAppService.checkHealth();

                // Fetch active conversations
                const conversationsResponse = await WhatsAppService.getActiveConversations(1, 5);
                setRecentConversations(conversationsResponse.data.Data || []);
                console.log(conversationsResponse)
                // Fetch contacts count (use first page to get total count)
                const contactsResponse = await ContactService.getContacts(1, 1);

                // Fetch campaigns (to get active ones)
                const campaignsResponse = await CampaignService.getCampaigns(1, 100);
                const activeCampaignsCount = campaignsResponse.data?.Data?.filter(
                    c => c.status === 'in_progress' || c.status === 'scheduled'
                ).length || 0;

                // Fetch templates
                const templatesResponse = await TemplateService.getTemplates(false, 1, 100);
                const approvedTemplatesCount = templatesResponse.data?.Data?.filter(
                    t => t.isApproved
                ).length || 0;
                console.log(healthResponse)
                setMetrics({
                    activeConversations: conversationsResponse.data.TotalCount || 0,
                    totalContacts: contactsResponse.data.TotalCount || 0,
                    activeCampaigns: activeCampaignsCount,
                    totalTemplates: templatesResponse.data.TotalCount || 0,
                    approvedTemplates: approvedTemplatesCount,
                    systemHealth: healthResponse.data.Status
                });

                // Set mock message trend data
                setMessageTrend(generateMessageTrend());
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Dashboard metric card component
    const MetricCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color} text-white`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <div className="mt-1 text-2xl font-semibold">{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* System Status */}
            <div className={`bg-white rounded-lg shadow-md p-4 flex items-center ${metrics.systemHealth === 'OK' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                <div className={`p-2 rounded-full ${metrics.systemHealth === 'OK' ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white`}>
                    <FiActivity className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">System Status</h3>
                    <div className="mt-1 text-lg font-semibold">
                        {metrics.systemHealth === 'OK' ? 'All systems operational' : 'System status: ' + metrics.systemHealth}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-40">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                            <div className="flex items-center">
                                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                                <div className="ml-4 space-y-2 flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Active Conversations"
                        value={metrics.activeConversations}
                        icon={<FiMessageSquare className="h-6 w-6" />}
                        color="bg-blue-500"
                    />
                    <MetricCard
                        title="Total Contacts"
                        value={metrics.totalContacts}
                        icon={<FiUsers className="h-6 w-6" />}
                        color="bg-green-500"
                    />
                    <MetricCard
                        title="Active Campaigns"
                        value={metrics.activeCampaigns}
                        icon={<FiArchive className="h-6 w-6" />}
                        color="bg-purple-500"
                    />
                    <MetricCard
                        title="Approved Templates"
                        value={`${metrics.approvedTemplates}/${metrics.totalTemplates}`}
                        icon={<FiCommand className="h-6 w-6" />}
                        color="bg-orange-500"
                    />
                </div>
            )}

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Activity</h2>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={messageTrend}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sent" fill="#0ea5e9" name="Sent" />
                                <Bar dataKey="received" fill="#10b981" name="Received" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                                    <div className="ml-3 flex-1 space-y-1">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentConversations.length > 0 ? (
                                recentConversations.map((conversation, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                            <FiMessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {conversation.ContactName || conversation.ContactNumber}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">
                                                {conversation.LastMessage || 'No message'}
                                                <span className="ml-2 text-gray-400">
                                                    {new Date(conversation.LastMessageTime).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        {conversation.unreadCount > 0 && (
                                            <div className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {conversation.UnreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No recent conversations
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;