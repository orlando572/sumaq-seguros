import axiosInstance from '../../config/axiosConfig';

const API_URL = "/perfil";

const PerfilService = {
    // Obtener perfil del usuario
    obtenerPerfil(idUsuario) {
        return axiosInstance.get(`${API_URL}/${idUsuario}`);
    },

    // Actualizar perfil completo
    actualizarPerfil(idUsuario, perfil) {
        return axiosInstance.put(`${API_URL}/${idUsuario}`, perfil);
    },

    // Actualizar solo foto de perfil
    actualizarFotoPerfil(idUsuario, fotoPerfil) {
        return axiosInstance.patch(`${API_URL}/${idUsuario}/foto`, { fotoPerfil });
    },

    // Validar DNI único
    validarDni(dni, idUsuarioActual) {
        return axiosInstance.get(`${API_URL}/validar-dni`, {
            params: { dni, idUsuarioActual }
        });
    },

    // Validar correo único
    validarCorreo(correo, idUsuarioActual) {
        return axiosInstance.get(`${API_URL}/validar-correo`, {
            params: { correo, idUsuarioActual }
        });
    }
};

export default PerfilService;