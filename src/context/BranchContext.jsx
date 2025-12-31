import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadBranches();
            // Initialize selected branch from user's default or local storage
            const stored = localStorage.getItem('selectedBranchId');
            if (stored) {
                setSelectedBranchId(Number(stored));
            } else if (user.idSucursalPorDefecto) {
                setSelectedBranchId(user.idSucursalPorDefecto);
            }
        }
    }, [user]);

    const loadBranches = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let response;
            if (user.roles.includes('DEV')) {
                response = await apiClient.get('/api/sucursales');
            } else {
                // For ADMIN, we check if we have an endpoint for "my branches" or filter client side
                // Currently Sucursales page filters client side. 
                // We really should implemented an endpoint like /api/usuarios/me/branches but for now let's reuse logic.
                response = await apiClient.get('/api/sucursales');
            }

            let userBranches = response.data;
            if (!user.roles.includes('DEV') && user.idGimnasio) {
                userBranches = userBranches.filter(b => b.idGimnasio === user.idGimnasio);
            }
            setBranches(userBranches);
        } catch (error) {
            console.error('Error loading branches', error);
        } finally {
            setLoading(false);
        }
    };

    const switchBranch = (branchId) => {
        setSelectedBranchId(Number(branchId));
        localStorage.setItem('selectedBranchId', branchId);
        toast.success('Sucursal cambiada');
        // Here we could trigger a reload or refetch of data if needed
        window.location.reload(); // Simple brute force update for now
    };

    const selectedBranch = branches.find(b => b.id === selectedBranchId);

    return (
        <BranchContext.Provider value={{
            branches,
            selectedBranchId,
            selectedBranch,
            switchBranch,
            loading
        }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
