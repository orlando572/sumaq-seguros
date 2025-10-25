import axios from 'axios';

const API_URL = "http://localhost:8090/api/comparador";

const ComparadorService = {
    // Obtener todas las categorías
    obtenerCategorias() {
        return axios.get(`${API_URL}/categorias`);
    },

    // Obtener tipos de seguro por categoría
    obtenerTiposPorCategoria(categoria) {
        return axios.get(`${API_URL}/tipos/${categoria}`);
    },

    // Obtener todas las compañías
    obtenerCompanias() {
        return axios.get(`${API_URL}/companias`);
    },

    // Obtener seguros por categoría
    obtenerSegurosPorCategoria(categoria) {
        return axios.get(`${API_URL}/seguros/categoria/${categoria}`);
    },

    // Obtener seguros por tipo
    obtenerSegurosPorTipo(idTipo) {
        return axios.get(`${API_URL}/seguros/tipo/${idTipo}`);
    },

    // Obtener seguros por compañía
    obtenerSegurosPorCompania(idCompania) {
        return axios.get(`${API_URL}/seguros/compania/${idCompania}`);
    },

    // Comparar planes
    compararPlanes(idsPlanes) {
        return axios.post(`${API_URL}/comparar`, { idsPlanes });
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
        
        return axios.get(url);
    },

    // Obtener resumen de plan
    obtenerResumenPlan(idSeguro) {
        return axios.get(`${API_URL}/plan/${idSeguro}`);
    },

    // Obtener estadísticas por categoría
    obtenerEstadisticas(categoria) {
        return axios.get(`${API_URL}/estadisticas/${categoria}`);
    }
};

export default ComparadorService;