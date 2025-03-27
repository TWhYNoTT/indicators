// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Check if roles are specified and user has the required role
    if (roles && roles.length > 0) {
        const hasRequiredRole = roles.some(role =>
            currentUser.role === role ||
            (Array.isArray(currentUser.role) && currentUser.role.includes(role))
        );

        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" />;
        }
    }

    // If authenticated and has the required role, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;