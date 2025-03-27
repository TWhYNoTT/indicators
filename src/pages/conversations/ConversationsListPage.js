// src/pages/conversations/ConversationsListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppService } from '../../api/whatsAppService';
import { ConversationService } from '../../api/conversationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
// src/pages/conversations/ConversationsListPage.js
import {
    FiMessageSquare,
    FiUser,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiEdit,
    FiX,
    FiRefreshCw,    // Add this missing import
    FiChevronLeft,  // Add this missing import
    FiChevronRight  // Add this missing import
} from 'react-icons/fi';

const ConversationsListPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0
    });
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchConversations(pagination.currentPage, pagination.pageSize);
    }, [pagination.currentPage, pagination.pageSize]);

    const fetchConversations = async (page, pageSize) => {
        setLoading(true);
        try {
            const response = await WhatsAppService.getActiveConversations(page, pageSize);
            setConversations(response.data.data || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 1,
                totalCount: response.data.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (contactNumber) => {
        try {
            await ConversationService.assignConversation({
                contactNumber,
                agentId: currentUser.id,
                disableChatbot: true,
                markAsRead: true
            });
            toast.success('Conversation assigned to you');
            fetchConversations(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            console.error('Error assigning conversation:', error);
            toast.error('Failed to assign conversation');
        }
    };

    const handleRelease = async (contactNumber) => {
        try {
            await ConversationService.releaseConversation({
                contactNumber,
                keepChatbotDisabled: false
            });
            toast.success('Conversation released');
            fetchConversations(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            console.error('Error releasing conversation:', error);
            toast.error('Failed to release conversation');
        }
    };

    const handleToggleChatbot = async (contactNumber, disableChatbot) => {
        try {
            await ConversationService.toggleChatbot({
                contactNumber,
                disableChatbot
            });
            toast.success(`Chatbot ${disableChatbot ? 'disabled' : 'enabled'}`);
            fetchConversations(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            console.error('Error toggling chatbot:', error);
            toast.error('Failed to toggle chatbot');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Active Conversations</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => fetchConversations(pagination.currentPage, pagination.pageSize)}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <div className="animate-pulse space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No active conversations</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            When customers message you, their conversations will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Message
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
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
                                {conversations.map((conversation) => (
                                    <tr key={conversation.contactNumber} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                                    <FiUser className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {conversation.contactName || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {conversation.contactNumber}
                                                    </div>
                                                </div>
                                                {conversation.unreadCount > 0 && (
                                                    <div className="ml-2 flex-shrink-0">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            {conversation.unreadCount} new
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {conversation.lastMessage || 'No message'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiClock className="mr-1 h-4 w-4" />
                                                {new Date(conversation.lastMessageTime).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {conversation.isAssigned ? (
                                                    <>
                                                        <FiCheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                                                        <span className="text-sm text-gray-500">
                                                            Assigned to {conversation.assignedAgentId === currentUser.id
                                                                ? 'you'
                                                                : (conversation.assignedAgentName || 'Agent')}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiAlertCircle className="mr-1.5 h-4 w-4 text-yellow-500" />
                                                        <span className="text-sm text-gray-500">Unassigned</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Chatbot: {conversation.chatbotDisabled ? 'Disabled' : 'Enabled'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/conversations/chat/${conversation.contactNumber}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    View
                                                </Link>
                                                {!conversation.isAssigned && (
                                                    <button
                                                        onClick={() => handleAssign(conversation.contactNumber)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Assign to me
                                                    </button>
                                                )}
                                                {conversation.isAssigned && conversation.assignedAgentId === currentUser.id && (
                                                    <button
                                                        onClick={() => handleRelease(conversation.contactNumber)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Release
                                                    </button>
                                                )}
                                                {conversation.isAssigned && conversation.assignedAgentId === currentUser.id && (
                                                    <button
                                                        onClick={() => handleToggleChatbot(
                                                            conversation.contactNumber,
                                                            !conversation.chatbotDisabled
                                                        )}
                                                        className={`${conversation.chatbotDisabled
                                                            ? 'text-green-600 hover:text-green-900'
                                                            : 'text-red-600 hover:text-red-900'
                                                            }`}
                                                    >
                                                        {conversation.chatbotDisabled ? 'Enable Chatbot' : 'Disable Chatbot'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && conversations.length > 0 && (
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
        </div>
    );
};





export default ConversationsListPage;