import axiosInstance from '../../config/axiosConfig';

const API_URL = "/pensiones";

const PensionesService = {
    obtenerResumen(idUsuario) {
        return axiosInstance.get(`${API_URL}/resumen/${idUsuario}`);
    },

    obtenerAportes(idUsuario) {
        return axiosInstance.get(`${API_URL}/aportes/${idUsuario}`);
    },

    obtenerSaldos(idUsuario) {
        return axiosInstance.get(`${API_URL}/saldos/${idUsuario}`);
    },

    obtenerEstado(idUsuario) {
        return axiosInstance.get(`${API_URL}/estado/${idUsuario}`);
    },

    crearAporte(aporte) {
        return axiosInstance.post(`${API_URL}/aportes`, aporte);
    },

    actualizarAporte(idAporte, aporte) {
        return axiosInstance.put(`${API_URL}/aportes/${idAporte}`, aporte);
    },

    eliminarAporte(idAporte) {
        return axiosInstance.delete(`${API_URL}/aportes/${idAporte}`);
    }
};

export default PensionesService;
