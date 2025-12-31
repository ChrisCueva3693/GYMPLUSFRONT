import apiClient from './apiClient';

const membresiaService = {
    /**
     * Get all memberships
     * @returns {Promise<Array>}
     */
    async getMembresias() {
        const response = await apiClient.get('/api/membresias');
        return response.data;
    },

    /**
     * Get membership by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getMembresiaById(id) {
        const response = await apiClient.get(`/api/membresias/${id}`);
        return response.data;
    },

    /**
     * Create new membership
     * @param {Object} membresiaData 
     * @returns {Promise<Object>}
     */
    async createMembresia(membresiaData) {
        const response = await apiClient.post('/api/membresias', membresiaData);
        return response.data;
    },

    /**
     * Update membership
     * @param {number} id 
     * @param {Object} membresiaData 
     * @returns {Promise<Object>}
     */
    async updateMembresia(id, membresiaData) {
        const response = await apiClient.put(`/api/membresias/${id}`, membresiaData);
        return response.data;
    },

    /**
     * Delete membership
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteMembresia(id) {
        await apiClient.delete(`/api/membresias/${id}`);
    },
};

export default membresiaService;
