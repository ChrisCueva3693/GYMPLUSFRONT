import apiClient from './apiClient';

const authService = {
    /**
     * Login user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>} User data and token
     */
    async login(username, password) {
        // 1. Initial Login Request
        const response = await apiClient.post('/auth/login', {
            username,
            password,
        });

        const { token, ...initialUserData } = response.data;

        if (token) {
            // 2. Store token temporarily to allow authenticated requests
            localStorage.setItem('token', token);

            try {
                // 3. Fetch full user profile to get Gym/Branch info
                const userMsg = await apiClient.get(`/api/usuarios/${initialUserData.userId}`);
                const fullProfile = userMsg.data;

                // 4. Merge and Map fields to match expected structure
                const mergedUserData = {
                    ...initialUserData,
                    idGimnasio: fullProfile.idGimnasio, // match expectation if any
                    gimnasioId: fullProfile.idGimnasio, // keep for safety
                    idSucursalPorDefecto: fullProfile.idSucursalPorDefecto, // match Usuarios.jsx expectation
                    sucursalId: fullProfile.idSucursalPorDefecto, // keep for safety
                };

                // 5. Store complete user data
                localStorage.setItem('user', JSON.stringify(mergedUserData));

                // Return merged data so the caller gets the full context immediately
                return { token, ...mergedUserData };

            } catch (error) {
                console.error("Error fetching full user profile:", error);
                // Fallback: store what we have from login response
                localStorage.setItem('user', JSON.stringify(initialUserData));
                return response.data;
            }
        }

        return response.data;
    },

    /**
     * Register new user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    async register(userData) {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get token from localStorage
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    },
};

export default authService;
