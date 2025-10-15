
import axios from 'axios';

const API_URL = "http://localhost:8090/api/usuario";

const UsuarioService = {
    // busca usuario por DNI y claveSol)
    login(dni, claveSol) {
        return axios.post(`${API_URL}/login`, { dni, claveSol });
    },

    // Registrar usuario
    registrarUsuario(usuario) {
        return axios.post(`${API_URL}/registrarUsuario`, usuario);
    },

    // Obtener usuario por ID
    obtenerUsuarioPorId(id) {
        return axios.get(`${API_URL}/buscarPorId/${id}`);
    }
};

export default UsuarioService;