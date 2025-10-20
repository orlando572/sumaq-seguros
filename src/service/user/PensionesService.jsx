import axios from 'axios';

const API_URL = "http://localhost:8090/api/pensiones";

const PensionesService = {
    obtenerResumen(idUsuario) {
        return axios.get(`${API_URL}/resumen/${idUsuario}`);
    },

    obtenerAportes(idUsuario) {
        return axios.get(`${API_URL}/aportes/${idUsuario}`);
    },

    obtenerSaldos(idUsuario) {
        return axios.get(`${API_URL}/saldos/${idUsuario}`);
    },

    obtenerEstado(idUsuario) {
        return axios.get(`${API_URL}/estado/${idUsuario}`);
    },

    crearAporte(aporte) {
        return axios.post(`${API_URL}/aportes`, aporte);
    },

    actualizarAporte(idAporte, aporte) {
        return axios.put(`${API_URL}/aportes/${idAporte}`, aporte);
    },

    eliminarAporte(idAporte) {
        return axios.delete(`${API_URL}/aportes/${idAporte}`);
    }
};

export default PensionesService;
