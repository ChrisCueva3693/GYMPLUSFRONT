import apiClient from './apiClient';

const userService = {
    /**
     * Get all users
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        const response = await apiClient.get('/api/usuarios');
        return response.data;
    },

    /**
     * Get user by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getUserById(id) {
        const response = await apiClient.get(`/api/usuarios/${id}`);
        return response.data;
    },

    /**
     * Create new user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    async createUser(userData) {
        const response = await apiClient.post('/api/usuarios', userData);
        return response.data;
    },

    /**
     * Update user
     * @param {number} id 
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    async updateUser(id, userData) {
        const response = await apiClient.put(`/api/usuarios/${id}`, userData);
        return response.data;
    },

    /**
     * Delete user
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        await apiClient.delete(`/api/usuarios/${id}`);
    },
};

export default userService;
