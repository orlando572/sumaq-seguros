import axiosInstance from '../../config/axiosConfig';

const API_URL = "/financiero";

const FinancieroService = {
    obtenerResumen(idUsuario) {
        return axiosInstance.get(`${API_URL}/resumen/${idUsuario}`);
    },

    obtenerAportes(idUsuario) {
        return axiosInstance.get(`${API_URL}/aportes/${idUsuario}`);
    },

    obtenerSaldos(idUsuario) {
        return axiosInstance.get(`${API_URL}/saldos/${idUsuario}`);
    },

    obtenerEstadisticas(idUsuario) {
        return axiosInstance.get(`${API_URL}/estadisticas/${idUsuario}`);
    },

    obtenerComparativo(idUsuario) {
        return axiosInstance.get(`${API_URL}/comparativo/${idUsuario}`);
    }
};

export default FinancieroService;
