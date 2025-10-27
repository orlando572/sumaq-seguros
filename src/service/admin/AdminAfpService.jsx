import axiosInstance from '../../config/axiosConfig';

const API_URL = "/admin/afps";

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
        
        return axiosInstance.get(url);
    },

    // Obtener AFP por ID
    obtenerAfpPorId(id) {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    // Crear AFP
    crearAfp(afp) {
        return axiosInstance.post(API_URL, afp);
    },

    // Actualizar AFP
    actualizarAfp(id, afp) {
        return axiosInstance.put(`${API_URL}/${id}`, afp);
    },

    // Eliminar AFP
    eliminarAfp(id) {
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

export default AdminAfpService;