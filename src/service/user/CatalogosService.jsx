import axiosInstance from '../../config/axiosConfig';

const API_URL = "/catalogos";

const CatalogosService = {
    // Obtener tipos de seguro
    obtenerTiposSeguros() {
        return axiosInstance.get(`${API_URL}/tipos-seguro`);
    },

    // Obtener tipos de seguro por categoría
    obtenerTiposPorCategoria(categoria) {
        return axiosInstance.get(`${API_URL}/tipos-seguro/categoria/${categoria}`);
    },

    // Obtener categorías
    obtenerCategorias() {
        return axiosInstance.get(`${API_URL}/categorias`);
    },

    // Obtener compañías
    obtenerCompanias() {
        return axiosInstance.get(`${API_URL}/companias`);
    },

    // Buscar compañías
    buscarCompanias(nombre) {
        return axiosInstance.get(`${API_URL}/companias/buscar?nombre=${nombre}`);
    }
};

export default CatalogosService;
