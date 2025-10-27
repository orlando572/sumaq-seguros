import axiosInstance from '../../config/axiosConfig';

const API_URL = "/chatbot";

const ChatBotService = {
    // Enviar mensaje al chatbot
    enviarMensaje(mensaje, idUsuario) {
        return axiosInstance.post(`${API_URL}/mensaje`, {
            mensaje,
            idUsuario
        });
    },

    // Solicitar contacto con asesor
    solicitarAsesor(idUsuario, motivo) {
        return axiosInstance.post(`${API_URL}/solicitar-asesor`, {
            idUsuario,
            motivo
        });
    }
};

export default ChatBotService;