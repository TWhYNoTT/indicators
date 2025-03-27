// src/pages/chatbot/ChatbotRulesPage.js
import React, { useState, useEffect } from 'react';
import { ChatbotService } from '../../api/chatbotService';
import { toast } from 'react-hot-toast';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiToggleLeft,
    FiToggleRight,
    FiAlertCircle,
    FiFilter,
    FiRefreshCw,
    FiArrowUp,
    FiArrowDown,
    FiMessageSquare
} from 'react-icons/fi';

const ChatbotRulesPage = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const [newRule, setNewRule] = useState({
        name: '',
        keywords: '',
        response: '',
        priority: 0,
        forwardToHuman: false
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchRules();
    }, [showOnlyActive]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await ChatbotService.getRules(showOnlyActive);
            setRules(response.data.data || []);
        } catch (error) {
            console.error('Error fetching chatbot rules:', error);
            toast.error('Failed to load chatbot rules');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRule = async (id, isActive) => {
        try {
            await ChatbotService.toggleRuleStatus(id);
            const updatedRules = rules.map(rule =>
                rule.id === id ? { ...rule, isActive: !isActive } : rule
            );
            setRules(updatedRules);
            toast.success(`Rule ${isActive ? 'deactivated' : 'activated'} successfully`);
        } catch (error) {
            console.error('Error toggling rule status:', error);
            toast.error('Failed to toggle rule status');
        }
    };

    const handleDeleteClick = (rule) => {
        setRuleToDelete(rule);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await ChatbotService.deleteRule(ruleToDelete.id);
            setRules(rules.filter(rule => rule.id !== ruleToDelete.id));
            toast.success('Rule deleted successfully');
        } catch (error) {
            console.error('Error deleting rule:', error);
            toast.error('Failed to delete rule');
        } finally {
            setShowDeleteModal(false);
            setRuleToDelete(null);
        }
    };

    const handleEditClick = (rule) => {
        setEditingRule(rule);
        setNewRule({
            name: rule.name,
            keywords: rule.keywords,
            response: rule.response,
            priority: rule.priority,
            forwardToHuman: rule.forwardToHuman
        });
        setShowForm(true);
    };

    const handleAddNewClick = () => {
        setEditingRule(null);
        setNewRule({
            name: '',
            keywords: '',
            response: '',
            priority: 0,
            forwardToHuman: false
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewRule({
            ...newRule,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setNewRule({
            ...newRule,
            [name]: parseInt(value) || 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;

            if (editingRule) {
                // Update existing rule
                response = await ChatbotService.updateRule(editingRule.id, newRule);
                setRules(rules.map(rule =>
                    rule.id === editingRule.id ? response.data.data : rule
                ));
                toast.success('Rule updated successfully');
            } else {
                // Create new rule
                response = await ChatbotService.createRule(newRule);
                setRules([...rules, response.data.data]);
                toast.success('Rule created successfully');
            }

            setShowForm(false);
            setEditingRule(null);
            setNewRule({
                name: '',
                keywords: '',
                response: '',
                priority: 0,
                forwardToHuman: false
            });
        } catch (error) {
            console.error('Error saving rule:', error);
            toast.error(error.response?.data?.Error || 'Failed to save rule');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingRule(null);
        setNewRule({
            name: '',
            keywords: '',
            response: '',
            priority: 0,
            forwardToHuman: false
        });
    };

    const handlePriorityChange = async (rule, increase) => {
        const newPriority = increase ? rule.priority + 1 : rule.priority - 1;
        if (newPriority < 0) return;

        try {
            const updatedRule = { ...rule, priority: newPriority };
            await ChatbotService.updateRule(rule.id, updatedRule);

            // Update the local state
            setRules(rules.map(r =>
                r.id === rule.id ? { ...r, priority: newPriority } : r
            ).sort((a, b) => b.priority - a.priority));

            toast.success('Priority updated');
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error('Failed to update priority');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Chatbot Rules</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowOnlyActive(!showOnlyActive)}
                        className={`btn btn-outline flex items-center ${showOnlyActive ? 'bg-primary-50' : ''}`}
                    >
                        <FiFilter className="mr-2" /> {showOnlyActive ? 'Show All Rules' : 'Show Active Only'}
                    </button>
                    <button
                        onClick={fetchRules}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                    <button
                        onClick={handleAddNewClick}
                        className="btn btn-primary flex items-center"
                    >
                        <FiPlus className="mr-2" /> Add Rule
                    </button>
                </div>
            </div>

            {/* Rule Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {editingRule ? 'Edit Rule' : 'Create New Rule'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Rule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newRule.name}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., Greeting Response"
                                />
                            </div>

                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                                    Keywords (comma separated) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="keywords"
                                    name="keywords"
                                    value={newRule.keywords}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., hello, hi, hey, greetings"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The rule will trigger if any of these keywords are found in the customer message.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                                    Response <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="response"
                                    name="response"
                                    value={newRule.response}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="input"
                                    placeholder="e.g., Hello! Thank you for contacting us. How can we help you today?"
                                ></textarea>
                                <p className="mt-1 text-xs text-gray-500">
                                    You can use {'{CustomerName}'}, {'{InvoiceNumber}'}, etc. as placeholders that will be filled with customer information.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        id="priority"
                                        name="priority"
                                        value={newRule.priority}
                                        onChange={handleNumberChange}
                                        min="0"
                                        className="input"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Higher priority rules are checked first (0 is lowest priority).
                                    </p>
                                </div>

                                <div className="flex items-center h-full pt-6">
                                    <input
                                        type="checkbox"
                                        id="forwardToHuman"
                                        name="forwardToHuman"
                                        checked={newRule.forwardToHuman}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="forwardToHuman" className="ml-2 block text-sm text-gray-700">
                                        Forward to human after response
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {editingRule ? 'Update Rule' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No chatbot rules found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {showOnlyActive
                                ? 'There are no active rules. Try showing all rules or create a new one.'
                                : 'Get started by creating your first chatbot rule.'}
                        </p>
                        <button
                            onClick={handleAddNewClick}
                            className="mt-4 btn btn-primary"
                        >
                            <FiPlus className="mr-2" /> Add Rule
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rule Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Keywords
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Response
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Forward to Human
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
                                {rules.map((rule) => (
                                    <tr key={rule.id} className={rule.isActive ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {rule.keywords.split(',').map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {keyword.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {rule.response}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-900">{rule.priority}</span>
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => handlePriorityChange(rule, true)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <FiArrowUp className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePriorityChange(rule, false)}
                                                        disabled={rule.priority <= 0}
                                                        className={`text-gray-400 hover:text-gray-600 ${rule.priority <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                    >
                                                        <FiArrowDown className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.forwardToHuman
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {rule.forwardToHuman ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleRule(rule.id, rule.isActive)}
                                                className={`flex items-center ${rule.isActive
                                                        ? 'text-green-600 hover:text-green-900'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                {rule.isActive ? (
                                                    <>
                                                        <FiToggleRight className="h-6 w-6 mr-1" />
                                                        <span className="text-sm">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiToggleLeft className="h-6 w-6 mr-1" />
                                                        <span className="text-sm">Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleEditClick(rule)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <FiEdit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(rule)}
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
                                            Delete Rule
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the rule "{ruleToDelete?.name}"?
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
                                        setRuleToDelete(null);
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



export default ChatbotRulesPage;