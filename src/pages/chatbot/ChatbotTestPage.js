// src/pages/chatbot/ChatbotTestPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatbotService } from '../../api/chatbotService';
import { toast } from 'react-hot-toast';
import { FiMessageSquare, FiSend, FiArrowLeft, FiCpu, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const ChatbotTestPage = () => {
    const [testMessage, setTestMessage] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const handleCustomerIdChange = (e) => {
        const { value } = e.target;
        setCustomerId(value === '' ? '' : value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!testMessage.trim()) {
            toast.error('Please enter a message to test');
            return;
        }

        setLoading(true);

        try {
            const response = await ChatbotService.testMessage(
                testMessage,
                customerId ? parseInt(customerId) : null
            );

            const result = response.data;
            setResult(result);

            // Add to history
            setHistory([
                ...history,
                {
                    input: testMessage,
                    response: result.response,
                    matchedRuleId: result.matchedRuleId,
                    forwardToHuman: result.forwardToHuman
                }
            ]);

            // Clear input
            setTestMessage('');
        } catch (error) {
            console.error('Error testing chatbot:', error);
            toast.error('Failed to test chatbot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Test Chatbot</h1>
                <Link
                    to="/chatbot"
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Rules
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Test Form */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700 mb-1">
                                    Test Message
                                </label>
                                <textarea
                                    id="testMessage"
                                    name="testMessage"
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    rows="4"
                                    className="input"
                                    placeholder="Enter a message to test how the chatbot would respond..."
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer ID (optional)
                                </label>
                                <input
                                    type="number"
                                    id="customerId"
                                    name="customerId"
                                    value={customerId}
                                    onChange={handleCustomerIdChange}
                                    className="input"
                                    placeholder="Enter a customer ID for personalized responses"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    If provided, customer information will be used to personalize responses.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Testing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <FiSend className="mr-2" /> Test Chatbot
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Latest Result */}
                        {result && (
                            <div className="mt-6 p-4 border rounded-md">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Latest Result:</h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Input Message:</span>
                                        <p className="text-sm">{result.inputMessage}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Chatbot Response:</span>
                                        <p className="text-sm">{result.response}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-gray-500 mr-2">Matched Rule ID:</span>
                                        <span className="text-sm">
                                            {result.matchedRuleId ? `#${result.matchedRuleId}` : 'None'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-gray-500 mr-2">Forward to Human:</span>
                                        {result.forwardToHuman ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <FiAlertCircle className="mr-1 h-3 w-3" /> Yes
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <FiCheckCircle className="mr-1 h-3 w-3" /> No
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Test History */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Test History</h2>

                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                                <FiMessageSquare className="h-12 w-12 mb-4" />
                                <p className="text-center">No test history yet. Use the form to test chatbot responses.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-md">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <FiMessageSquare className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm text-gray-900">{item.input}</div>
                                                <div className="text-xs text-gray-500">User Input</div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-start">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <FiCpu className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm text-gray-900">{item.response}</div>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    {item.matchedRuleId ? (
                                                        <span className="mr-2">Rule #{item.matchedRuleId}</span>
                                                    ) : (
                                                        <span className="mr-2">No rule matched</span>
                                                    )}

                                                    {item.forwardToHuman ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <FiAlertCircle className="mr-1 h-3 w-3" /> Forward to Human
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <FiCheckCircle className="mr-1 h-3 w-3" /> Automated
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};




export default ChatbotTestPage;