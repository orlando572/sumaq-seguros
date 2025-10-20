import axios from 'axios';

const API_URL = "http://localhost:8090/api/financiero";

const FinancieroService = {
    obtenerResumen(idUsuario) {
        return axios.get(`${API_URL}/resumen/${idUsuario}`);
    },

    obtenerAportes(idUsuario) {
        return axios.get(`${API_URL}/aportes/${idUsuario}`);
    },

    obtenerSaldos(idUsuario) {
        return axios.get(`${API_URL}/saldos/${idUsuario}`);
    },

    obtenerEstadisticas(idUsuario) {
        return axios.get(`${API_URL}/estadisticas/${idUsuario}`);
    },

    obtenerComparativo(idUsuario) {
        return axios.get(`${API_URL}/comparativo/${idUsuario}`);
    }
};

export default FinancieroService;
