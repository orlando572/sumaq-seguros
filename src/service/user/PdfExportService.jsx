import axiosInstance from '../../config/axiosConfig';

const API_URL = "/pdf-export";

const PdfExportService = {
    /**
     * Exportar Panel Financiero a PDF
     * @param {number} idUsuario - ID del usuario
     * @returns {Promise} - Promesa con el blob del PDF
     */
    exportarPanelFinanciero: async (idUsuario) => {
        try {
            const response = await axiosInstance.get(
                `${API_URL}/panel-financiero/${idUsuario}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error("Error al exportar Panel Financiero PDF:", error);
            throw error;
        }
    },

    /**
     * Exportar Gestión de Pensiones a PDF
     * @param {number} idUsuario - ID del usuario
     * @returns {Promise} - Promesa con el blob del PDF
     */
    exportarGestionPensiones: async (idUsuario) => {
        try {
            const response = await axiosInstance.get(
                `${API_URL}/gestion-pensiones/${idUsuario}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error("Error al exportar Gestión de Pensiones PDF:", error);
            throw error;
        }
    },

    /**
     * Exportar Gestión de Seguros a PDF
     * @param {number} idUsuario - ID del usuario
     * @returns {Promise} - Promesa con el blob del PDF
     */
    exportarGestionSeguros: async (idUsuario) => {
        try {
            const response = await axiosInstance.get(
                `${API_URL}/gestion-seguros/${idUsuario}`,
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                }
            );
            return response;
        } catch (error) {
            console.error("Error al exportar Gestión de Seguros PDF:", error);
            throw error;
        }
    },

    /**
     * Función genérica para descargar PDF
     * @param {Function} exportFunction - Función de exportación a ejecutar
     * @param {number} idUsuario - ID del usuario
     * @param {string} nombreArchivo - Nombre base del archivo
     */
    descargarPDF: async (exportFunction, idUsuario, nombreArchivo) => {
        try {
            const response = await exportFunction(idUsuario);
            
            // Crear blob del PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            
            // Crear URL temporal
            const url = window.URL.createObjectURL(blob);
            
            // Crear elemento <a> para descargar
            const link = document.createElement('a');
            link.href = url;
            
            // Nombre del archivo con timestamp
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
            link.download = `${nombreArchivo}_${timestamp}.pdf`;
            
            // Agregar al DOM, hacer clic y remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Liberar URL temporal
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error("Error al descargar PDF:", error);
            throw error;
        }
    },

    /**
     * Descargar Panel Financiero
     */
    descargarPanelFinanciero: async (idUsuario) => {
        return await PdfExportService.descargarPDF(
            PdfExportService.exportarPanelFinanciero,
            idUsuario,
            'Panel_Financiero'
        );
    },

    /**
     * Descargar Gestión de Pensiones
     */
    descargarGestionPensiones: async (idUsuario) => {
        return await PdfExportService.descargarPDF(
            PdfExportService.exportarGestionPensiones,
            idUsuario,
            'Gestion_Pensiones'
        );
    },

    /**
     * Descargar Gestión de Seguros
     */
    descargarGestionSeguros: async (idUsuario) => {
        return await PdfExportService.descargarPDF(
            PdfExportService.exportarGestionSeguros,
            idUsuario,
            'Gestion_Seguros'
        );
    },

    /**
     * Verificar estado del servicio
     */
    verificarEstado: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/health`);
            return response.data;
        } catch (error) {
            console.error("Error al verificar estado del servicio:", error);
            throw error;
        }
    }
};

export default PdfExportService;