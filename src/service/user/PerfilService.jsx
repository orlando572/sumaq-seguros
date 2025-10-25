import axios from 'axios';

const API_URL = "http://localhost:8090/api/perfil";

const PerfilService = {
    // Obtener perfil del usuario
    obtenerPerfil(idUsuario) {
        return axios.get(`${API_URL}/${idUsuario}`);
    },

    // Actualizar perfil completo
    actualizarPerfil(idUsuario, perfil) {
        return axios.put(`${API_URL}/${idUsuario}`, perfil);
    },

    // Actualizar solo foto de perfil
    actualizarFotoPerfil(idUsuario, fotoPerfil) {
        return axios.patch(`${API_URL}/${idUsuario}/foto`, { fotoPerfil });
    },

    // Validar DNI único
    validarDni(dni, idUsuarioActual) {
        return axios.get(`${API_URL}/validar-dni`, {
            params: { dni, idUsuarioActual }
        });
    },

    // Validar correo único
    validarCorreo(correo, idUsuarioActual) {
        return axios.get(`${API_URL}/validar-correo`, {
            params: { correo, idUsuarioActual }
        });
    }
};

export default PerfilService;