import axiosInstance from '../../config/axiosConfig';

const API_URL = "/comparador";

const ComparadorService = {
    // Obtener todas las categorías
    obtenerCategorias() {
        return axiosInstance.get(`${API_URL}/categorias`);
    },

    // Obtener tipos de seguro por categoría
    obtenerTiposPorCategoria(categoria) {
        return axiosInstance.get(`${API_URL}/tipos/${categoria}`);
    },

    // Obtener todas las compañías
    obtenerCompanias() {
        return axiosInstance.get(`${API_URL}/companias`);
    },

    // Obtener seguros por categoría
    obtenerSegurosPorCategoria(categoria) {
        return axiosInstance.get(`${API_URL}/seguros/categoria/${categoria}`);
    },

    // Obtener seguros por tipo
    obtenerSegurosPorTipo(idTipo) {
        return axiosInstance.get(`${API_URL}/seguros/tipo/${idTipo}`);
    },

    // Obtener seguros por compañía
    obtenerSegurosPorCompania(idCompania) {
        return axiosInstance.get(`${API_URL}/seguros/compania/${idCompania}`);
    },

    // Comparar planes
    compararPlanes(idsPlanes) {
        return axiosInstance.post(`${API_URL}/comparar`, { idsPlanes });
    },

    // Filtrar seguros
    filtrarSeguros(categoria, primaMin, primaMax, coberturaMin, coberturaMax) {
        let url = `${API_URL}/filtrar?categoria=${categoria}`;
        
        if (primaMin !== null && primaMin !== undefined) {
            url += `&primaMin=${primaMin}`;
        }
        if (primaMax !== null && primaMax !== undefined) {
            url += `&primaMax=${primaMax}`;
        }
        if (coberturaMin !== null && coberturaMin !== undefined) {
            url += `&coberturaMin=${coberturaMin}`;
        }
        if (coberturaMax !== null && coberturaMax !== undefined) {
            url += `&coberturaMax=${coberturaMax}`;
        }
        
        return axiosInstance.get(url);
    },

    // Obtener resumen de plan
    obtenerResumenPlan(idSeguro) {
        return axiosInstance.get(`${API_URL}/plan/${idSeguro}`);
    },

    // Obtener estadísticas por categoría
    obtenerEstadisticas(categoria) {
        return axiosInstance.get(`${API_URL}/estadisticas/${categoria}`);
    }
};

export default ComparadorService;