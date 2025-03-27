// src/pages/contacts/ImportContactsPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContactService } from '../../api/contactService';
import { toast } from 'react-hot-toast';
import { FiDownload, FiArrowLeft, FiDatabase, FiCheck, FiAlertCircle } from 'react-icons/fi';

const ImportContactsPage = () => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleImport = async () => {
        setImporting(true);
        try {
            const response = await ContactService.importFromInvoices();
            setImportResult({
                success: true,
                count: response.data.importedCount,
                message: response.data.message
            });
            toast.success(`Successfully imported ${response.data.importedCount} contacts`);
        } catch (error) {
            console.error('Error importing contacts:', error);
            setImportResult({
                success: false,
                message: error.response?.data?.Error || 'Failed to import contacts'
            });
            toast.error('Failed to import contacts');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>
                <Link
                    to="/contacts"
                    className="btn btn-outline flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Back to Contacts
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Import from Invoices</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                This will import customer contacts from your invoices. Only customers with valid phone numbers will be imported.
                                If a contact already exists with the same phone number, it will be skipped.
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className={`btn btn-primary flex items-center ${importing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {importing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Importing...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FiDatabase className="mr-2" /> Start Import
                                    </span>
                                )}
                            </button>
                        </div>

                        {importResult && (
                            <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {importResult.success ? (
                                            <FiCheck className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <FiAlertCircle className="h-5 w-5 text-red-400" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {importResult.success ? 'Import successful' : 'Import failed'}
                                        </h3>
                                        <div className={`mt-2 text-sm ${importResult.success ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            <p>{importResult.message}</p>
                                            {importResult.success && (
                                                <p className="mt-1">
                                                    <strong>{importResult.count}</strong> contacts were imported.
                                                </p>
                                            )}
                                        </div>
                                        {importResult.success && (
                                            <div className="mt-4">
                                                <Link
                                                    to="/contacts"
                                                    ImportContactsPage className="text-sm font-medium text-green-600 hover:text-green-500"
                                                >
                                                    View Contacts
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default ImportContactsPage;