import apiClient from './apiClient';

const ventaService = {
    /**
     * Get all sales
     * @returns {Promise<Array>}
     */
    async getVentas() {
        const response = await apiClient.get('/api/ventas');
        return response.data;
    },

    /**
     * Get sale by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getVentaById(id) {
        const response = await apiClient.get(`/api/ventas/${id}`);
        return response.data;
    },

    /**
     * Create new sale
     * @param {Object} ventaData 
     * @returns {Promise<Object>}
     */
    async createVenta(ventaData) {
        const response = await apiClient.post('/api/ventas', ventaData);
        return response.data;
    },

    /**
     * Update sale
     * @param {number} id 
     * @param {Object} ventaData 
     * @returns {Promise<Object>}
     */
    async updateVenta(id, ventaData) {
        const response = await apiClient.put(`/api/ventas/${id}`, ventaData);
        return response.data;
    },

    /**
     * Delete sale
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteVenta(id) {
        await apiClient.delete(`/api/ventas/${id}`);
    },
};

export default ventaService;
