// src/pages/contacts/ContactsListPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ContactService } from '../../api/contactService';
import { toast } from 'react-hot-toast';
// src/pages/contacts/ContactsListPage.js
import {
    FiUser,
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiMessageSquare,
    FiFilter,
    FiCheck,
    FiX,
    FiTag,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiAlertCircle  // Add this missing import
} from 'react-icons/fi';

const ContactsListPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [optedInFilter, setOptedInFilter] = useState(null);
    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 0
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);

    useEffect(() => {
        fetchContacts();
        fetchTags();
    }, [pagination.currentPage, pagination.pageSize, selectedTag, optedInFilter]);

    useEffect(() => {
        if (searchTerm) {
            const delaySearch = setTimeout(() => {
                fetchContacts();
            }, 500);

            return () => clearTimeout(delaySearch);
        }
    }, [searchTerm]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await ContactService.getContacts(
                pagination.currentPage,
                pagination.pageSize,
                searchTerm,
                selectedTag,
                optedInFilter
            );

            setContacts(response.data.data || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 1,
                totalCount: response.data.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await ContactService.getTags();
            setTags(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleDeleteClick = (contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await ContactService.deleteContact(contactToDelete.id);
            setContacts(contacts.filter(c => c.id !== contactToDelete.id));
            toast.success('Contact deleted successfully');
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        } finally {
            setShowDeleteModal(false);
            setContactToDelete(null);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag === selectedTag ? '' : tag);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handleOptedInFilter = (value) => {
        setOptedInFilter(value);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedTag('');
        setOptedInFilter(null);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const FilterButton = ({ active, children, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-md text-sm ${active
                ? 'bg-primary-100 text-primary-800 border border-primary-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <Link
                    to="/contacts/new"
                    className="btn btn-primary flex items-center"
                >
                    <FiPlus className="mr-2" /> New Contact
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search contacts by name, phone or email..."
                            className="input pl-10"
                        />
                    </div>

                    <button
                        onClick={fetchContacts}
                        className="btn btn-outline flex items-center"
                    >
                        <FiRefreshCw className="mr-2" /> Refresh
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                        <div className="flex flex-wrap gap-2">
                            {tags.length > 0 ? (
                                tags.map(tag => (
                                    <FilterButton
                                        key={tag}
                                        active={selectedTag === tag}
                                        onClick={() => handleTagSelect(tag)}
                                    >
                                        <div className="flex items-center">
                                            <FiTag className="mr-1 h-3 w-3" />
                                            {tag}
                                        </div>
                                    </FilterButton>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No tags available</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Opt-in Status:</span>
                    <FilterButton
                        active={optedInFilter === true}
                        onClick={() => handleOptedInFilter(optedInFilter === true ? null : true)}
                    >
                        <div className="flex items-center">
                            <FiCheck className="mr-1 h-3 w-3" />
                            Opted In
                        </div>
                    </FilterButton>
                    <FilterButton
                        active={optedInFilter === false}
                        onClick={() => handleOptedInFilter(optedInFilter === false ? null : false)}
                    >
                        <div className="flex items-center">
                            <FiX className="mr-1 h-3 w-3" />
                            Not Opted In
                        </div>
                    </FilterButton>

                    {(searchTerm || selectedTag || optedInFilter !== null) && (
                        <button
                            onClick={resetFilters}
                            className="ml-auto text-sm text-primary-600 hover:text-primary-900"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Contacts List */}
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
                ) : contacts.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No contacts found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedTag || optedInFilter !== null
                                ? 'Try adjusting your search or filters'
                                : 'Get started by adding a new contact'}
                        </p>
                        {searchTerm || selectedTag || optedInFilter !== null ? (
                            <button
                                onClick={resetFilters}
                                className="mt-4 btn btn-outline"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <Link
                                to="/contacts/new"
                                className="mt-4 btn btn-primary"
                            >
                                <FiPlus className="mr-2" /> New Contact
                            </Link>
                        )}
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
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tags
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Opt-in Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                                    <FiUser className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {contact.name || 'No Name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contact.email || 'No Email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{contact.phoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.tags ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.split(',').map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                                                        >
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">No tags</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.hasOptedIn
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {contact.hasOptedIn ? 'Opted In' : 'Not Opted In'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {contact.lastContactDate
                                                ? new Date(contact.lastContactDate).toLocaleDateString()
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <Link
                                                    to={`/contacts/edit/${contact.id}`}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <FiEdit2 className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    to={`/conversations/chat/${contact.phoneNumber}`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <FiMessageSquare className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(contact)}
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

                {/* Pagination */}
                {!loading && contacts.length > 0 && (
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
                                            Delete Contact
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete{' '}
                                                <span className="font-medium">{contactToDelete?.name || contactToDelete?.phoneNumber}</span>?
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
                                        setContactToDelete(null);
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





export default ContactsListPage;