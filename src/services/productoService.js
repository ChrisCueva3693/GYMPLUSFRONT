import axios from 'axios';

const API_URL = 'http://localhost:8080/api/productos';

// Configurar interceptor para incluir el token en las peticiones
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const create = async (producto) => {
    const response = await axios.post(API_URL, producto);
    return response.data;
};

const update = async (id, producto) => {
    const response = await axios.put(`${API_URL}/${id}`, producto);
    return response.data;
};

const remove = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export default {
    getAll,
    create,
    update,
    remove
};
