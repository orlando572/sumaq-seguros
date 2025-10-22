import axios from 'axios';

const API_URL = "http://localhost:8090/api/admin/usuarios";

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
        
        return axios.get(url);
    },

    // Obtener usuario por ID
    obtenerUsuarioPorId(id) {
        return axios.get(`${API_URL}/${id}`);
    },

    // Crear usuario
    crearUsuario(usuario) {
        return axios.post(API_URL, usuario);
    },

    // Actualizar usuario
    actualizarUsuario(id, usuario) {
        return axios.put(`${API_URL}/${id}`, usuario);
    },

    // Eliminar usuario
    eliminarUsuario(id) {
        return axios.delete(`${API_URL}/${id}`);
    },

    // Cambiar estado
    cambiarEstado(id, estado) {
        return axios.patch(`${API_URL}/${id}/estado`, { estado });
    },

    // Obtener estadísticas
    obtenerEstadisticas() {
        return axios.get(`${API_URL}/estadisticas`);
    }
};

export default AdminUsuarioService;