import axiosInstance from '../../config/axiosConfig';

const API_URL = "/admin/usuarios";

const AdminUsuarioService = {
    // Listar todos los usuarios
    listarUsuarios(busqueda = null, estado = null) {
        let url = API_URL;
        const params = [];
        
        if (busqueda) params.push(`busqueda=${busqueda}`);
        if (estado) params.push(`estado=${estado}`);
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        return axiosInstance.get(url);
    },

    // Obtener usuario por ID
    obtenerUsuarioPorId(id) {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    // Crear usuario
    crearUsuario(usuario) {
        return axiosInstance.post(API_URL, usuario);
    },

    // Actualizar usuario
    actualizarUsuario(id, usuario) {
        return axiosInstance.put(`${API_URL}/${id}`, usuario);
    },

    // Eliminar usuario
    eliminarUsuario(id) {
        return axiosInstance.delete(`${API_URL}/${id}`);
    },

    // Cambiar estado
    cambiarEstado(id, estado) {
        return axiosInstance.patch(`${API_URL}/${id}/estado`, { estado });
    },

    // Obtener estadísticas
    obtenerEstadisticas() {
        return axiosInstance.get(`${API_URL}/estadisticas`);
    }
};

export default AdminUsuarioService;