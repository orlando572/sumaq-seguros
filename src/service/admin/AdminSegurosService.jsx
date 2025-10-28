import axiosInstance from '../../config/axiosConfig';

const API_URL = '/admin/seguros';

const AdminSegurosService = {
    listarTodosSeguros: (busqueda = '', estado = '') => {
        return axiosInstance.get(API_URL, {
            params: { busqueda, estado }
        });
    },

    obtenerSeguroPorId: (id) => {
        return axiosInstance.get(`${API_URL}/${id}`);
    },

    obtenerEstadisticas: () => {
        return axiosInstance.get(`${API_URL}/estadisticas`);
    },

    crearSeguro: (seguroData) => {
        return axiosInstance.post(API_URL, seguroData);
    },

    actualizarSeguro: (id, seguroData) => {
        return axiosInstance.put(`${API_URL}/${id}`, seguroData);
    },

    eliminarSeguro: (id) => {
        return axiosInstance.delete(`${API_URL}/${id}`);
    },

    obtenerBeneficiarios: (idSeguro) => {
        return axiosInstance.get(`${API_URL}/${idSeguro}/beneficiarios`);
    },

    cambiarEstado: (id, nuevoEstado) => {
        return axiosInstance.put(`${API_URL}/${id}/estado`, null, {
            params: { nuevoEstado }
        });
    },

    listarUsuarios: () => {
        return axiosInstance.get('/admin/usuarios');
    }
};

export default AdminSegurosService;
