import axiosInstance from '../../config/axiosConfig';

const API_URL = "/usuario";

const UsuarioService = {
    // Login (busca usuario por DNI y claveSol)
    login(dni, claveSol) {
        return axiosInstance.post(`${API_URL}/login`, { dni, claveSol });
    },

    // Registrar usuario
    registrarUsuario(usuario) {
        return axiosInstance.post(`${API_URL}/registrarUsuario`, usuario);
    },

    // Obtener usuario por ID
    obtenerUsuarioPorId(id) {
        return axiosInstance.get(`${API_URL}/buscarPorId/${id}`);
    },

    // Listar roles
    listarRoles() {
        return axiosInstance.get(`${API_URL}/roles`);
    },

    // Listar AFPs
    listarAfps() {
        return axiosInstance.get(`${API_URL}/afps`);
    }
};

export default UsuarioService;