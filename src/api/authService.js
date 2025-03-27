// src/api/authService.js
import apiClient from './axios';
import { jwtDecode as jwt_decode } from 'jwt-decode';

const AuthService = {
    login: async (credentials) => {
        const response = await apiClient.post('/Auth/login', credentials);
        console.log(response.data.Token);
        if (response.data.Token) {
            localStorage.setItem('token', response.data.Token);

            // Decode the token to get user info
            const decodedToken = jwt_decode(response.data.Token);
            console.log(decodedToken);
            const user = {
                id: decodedToken.nameid,
                email: decodedToken.unique_name,
                role: "SuperAdmin",
                branch: 0
            };

            localStorage.setItem('user', JSON.stringify(user));
        }

        return response.data;
    },

    register: async (userData) => {
        return await apiClient.post('/Auth/register', userData);
    },

    initialize: async (userData) => {
        return await apiClient.post('/Auth/initialize', userData);
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decodedToken = jwt_decode(token);
            const currentTime = Date.now() / 1000;

            // Check if token is expired
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return false;
            }

            return true;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    },

    hasRole: (role) => {
        const user = AuthService.getCurrentUser();
        if (!user) return false;

        return user.role === role ||
            (Array.isArray(user.role) && user.role.includes(role));
    }
};

export default AuthService;