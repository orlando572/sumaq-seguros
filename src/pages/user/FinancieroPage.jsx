import { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, PieChart, Loader2, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FinancieroService from '../../service/user/FinancieroService';
import PdfExportService from '../../service/user/PdfExportService';

export default function FinancieroPage() {
    const { user } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [aportes, setAportes] = useState([]);
    const [saldos, setSaldos] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [comparativo, setComparativo] = useState(null);
    const [sistema, setSistema] = useState("");
    const [generado, setGenerado] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Estados para exportación PDF
    const [exportando, setExportando] = useState(false);
    const [mensajeExportacion, setMensajeExportacion] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        if (user?.idUsuario) {
            cargarDatos();
        }
    }, [user]);

    // Limpiar mensajes después de 3 segundos
    useEffect(() => {
        if (mensajeExportacion.texto) {
            const timer = setTimeout(() => {
                setMensajeExportacion({ tipo: '', texto: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [mensajeExportacion]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [
                resumenRes,
                aportesRes,
                saldosRes,
                estadisticasRes,
                comparativoRes
            ] = await Promise.all([
                FinancieroService.obtenerResumen(user.idUsuario),
                FinancieroService.obtenerAportes(user.idUsuario),
                FinancieroService.obtenerSaldos(user.idUsuario),
                FinancieroService.obtenerEstadisticas(user.idUsuario),
                FinancieroService.obtenerComparativo(user.idUsuario)
            ]);

            setResumen(resumenRes.data);
            setAportes(aportesRes.data);
            setSaldos(saldosRes.data);
            setEstadisticas(estadisticasRes.data);
            setComparativo(comparativoRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerarVisualizacion = async () => {
        if (sistema) {
            setGenerado(true);
            // Registrar en historial cuando se genera la consulta
            try {
                await FinancieroService.obtenerComparativo(user.idUsuario);
                console.log('Consulta registrada en historial');
            } catch (error) {
                console.error('Error al registrar consulta:', error);
            }
        }
    };

    const filtrarAportes = () => {
        if (!sistema) return aportes;
        if (sistema === "ONP") {
            return aportes.filter(a => a.institucion?.tipo === "Pensiones");
        } else if (sistema === "AFP") {
            return aportes.filter(a => a.institucion?.tipo === "Financiera");
        }
        return aportes;
    };

    /**
     * Función para exportar a PDF
     */
    const handleExportarPDF = async () => {
        if (!user?.idUsuario) {
            setMensajeExportacion({
                tipo: 'error',
                texto: 'Usuario no identificado'
            });
            return;
        }

        setExportando(true);
        setMensajeExportacion({ tipo: '', texto: '' });

        try {
            // Descargar PDF
            await PdfExportService.descargarPanelFinanciero(user.idUsuario);
            
            // Mensaje de éxito
            setMensajeExportacion({
                tipo: 'success',
                texto: '¡PDF descargado exitosamente!'
            });
        } catch (error) {
            console.error("Error al exportar PDF:", error);
            
            // Mensaje de error
            setMensajeExportacion({
                tipo: 'error',
                texto: 'Error al generar el PDF. Por favor, intenta nuevamente.'
            });
        } finally {
            setExportando(false);
        }
    };

    const aportesFiltr = filtrarAportes();
    const totalAportesActual = aportesFiltr.reduce((sum, a) => sum + (a.montoAporte || 0), 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
    };

    const formatPercent = (value) => {
        return ((value || 0) * 100).toFixed(1) + '%';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Mensajes de exportación */}
            {mensajeExportacion.texto && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                    mensajeExportacion.tipo === 'success' 
                        ? 'bg-green-100 border-green-400 text-green-700' 
                        : 'bg-red-100 border-red-400 text-red-700'
                }`}>
                    {mensajeExportacion.tipo === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{mensajeExportacion.texto}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Panel Financiero</h1>
                
                {/* Botón de Exportar PDF */}
                <button
                    onClick={handleExportarPDF}
                    disabled={exportando}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        exportando
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                >
                    {exportando ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generando PDF...</span>
                        </>
                    ) : (
                        <>
                            <FileDown className="w-4 h-4" />
                            <span>Exportar a PDF</span>
                        </>
                    )}
                </button>
            </div>

            {/* RESUMEN DE ESTADO */}
            {resumen && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Resumen de Estado</h2>
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                            ⚡ Datos actualizados
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Monto disponible</p>
                            <p className="text-2xl font-bold text-blue-900">{formatCurrency(resumen.saldoDisponible)}</p>
                            <p className="text-gray-500 text-xs">Cuentas + AFP</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Proyección pensión</p>
                            <p className="text-2xl font-bold text-green-900">{formatCurrency(resumen.proyeccionPensionMensual)}</p>
                            <p className="text-gray-500 text-xs">/ mes estimado</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Aportes ONP (12m)</p>
                            <p className="text-2xl font-bold text-purple-900">{formatCurrency(resumen.aportesONP12m)}</p>
                            <p className="text-gray-500 text-xs">Últimos 12 meses</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Aportes AFP (12m)</p>
                            <p className="text-2xl font-bold text-teal-900">{formatCurrency(resumen.aportesAFP12m)}</p>
                            <p className="text-gray-500 text-xs">Íntegra</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SELECTOR DE SISTEMA */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleccione un sistema de aportes</h3>
                <div className="flex gap-4 items-center">
                    <select
                        value={sistema}
                        onChange={(e) => setSistema(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="ONP">ONP</option>
                        <option value="AFP">AFP</option>
                    </select>
                    <button
                        onClick={handleGenerarVisualizacion}
                        disabled={!sistema}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sistema
                                ? "bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Generar Visualización
                    </button>
                </div>
            </div>

            {/* CONTENIDO GENERADO */}
            {generado && (
                <div className="space-y-6">
                    {/* VISUALIZACIONES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gráfico del Sistema */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4">{sistema}</h3>
                            <p className="text-sm text-gray-500 mb-4">Últimos años</p>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 mb-4 h-48 flex items-end justify-around">
                                {estadisticas?.aportesPorAnio?.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div
                                            className="bg-teal-600 rounded-t"
                                            style={{
                                                width: "40px",
                                                height: Math.max(10, (item.total / 15000) * 150) + "px"
                                            }}
                                        />
                                        <p className="text-xs text-gray-600 mt-2">{item.anio}</p>
                                        <p className="text-xs font-semibold text-gray-800">{formatCurrency(item.total)}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">
                                Total aportado: <span className="font-bold">{formatCurrency(totalAportesActual)}</span>
                            </p>
                        </div>

                        {/* Gráfico Comparativo */}
                        {comparativo && (
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Comparativo</h3>
                                <p className="text-sm text-gray-500 mb-4">ONP vs AFP</p>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-4 h-48 flex items-center justify-center">
                                    <div className="w-32 h-32 relative">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e0e7ff" strokeWidth="20" />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke="#14b8a6"
                                                strokeWidth="20"
                                                strokeDasharray={`${(comparativo.porcentajeONP / 100) * 251.2} 251.2`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <p className="text-sm font-bold text-gray-800">{comparativo.porcentajeONP?.toFixed(1)}%</p>
                                            <p className="text-xs text-gray-600">ONP</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Rentabilidad acumulada: <span className="font-bold text-green-600">+5.2%</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* TABLA DE APORTES */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Aportes realizados</h3>
                            <button 
                                onClick={handleExportarPDF}
                                disabled={exportando}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {exportando ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Exportar
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Período</th>
                                        <th className="px-4 py-3 text-left">Empleador</th>
                                        <th className="px-4 py-3 text-right">Monto Trabajador</th>
                                        <th className="px-4 py-3 text-right">Monto Empleador</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-left">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aportesFiltr.length > 0 ? (
                                        aportesFiltr.map((aporte, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="px-4 py-3">
                                                    {new Date(aporte.fechaAporte).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">{aporte.periodo}</td>
                                                <td className="px-4 py-3">{aporte.empleador}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(aporte.aporteTrabajador)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(aporte.aporteEmpleador)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(aporte.montoAporte)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        aporte.estado === "Procesado"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                        {aporte.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                                                No hay aportes registrados para este sistema
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-100 font-medium">
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-right">Total:</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(totalAportesActual)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* PROYECCIONES */}
                    {resumen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">Monto disponible</h4>
                                <p className="text-2xl font-bold text-gray-800 mb-3">{formatCurrency(resumen.saldoDisponible)}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Disponible 72h</span>
                                        <span className="font-semibold">{formatCurrency(resumen.saldoDisponible * 0.8)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Resguardo</span>
                                        <span className="font-semibold">{formatCurrency(resumen.saldoDisponible * 0.2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">Proyección de pensión</h4>
                                <p className="text-2xl font-bold text-gray-800 mb-3">{formatCurrency(resumen.proyeccionPensionMensual)}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Con +5% aporte</span>
                                        <span className="font-semibold">{formatCurrency(resumen.proyeccionPensionMensual * 1.05)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Escenario conservador</span>
                                        <span className="font-semibold">{formatCurrency(resumen.proyeccionPensionMensual * 0.9)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">Proyección de retiro</h4>
                                <p className="text-2xl font-bold text-gray-800 mb-3">{formatCurrency(resumen.saldoTotal * 1.1)}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tasa anual</span>
                                        <span className="font-semibold">5.4%</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Riesgo</span>
                                        <span className="font-semibold text-blue-600">Medio</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}