// src/pages/auth/InitializePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AuthService from '../api/authService';

const InitializePage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();
    const { initialize } = useAuth();

    // Check if system is already initialized
    useEffect(() => {
        const checkInitialized = async () => {
            try {
                // Try to login with dummy credentials to check if any users exist
                await AuthService.login({ email: 'test@example.com', password: 'test123' });
                // If login succeeds or fails with 401, system is initialized
                navigate('/login');
            } catch (error) {
                // If error is "System is already initialized", redirect to login
                if (error.response?.status !== 400 ||
                    error.response?.data?.Error !== "System is already initialized") {
                    // Otherwise, allow initialization
                    setChecking(false);
                } else {
                    navigate('/login');
                }
            }
        };

        checkInitialized();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            await initialize({ email, password, branch: parseInt(branch) });
            toast.success('System initialized successfully');
            navigate('/login');
        } catch (error) {
            console.error('Initialization error:', error);
            toast.error(error.response?.data?.Error || 'Failed to initialize system');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Initialize System
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create the initial SuperAdmin user
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                                Branch
                            </label>
                            <select
                                id="branch"
                                name="branch"
                                required
                                className="input"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                            >
                                <option value="1">Royal</option>
                                <option value="2">Grnata</option>
                                <option value="3">Aswak</option>
                                <option value="4">Factory</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Initializing...
                                </span>
                            ) : (
                                'Initialize System'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitializePage;