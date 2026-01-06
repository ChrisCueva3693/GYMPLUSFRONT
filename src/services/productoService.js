import apiClient from './apiClient';

const API_ENDPOINT = '/api/productos';

const getAll = async () => {
    const response = await apiClient.get(API_ENDPOINT);
    return response.data;
};

const create = async (producto) => {
    const response = await apiClient.post(API_ENDPOINT, producto);
    return response.data;
};

const update = async (id, producto) => {
    const response = await apiClient.put(`${API_ENDPOINT}/${id}`, producto);
    return response.data;
};

const remove = async (id) => {
    await apiClient.delete(`${API_ENDPOINT}/${id}`);
};

export default {
    getAll,
    create,
    update,
    remove
};
