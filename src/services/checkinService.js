import apiClient from './apiClient';

const checkinService = {
    /**
     * Get all check-ins
     * @returns {Promise<Array>}
     */
    async getCheckIns() {
        const response = await apiClient.get('/api/checkins');
        return response.data;
    },

    /**
     * Get check-in by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getCheckInById(id) {
        const response = await apiClient.get(`/api/checkins/${id}`);
        return response.data;
    },

    /**
     * Create new check-in
     * @param {Object} checkInData 
     * @returns {Promise<Object>}
     */
    async createCheckIn(checkInData) {
        const response = await apiClient.post('/api/checkins', checkInData);
        return response.data;
    },

    /**
     * Verify user and get membership info (for check-in screen)
     * Now supports both cedula and ID
     * @param {string|number} searchTerm - cedula or user ID
     * @returns {Promise<Object>}
     */
    async verifyUser(searchTerm) {
        let user;

        try {
            // Try searching by cedula first
            const userResponse = await apiClient.get(`/api/usuarios/cedula/${searchTerm}`);
            user = userResponse.data;
        } catch (error) {
            // If cedula search fails, try by ID (for backward compatibility)
            if (error.response?.status === 404) {
                try {
                    const userResponse = await apiClient.get(`/api/usuarios/${searchTerm}`);
                    user = userResponse.data;
                } catch (idError) {
                    throw new Error('Usuario no encontrado. Verifica el número de cédula o ID.');
                }
            } else {
                throw error;
            }
        }

        // Get user's active memberships
        const membresiasResponse = await apiClient.get('/api/membresias');
        const allMembresias = membresiasResponse.data;

        // Filter memberships for this user
        const userMembresias = allMembresias.filter(m => m.clienteId === user.id);

        // Find active membership
        const activeMembership = userMembresias.find(m => m.estado === 'ACTIVA');

        return {
            user,
            membership: activeMembership || null,
            hasActiveMembership: !!activeMembership,
        };
    },
};

export default checkinService;
