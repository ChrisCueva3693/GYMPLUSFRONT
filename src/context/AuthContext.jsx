import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = () => {
            const currentUser = authService.getCurrentUser();
            const token = authService.getToken();

            if (currentUser && token) {
                setUser(currentUser);
                setIsAuthenticated(true);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        const data = await authService.login(username, password);
        setUser(data);
        setIsAuthenticated(true);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
