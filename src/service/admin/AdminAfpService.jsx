import axios from 'axios';

const API_URL = "http://localhost:8090/api/admin/afps";

const AdminAfpService = {
    // Listar todas las AFPs
    listarAfps(busqueda = null, estado = null) {
        let url = API_URL;
        const params = [];
        
        if (busqueda) params.push(`busqueda=${busqueda}`);
        if (estado) params.push(`estado=${estado}`);
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        return axios.get(url);
    },

    // Obtener AFP por ID
    obtenerAfpPorId(id) {
        return axios.get(`${API_URL}/${id}`);
    },

    // Crear AFP
    crearAfp(afp) {
        return axios.post(API_URL, afp);
    },

    // Actualizar AFP
    actualizarAfp(id, afp) {
        return axios.put(`${API_URL}/${id}`, afp);
    },

    // Eliminar AFP
    eliminarAfp(id) {
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

export default AdminAfpService;