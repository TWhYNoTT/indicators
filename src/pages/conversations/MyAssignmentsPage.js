// src/pages/conversations/MyAssignmentsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConversationService } from '../../api/conversationService';
import { toast } from 'react-hot-toast';
import { FiMessageSquare, FiUser, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MyAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await ConversationService.getMyAssignments();
            setAssignments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error('Failed to load assigned conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (contactNumber) => {
        try {
            await ConversationService.releaseConversation({
                contactNumber,
                keepChatbotDisabled: false
            });
            toast.success('Conversation released');
            fetchAssignments();
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
            fetchAssignments();
        } catch (error) {
            console.error('Error toggling chatbot:', error);
            toast.error('Failed to toggle chatbot');
        }
    };

    const handleUpdateActivity = async (contactNumber) => {
        try {
            await ConversationService.updateActivity({
                contactNumber,
                activityStatus: 'active'
            });
            toast.success('Activity updated');
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error('Failed to update activity');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Assigned Conversations</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchAssignments}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, index) => (
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
                ) : assignments.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No assigned conversations</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You don't have any conversations assigned to you yet.
                        </p>
                        <Link to="/conversations" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                            View all conversations
                        </Link>
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
                                        Assigned Since
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
                                {assignments.map((assignment) => (
                                    <tr key={assignment.contactNumber} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                                    <FiUser className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {assignment.contactName || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.contactNumber}
                                                    </div>
                                                </div>
                                                {assignment.unreadCount > 0 && (
                                                    <div className="ml-2 flex-shrink-0">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            {assignment.unreadCount} new
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {assignment.lastMessage || 'No message'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <FiClock className="mr-1 h-4 w-4" />
                                                {new Date(assignment.assignedTime).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FiCheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                                                <span className="text-sm text-gray-500">
                                                    Assigned to you
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Chatbot: {assignment.chatbotDisabled ? 'Disabled' : 'Enabled'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/conversations/chat/${assignment.contactNumber}`}
                                                    onClick={() => handleUpdateActivity(assignment.contactNumber)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleRelease(assignment.contactNumber)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Release
                                                </button>
                                                <button
                                                    onClick={() => handleToggleChatbot(
                                                        assignment.contactNumber,
                                                        !assignment.chatbotDisabled
                                                    )}
                                                    className={`${assignment.chatbotDisabled
                                                            ? 'text-green-600 hover:text-green-900'
                                                            : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                >
                                                    {assignment.chatbotDisabled ? 'Enable Chatbot' : 'Disable Chatbot'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default MyAssignmentsPage;