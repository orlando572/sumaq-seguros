import axios from 'axios';

const API_URL = "http://localhost:8090/api/seguros";

const SegurosService = {
    // RESUMEN ADMINISTRATIVO
    obtenerResumen(idUsuario) {
        return axios.get(`${API_URL}/resumen/${idUsuario}`);
    },

    // GESTIÓN DE PÓLIZAS
    obtenerPolizas(idUsuario) {
        return axios.get(`${API_URL}/polizas/${idUsuario}`);
    },

    obtenerPolizasActivas(idUsuario) {
        return axios.get(`${API_URL}/polizas/${idUsuario}/activos`);
    },

    obtenerPolizaPorId(idSeguro) {
        return axios.get(`${API_URL}/poliza/${idSeguro}`);
    },

    crearPoliza(poliza) {
        return axios.post(`${API_URL}/polizas`, poliza);
    },

    actualizarPoliza(idSeguro, poliza) {
        return axios.put(`${API_URL}/polizas/${idSeguro}`, poliza);
    },

    cancelarPoliza(idSeguro) {
        return axios.delete(`${API_URL}/polizas/${idSeguro}`);
    },

    obtenerProximosVencer(idUsuario, dias = 30) {
        return axios.get(`${API_URL}/polizas/${idUsuario}/proximos-vencer?dias=${dias}`);
    },

    // GESTIÓN DE BENEFICIARIOS
    obtenerBeneficiarios(idSeguro) {
        return axios.get(`${API_URL}/beneficiarios/${idSeguro}`);
    },

    agregarBeneficiario(beneficiario) {
        return axios.post(`${API_URL}/beneficiarios`, beneficiario);
    },

    actualizarBeneficiario(idBeneficiario, beneficiario) {
        return axios.put(`${API_URL}/beneficiarios/${idBeneficiario}`, beneficiario);
    },

    eliminarBeneficiario(idBeneficiario) {
        return axios.delete(`${API_URL}/beneficiarios/${idBeneficiario}`);
    },

    // GESTIÓN DE PAGOS
    obtenerPagos(idSeguro) {
        return axios.get(`${API_URL}/pagos/${idSeguro}`);
    },

    obtenerPagosPendientes(idUsuario) {
        return axios.get(`${API_URL}/pagos/${idUsuario}/pendientes`);
    },

    registrarPago(pago) {
        return axios.post(`${API_URL}/pagos`, pago);
    },

    // GESTIÓN DE TRÁMITES
    obtenerTramites(idUsuario) {
        return axios.get(`${API_URL}/tramites/${idUsuario}`);
    },

    obtenerTramitesPendientes(idUsuario) {
        return axios.get(`${API_URL}/tramites/${idUsuario}/pendientes`);
    },

    crearTramite(tramite) {
        return axios.post(`${API_URL}/tramites`, tramite);
    },

    actualizarTramite(idTramite, tramite) {
        return axios.put(`${API_URL}/tramites/${idTramite}`, tramite);
    },

    eliminarTramite(idTramite) {
        return axios.delete(`${API_URL}/tramites/${idTramite}`);
    },

    // ESTADÍSTICAS
    obtenerEstadisticas(idUsuario) {
        return axios.get(`${API_URL}/estadisticas/${idUsuario}`);
    }
};

export default SegurosService;