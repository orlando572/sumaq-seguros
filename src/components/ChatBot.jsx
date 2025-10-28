import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatBotService from '../service/user/ChatBotService';

export default function ChatBot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: '¡Hola! 👋 Soy tu asistente virtual de SumaqSeguros. ¿En qué puedo ayudarte hoy?',
            time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAsesorModal, setShowAsesorModal] = useState(false);
    const [motivoAsesor, setMotivoAsesor] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            type: 'user',
            text: inputMessage,
            time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await ChatBotService.enviarMensaje(inputMessage, user.idUsuario);
            const botMessage = {
                type: 'bot',
                text: response.data.respuesta,
                time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'Lo siento, ocurrió un error. ¿Necesitas hablar con un asesor?',
                time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnviarAsesor = async () => {
        if (!motivoAsesor.trim()) return;
        try {
            await ChatBotService.solicitarAsesor(user.idUsuario, motivoAsesor);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '✅ Tu solicitud ha sido enviada. Un asesor se comunicará contigo pronto.',
                time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error("Error enviando solicitud:", error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '❌ Ocurrió un error al enviar tu solicitud. Intenta nuevamente.',
                time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setMotivoAsesor('');
            setShowAsesorModal(false);
        }
    };

    const suggestedQuestions = [
        "¿Cuáles son mis datos personales?",
        "¿Cuál es mi saldo y proyección?",
        "¿Qué seguros ofrecen?",
        "Diferencia entre ONP y AFP",
        "¿Cuáles son mis pólizas activas?",
        "¿Cómo registro un aporte?",
        "¿Quiénes son mis beneficiarios?",
        "¿Cómo usar el comparador?"
    ];

    return (
        <div className="w-full h-full bg-white flex flex-col border border-gray-200 rounded-xl shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Asistente Virtual</h3>
                        <p className="text-xs text-emerald-100">En línea</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                    <div key={index} className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'bot' && (
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-emerald-600" />
                            </div>
                        )}
                        <div className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''}`}>
                            <div className={`p-3 rounded-2xl ${
                                message.type === 'user'
                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                                {message.time}
                            </p>
                        </div>
                        {message.type === 'user' && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Preguntas frecuentes (siempre visibles) */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Preguntas frecuentes:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => setInputMessage(question)}
                            className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-50 transition-colors"
                        >
                            {question}
                        </button>
                    ))}
                </div>
                <div className="mt-3 text-center">
                    <button
                        onClick={() => setShowAsesorModal(true)}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline"
                    >
                        📞 Contactar con un asesor
                    </button>
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Escribe tu consulta..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Modal contactar asesor */}
            {showAsesorModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Contactar con un asesor</h3>
                            <button onClick={() => setShowAsesorModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            value={motivoAsesor}
                            onChange={(e) => setMotivoAsesor(e.target.value)}
                            placeholder="Describe brevemente el motivo de tu consulta..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            rows="4"
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowAsesorModal(false)}
                                className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEnviarAsesor}
                                disabled={!motivoAsesor.trim()}
                                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300"
                            >
                                Enviar solicitud
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
