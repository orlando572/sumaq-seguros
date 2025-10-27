import axios from 'axios';

const API_URL = 'http://localhost:8090/api/usuario';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const authService = {
    // Login
    login: async (dni, claveSol) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                dni,
                claveSol
            });

            if (response.data.token) {
                // Guardar token y usuario en localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.usuario));
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || { mensaje: 'Error al iniciar sesión' };
        }
    },

    // Registro
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/registrarUsuario`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { mensaje: 'Error al registrar usuario' };
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Obtener usuario actual
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Obtener token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Verificar si está autenticado
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Verificar si es admin
    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user?.rol?.idRol === 1;
    }
};

export default authService;
export { api };
