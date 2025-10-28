import axiosInstance from '../../config/axiosConfig';

const CotizacionService = {
    solicitarCotizacion: (idUsuario, idsPlanes, comentarios = '') => {
        return axiosInstance.post('/cotizacion/solicitar', {
            idUsuario,
            idsPlanes,
            comentarios
        });
    }
};

export default CotizacionService;
