import axiosInstance from '../../config/axiosConfig';

const API_URL = "/dashboard";

const DashboardService = {
    // Obtener resumen completo del dashboard
    obtenerResumenCompleto(idUsuario) {
        return axiosInstance.get(`${API_URL}/resumen/${idUsuario}`);
    },

    // Obtener perfil del usuario
    obtenerPerfilUsuario(idUsuario) {
        return axiosInstance.get(`${API_URL}/perfil/${idUsuario}`);
    },

    // Obtener alertas activas
    obtenerAlertas(idUsuario) {
        return axiosInstance.get(`${API_URL}/alertas/${idUsuario}`);
    },

    // Obtener actividad reciente
    obtenerActividadReciente(idUsuario, limite = 5) {
        return axiosInstance.get(`${API_URL}/actividad/${idUsuario}?limite=${limite}`);
    },

    // Obtener estadísticas financieras
    obtenerEstadisticasFinancieras(idUsuario) {
        return axiosInstance.get(`${API_URL}/estadisticas/${idUsuario}`);
    }
};

export default DashboardService;