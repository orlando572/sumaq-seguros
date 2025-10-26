import axios from 'axios';

const API_URL = "http://localhost:8090/api/dashboard";

const DashboardService = {
    // Obtener resumen completo del dashboard
    obtenerResumenCompleto(idUsuario) {
        return axios.get(`${API_URL}/resumen/${idUsuario}`);
    },

    // Obtener perfil del usuario
    obtenerPerfilUsuario(idUsuario) {
        return axios.get(`${API_URL}/perfil/${idUsuario}`);
    },

    // Obtener alertas activas
    obtenerAlertas(idUsuario) {
        return axios.get(`${API_URL}/alertas/${idUsuario}`);
    },

    // Obtener actividad reciente
    obtenerActividadReciente(idUsuario, limite = 5) {
        return axios.get(`${API_URL}/actividad/${idUsuario}?limite=${limite}`);
    },

    // Obtener estadísticas financieras
    obtenerEstadisticasFinancieras(idUsuario) {
        return axios.get(`${API_URL}/estadisticas/${idUsuario}`);
    }
};

export default DashboardService;