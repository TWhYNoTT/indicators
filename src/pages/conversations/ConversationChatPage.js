// src/pages/conversations/ConversationChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WhatsAppService } from '../../api/whatsAppService';
import { ConversationService } from '../../api/conversationService';
import { ContactService } from '../../api/contactService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    FiSend,
    FiPaperclip,
    FiImage,
    FiFile,
    FiUser,
    FiPhone,
    FiMail,
    FiAlertCircle,
    FiCheckCircle,
    FiChevronLeft,
    FiMessageSquare,
    FiActivity,
    FiClock,
    FiEdit,
    FiCheck,
    FiX,
} from 'react-icons/fi';

const ConversationChatPage = () => {
    const { contactNumber } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const messagesEndRef = useRef(null);

    const [contact, setContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 50,
        totalPages: 1,
        totalCount: 0
    });

    useEffect(() => {
        fetchConversation();

        // Set up periodic refresh
        const intervalId = setInterval(() => {
            fetchMessages(false);
        }, 15000); // Refresh every 15 seconds

        return () => clearInterval(intervalId);
    }, [contactNumber]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversation = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchContact(),
                fetchMessages(),
                fetchAssignment()
            ]);
        } catch (error) {
            console.error('Error fetching conversation:', error);
            toast.error('Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    const fetchContact = async () => {
        try {
            const response = await ContactService.getContactByPhone(contactNumber);
            setContact(response.data.data);
        } catch (error) {
            console.error('Error fetching contact:', error);
        }
    };

    const fetchMessages = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await WhatsAppService.getMessageHistory(
                contactNumber,
                pagination.currentPage,
                pagination.pageSize
            );
            setMessages(response.data.data.reverse() || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                pageSize: response.data.pageSize || 50,
                totalPages: response.data.totalPages || 1,
                totalCount: response.data.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (showLoading) {
                toast.error('Failed to load messages');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchAssignment = async () => {
        try {
            const response = await ConversationService.getAssignment(contactNumber);
            setAssignment(response.data.data);
        } catch (error) {
            // It's okay if there's no assignment
            setAssignment(null);
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage || newMessage.trim() === '') && !file) {
            toast.error('Please enter a message or attach a file');
            return;
        }

        setSendingMessage(true);

        try {
            let response;

            if (file) {
                // Send media message
                const mediaMessageData = {
                    ToNumber: contactNumber,
                    Caption: newMessage,
                    Media: file,
                    CustomerId: contact?.customerId
                };

                response = await WhatsAppService.sendMediaMessage(mediaMessageData);
            } else {
                // Send text message
                const messageData = {
                    ToNumber: contactNumber,
                    Body: newMessage,
                    CustomerId: contact?.customerId
                };

                response = await WhatsAppService.sendMessage(messageData);
            }

            if (response.data.success) {
                setNewMessage('');
                setFile(null);
                setFilePreview(null);

                // Update activity status
                await ConversationService.updateActivity({
                    contactNumber,
                    activityStatus: 'active'
                });

                // Refresh messages
                fetchMessages();
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.Error || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Create file preview
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleAssign = async () => {
        try {
            await ConversationService.assignConversation({
                contactNumber,
                agentId: currentUser.id,
                disableChatbot: true,
                markAsRead: true
            });
            toast.success('Conversation assigned to you');
            fetchAssignment();
        } catch (error) {
            console.error('Error assigning conversation:', error);
            toast.error('Failed to assign conversation');
        }
    };

    const handleRelease = async () => {
        try {
            await ConversationService.releaseConversation({
                contactNumber,
                keepChatbotDisabled: false
            });
            toast.success('Conversation released');
            fetchAssignment();
        } catch (error) {
            console.error('Error releasing conversation:', error);
            toast.error('Failed to release conversation');
        }
    };

    const handleToggleChatbot = async (disableChatbot) => {
        try {
            await ConversationService.toggleChatbot({
                contactNumber,
                disableChatbot
            });
            toast.success(`Chatbot ${disableChatbot ? 'disabled' : 'enabled'}`);
            fetchAssignment();
        } catch (error) {
            console.error('Error toggling chatbot:', error);
            toast.error('Failed to toggle chatbot');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    const groupMessagesByDate = () => {
        if (!messages.length) return [];

        const groups = [];
        let currentDate = '';
        let currentGroup = [];

        messages.forEach(message => {
            const messageDate = formatMessageDate(message.timestamp);

            if (messageDate !== currentDate) {
                if (currentGroup.length > 0) {
                    groups.push({
                        date: currentDate,
                        messages: currentGroup
                    });
                }
                currentDate = messageDate;
                currentGroup = [message];
            } else {
                currentGroup.push(message);
            }
        });

        if (currentGroup.length > 0) {
            groups.push({
                date: currentDate,
                messages: currentGroup
            });
        }

        return groups;
    };

    const messageGroups = groupMessagesByDate();

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/conversations')}
                    className="btn btn-outline flex items-center"
                >
                    <FiChevronLeft className="mr-1" /> Back to Conversations
                </button>

                <div className="flex space-x-2">
                    {!assignment || !assignment.isActive ? (
                        <button
                            onClick={handleAssign}
                            className="btn btn-primary flex items-center"
                        >
                            <FiCheckCircle className="mr-1" /> Assign to Me
                        </button>
                    ) : assignment.agentId === currentUser.id ? (
                        <>
                            <button
                                onClick={handleRelease}
                                className="btn btn-danger flex items-center"
                            >
                                <FiAlertCircle className="mr-1" /> Release
                            </button>
                            <button
                                onClick={() => handleToggleChatbot(!assignment.disableChatbot)}
                                className={`btn ${assignment.disableChatbot ? 'btn-outline' : 'btn-danger'}`}
                            >
                                {assignment.disableChatbot ? 'Enable Chatbot' : 'Disable Chatbot'}
                            </button>
                        </>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <FiUser className="mr-1" /> Assigned to {assignment.agent?.userName || 'another agent'}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex flex-1 bg-white rounded-lg shadow overflow-hidden">
                {/* Contact Sidebar */}
                <div className="hidden md:block w-1/4 border-r border-gray-200 bg-gray-50">
                    <div className="p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                <FiUser className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {loading ? 'Loading...' : (contact?.name || 'Unknown Contact')}
                                </h2>
                                <p className="text-sm text-gray-500">{contactNumber}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="animate-pulse mt-6 space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-sm">
                                    <FiPhone className="mr-2 text-gray-400" />
                                    <span>{contactNumber}</span>
                                </div>
                                {contact?.email && (
                                    <div className="flex items-center text-sm">
                                        <FiMail className="mr-2 text-gray-400" />
                                        <span>{contact.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm">
                                    <FiActivity className="mr-2 text-gray-400" />
                                    <span>
                                        {contact?.hasOptedIn ? 'Opted In' : 'Not Opted In'}
                                    </span>
                                </div>
                                {contact?.customerId && (
                                    <div className="flex items-center text-sm">
                                        <FiFile className="mr-2 text-gray-400" />
                                        <span>Customer ID: {contact.customerId}</span>
                                    </div>
                                )}
                                {contact?.lastContactDate && (
                                    <div className="flex items-center text-sm">
                                        <FiClock className="mr-2 text-gray-400" />
                                        <span>Last Contact: {new Date(contact.lastContactDate).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {contact?.tags && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {contact.tags.split(',').map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {contact?.notes && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">Notes</h3>
                                <p className="mt-2 text-sm text-gray-500">{contact.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <FiMessageSquare className="h-12 w-12 mb-4" />
                                <p className="text-center">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messageGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="space-y-4">
                                    <div className="flex justify-center">
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                            {group.date}
                                        </span>
                                    </div>

                                    {group.messages.map((message, messageIndex) => (
                                        <div
                                            key={messageIndex}
                                            className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${message.direction === 'outbound'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-800'
                                                    }`}
                                            >
                                                {message.body && (
                                                    <p className="text-sm">{message.body}</p>
                                                )}

                                                {message.mediaUrl && (
                                                    <div className="mt-2">
                                                        {message.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                            <img
                                                                src={message.mediaUrl}
                                                                alt="Media"
                                                                className="rounded-md max-h-60 max-w-full"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={message.mediaUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center text-sm underline"
                                                            >
                                                                <FiFile className="mr-1" /> View Attachment
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <div className={`text-xs mt-1 ${message.direction === 'outbound' ? 'text-primary-100' : 'text-gray-500'
                                                    }`}>
                                                    {formatMessageTime(message.timestamp)}
                                                    {message.isAutomatedResponse && ' • Automated'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        {filePreview && (
                            <div className="mb-4 relative">
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="h-24 rounded-md"
                                />
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setFilePreview(null);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-end space-x-2">
                            <div className="relative flex-1">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    rows="3"
                                    disabled={sendingMessage || !assignment || assignment.agentId !== currentUser.id}
                                ></textarea>
                            </div>

                            <label className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                                <FiPaperclip className="h-5 w-5 text-gray-500" />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={sendingMessage || !assignment || assignment.agentId !== currentUser.id}
                                />
                            </label>

                            <button
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !assignment || assignment.agentId !== currentUser.id}
                                className={`p-2 rounded-full bg-primary-500 text-white ${(sendingMessage || !assignment || assignment.agentId !== currentUser.id)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-primary-600'
                                    }`}
                            >
                                {sendingMessage ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <FiSend className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {(!assignment || assignment.agentId !== currentUser.id) && (
                            <div className="mt-2 text-center text-sm text-red-500">
                                You need to assign this conversation to yourself to send messages
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};




export default ConversationChatPage;