import apiClient from './apiClient';

const ventaService = {
    async getVentas() {
        const response = await apiClient.get('/api/ventas');
        return response.data;
    },

    async getVentaById(id) {
        const response = await apiClient.get(`/api/ventas/${id}`);
        return response.data;
    },

    async createVenta(ventaData) {
        const response = await apiClient.post('/api/ventas', ventaData);
        return response.data;
    },

    async registrarAbono(ventaId, abonoData) {
        const response = await apiClient.post(`/api/ventas/${ventaId}/abono`, abonoData);
        return response.data;
    },
};

export default ventaService;
