import axiosInstance from '../../config/axiosConfig';

const API_URL = "/admin/aportes";

const AdminAporteService = {
    // Listar todos los aportes
    listarAportes(idUsuario = null, estado = null, year = null) {
        let url = API_URL;
        const params = [];
        
        if (idUsuario) params.push(`idUsuario=${idUsuario}`);
        if (estado) params.push(`estado=${estado}`);
        if (year) params.push(`year=${year}`);
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        return axiosInstance.get(url);
    },

    // Obtener aporte por ID
    obtenerAportePorId(id) {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    // Obtener aportes por usuario
    obtenerAportesPorUsuario(idUsuario) {
        return axiosInstance.get(`${API_URL}/usuario/${idUsuario}`);
    },

    // Crear aporte
    crearAporte(aporte) {
        return axiosInstance.post(API_URL, aporte);
    },

    // Actualizar aporte
    actualizarAporte(id, aporte) {
        return axiosInstance.put(`${API_URL}/${id}`, aporte);
    },

    // Eliminar aporte
    eliminarAporte(id) {
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

export default AdminAporteService;
