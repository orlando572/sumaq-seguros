import axiosInstance from '../../config/axiosConfig';

const API_URL = "/seguros";

const SegurosService = {
    // RESUMEN ADMINISTRATIVO
    obtenerResumen(idUsuario) {
        return axiosInstance.get(`${API_URL}/resumen/${idUsuario}`);
    },

    // GESTIÓN DE PÓLIZAS
    obtenerPolizas(idUsuario) {
        return axiosInstance.get(`${API_URL}/polizas/${idUsuario}`);
    },

    obtenerPolizasActivas(idUsuario) {
        return axiosInstance.get(`${API_URL}/polizas/${idUsuario}/activos`);
    },

    obtenerPolizaPorId(idSeguro) {
        return axiosInstance.get(`${API_URL}/poliza/${idSeguro}`);
    },

    crearPoliza(poliza) {
        return axiosInstance.post(`${API_URL}/polizas`, poliza);
    },

    actualizarPoliza(idSeguro, poliza) {
        return axiosInstance.put(`${API_URL}/polizas/${idSeguro}`, poliza);
    },

    cancelarPoliza(idSeguro) {
        return axiosInstance.delete(`${API_URL}/polizas/${idSeguro}`);
    },

    obtenerProximosVencer(idUsuario, dias = 30) {
        return axiosInstance.get(`${API_URL}/polizas/${idUsuario}/proximos-vencer?dias=${dias}`);
    },

    // GESTIÓN DE BENEFICIARIOS
    obtenerBeneficiarios(idSeguro) {
        return axiosInstance.get(`${API_URL}/beneficiarios/${idSeguro}`);
    },

    agregarBeneficiario(beneficiario) {
        return axiosInstance.post(`${API_URL}/beneficiarios`, beneficiario);
    },

    actualizarBeneficiario(idBeneficiario, beneficiario) {
        return axiosInstance.put(`${API_URL}/beneficiarios/${idBeneficiario}`, beneficiario);
    },

    eliminarBeneficiario(idBeneficiario) {
        return axiosInstance.delete(`${API_URL}/beneficiarios/${idBeneficiario}`);
    },

    // GESTIÓN DE PAGOS
    obtenerPagos(idSeguro) {
        return axiosInstance.get(`${API_URL}/pagos/${idSeguro}`);
    },

    obtenerPagosPendientes(idUsuario) {
        return axiosInstance.get(`${API_URL}/pagos/${idUsuario}/pendientes`);
    },

    registrarPago(pago) {
        return axiosInstance.post(`${API_URL}/pagos`, pago);
    },

    // GESTIÓN DE TRÁMITES
    obtenerTramites(idUsuario) {
        return axiosInstance.get(`${API_URL}/tramites/${idUsuario}`);
    },

    obtenerTramitesPendientes(idUsuario) {
        return axiosInstance.get(`${API_URL}/tramites/${idUsuario}/pendientes`);
    },

    crearTramite(tramite) {
        return axiosInstance.post(`${API_URL}/tramites`, tramite);
    },

    actualizarTramite(idTramite, tramite) {
        return axiosInstance.put(`${API_URL}/tramites/${idTramite}`, tramite);
    },

    eliminarTramite(idTramite) {
        return axiosInstance.delete(`${API_URL}/tramites/${idTramite}`);
    },

    // ESTADÍSTICAS
    obtenerEstadisticas(idUsuario) {
        return axiosInstance.get(`${API_URL}/estadisticas/${idUsuario}`);
    }
};

export default SegurosService;