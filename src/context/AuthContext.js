// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../api/authService';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            setLoading(true);
            const authenticated = AuthService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                setCurrentUser(AuthService.getCurrentUser());
            } else {
                setCurrentUser(null);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await AuthService.login({ email, password });
            setCurrentUser(AuthService.getCurrentUser());
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            return await AuthService.register(userData);
        } catch (error) {
            throw error;
        }
    };

    const initialize = async (userData) => {
        try {
            return await AuthService.initialize(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    const hasRole = (role) => {
        if (!currentUser) return false;

        return currentUser.role === role ||
            (Array.isArray(currentUser.role) && currentUser.role.includes(role));
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        initialize,
        logout,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};