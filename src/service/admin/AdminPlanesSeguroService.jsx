import axiosInstance from '../../config/axiosConfig';

const API_URL = "/admin/planes-seguro";

const AdminPlanesSeguroService = {
    // Listar todos los planes con filtros opcionales
    listarPlanes(categoria = null, estado = null) {
        let url = API_URL;
        const params = new URLSearchParams();
        
        if (categoria) params.append('categoria', categoria);
        if (estado) params.append('estado', estado);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return axiosInstance.get(url);
    },

    // Obtener un plan por ID
    obtenerPlanPorId(id) {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    // Crear un nuevo plan
    crearPlan(plan) {
        return axiosInstance.post(API_URL, plan);
    },

    // Actualizar un plan existente
    actualizarPlan(id, plan) {
        return axiosInstance.put(`${API_URL}/${id}`, plan);
    },

    // Eliminar un plan
    eliminarPlan(id) {
        return axiosInstance.delete(`${API_URL}/${id}`);
    },

    // Cambiar estado de un plan
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

export default AdminPlanesSeguroService;
