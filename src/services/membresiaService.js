import apiClient from './apiClient';

const membresiaService = {
    getMembresias: async () => {
        const response = await apiClient.get('/api/membresias');
        return response.data;
    },

    getMembresiaById: async (id) => {
        const response = await apiClient.get(`/api/membresias/${id}`);
        return response.data;
    },

    createMembresia: async (membresiaData) => {
        const response = await apiClient.post('/api/membresias', membresiaData);
        return response.data;
    },

    updateMembresia: async (id, membresiaData) => {
        const response = await apiClient.put(`/api/membresias/${id}`, membresiaData);
        return response.data;
    },

    deleteMembresia: async (id) => {
        const response = await apiClient.delete(`/api/membresias/${id}`);
        return response.data;
    },

    registrarAbono: async (membresiaId, abonoData) => {
        const response = await apiClient.post(`/api/membresias/${membresiaId}/abono`, abonoData);
        return response.data;
    },
};

export default membresiaService;
