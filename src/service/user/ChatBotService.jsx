import axios from 'axios';

const API_URL = "http://localhost:8090/api/chatbot";

const ChatBotService = {
    // Enviar mensaje al chatbot
    enviarMensaje(mensaje, idUsuario) {
        return axios.post(`${API_URL}/mensaje`, {
            mensaje,
            idUsuario
        });
    },

    // Solicitar contacto con asesor
    solicitarAsesor(idUsuario, motivo) {
        return axios.post(`${API_URL}/solicitar-asesor`, {
            idUsuario,
            motivo
        });
    }
};

export default ChatBotService;