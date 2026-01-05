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
};

export default membresiaService;
