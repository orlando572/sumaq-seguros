import axiosInstance from '../../config/axiosConfig';

const API_URL = "/admin/companias-seguro";

const AdminCompaniasSeguroService = {
    // Listar todas las compañías con filtros opcionales
    listarCompanias(estado = null) {
        let url = API_URL;
        const params = new URLSearchParams();
        
        if (estado) params.append('estado', estado);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return axiosInstance.get(url);
    },

    // Obtener una compañía por ID
    obtenerCompaniaPorId(id) {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    // Crear una nueva compañía
    crearCompania(compania) {
        return axiosInstance.post(API_URL, compania);
    },

    // Actualizar una compañía existente
    actualizarCompania(id, compania) {
        return axiosInstance.put(`${API_URL}/${id}`, compania);
    },

    // Eliminar una compañía
    eliminarCompania(id) {
        return axiosInstance.delete(`${API_URL}/${id}`);
    },

    // Cambiar estado de una compañía
    cambiarEstado(id, estado) {
        return axiosInstance.patch(`${API_URL}/${id}/estado`, null, {
            params: { estado }
        });
    },

    // Obtener estadísticas
    obtenerEstadisticas() {
        return axiosInstance.get(`${API_URL}/estadisticas`);
    }
};

export default AdminCompaniasSeguroService;
