import { useState, useEffect } from 'react';
import { 
    Download, 
    Plus, 
    Edit2, 
    Trash2, 
    ChevronDown, 
    ChevronRight, 
    Shield, 
    Users, 
    CreditCard, 
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    FileDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SegurosService from '../../service/user/SegurosService';
import PdfExportService from '../../service/user/PdfExportService';

export default function SegurosPage() {
    const { user } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [polizas, setPolizas] = useState([]);
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [pagosPendientes, setPagosPendientes] = useState([]);
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Estados para exportación PDF
    const [exportando, setExportando] = useState(false);
    const [mensajeExportacion, setMensajeExportacion] = useState({ tipo: '', texto: '' });

    // Estados para secciones expandibles
    const [expandedSections, setExpandedSections] = useState({
        polizas: true,
        beneficiarios: false,
        pagos: false,
        tramites: false
    });

    // Estados para modales
    const [showPolizaModal, setShowPolizaModal] = useState(false);
    const [showBeneficiarioModal, setShowBeneficiarioModal] = useState(false);
    const [showTramiteModal, setShowTramiteModal] = useState(false);
    const [selectedPoliza, setSelectedPoliza] = useState(null);
    const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);

    // Formularios
    const [formPoliza, setFormPoliza] = useState({
        tipoSeguro: '',
        compania: '',
        numeroPoliza: '',
        fechaInicio: '',
        fechaVencimiento: '',
        montoAsegurado: '',
        primaMensual: '',
        formaPago: 'Mensual'
    });

    const [formBeneficiario, setFormBeneficiario] = useState({
        nombreCompleto: '',
        parentesco: '',
        porcentaje: '',
        dni: '',
        telefono: ''
    });

    const [formTramite, setFormTramite] = useState({
        tipoTramite: 'Consulta',
        descripcion: '',
        prioridad: 'Media',
        idSeguro: ''
    });

    useEffect(() => {
        if (user?.idUsuario) {
            cargarDatos();
        }
    }, [user]);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    // Limpiar mensajes de exportación
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
                polizasRes,
                pagosPendientesRes,
                tramitesRes
            ] = await Promise.all([
                SegurosService.obtenerResumen(user.idUsuario),
                SegurosService.obtenerPolizas(user.idUsuario),
                SegurosService.obtenerPagosPendientes(user.idUsuario),
                SegurosService.obtenerTramites(user.idUsuario)
            ]);

            setResumen(resumenRes.data);
            setPolizas(polizasRes.data);
            setPagosPendientes(pagosPendientesRes.data.pagos || []);
            setTramites(tramitesRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos de seguros");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Función para exportar Gestión de Seguros a PDF
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
            await PdfExportService.descargarGestionSeguros(user.idUsuario);
            
            setMensajeExportacion({
                tipo: 'success',
                texto: '¡PDF de Gestión de Seguros descargado exitosamente!'
            });
        } catch (error) {
            console.error("Error al exportar PDF:", error);
            
            setMensajeExportacion({
                tipo: 'error',
                texto: 'Error al generar el PDF. Por favor, intenta nuevamente.'
            });
        } finally {
            setExportando(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFormChange = (e, formSetter) => {
        const { name, value } = e.target;
        formSetter(prev => ({ ...prev, [name]: value }));
    };

    const limpiarFormularioPoliza = () => {
        setFormPoliza({
            tipoSeguro: '',
            compania: '',
            numeroPoliza: '',
            fechaInicio: '',
            fechaVencimiento: '',
            montoAsegurado: '',
            primaMensual: '',
            formaPago: 'Mensual'
        });
    };

    const handleNuevaPoliza = () => {
        setSelectedPoliza(null);
        limpiarFormularioPoliza();
        setShowPolizaModal(true);
    };

    const handleEditarPoliza = (poliza) => {
        setSelectedPoliza(poliza);
        setFormPoliza({
            tipoSeguro: poliza.tipoSeguro?.idTipoSeguro || '',
            compania: poliza.compania?.idCompania || '',
            numeroPoliza: poliza.numeroPoliza || '',
            fechaInicio: poliza.fechaInicio || '',
            fechaVencimiento: poliza.fechaVencimiento || '',
            montoAsegurado: poliza.montoAsegurado || '',
            primaMensual: poliza.primaMensual || '',
            formaPago: poliza.formaPago || 'Mensual'
        });
        setShowPolizaModal(true);
    };

    const handleEliminarPoliza = async (idSeguro) => {
        if (window.confirm("¿Estás seguro de que deseas cancelar esta póliza?")) {
            try {
                await SegurosService.cancelarPoliza(idSeguro);
                setSuccessMessage("Póliza cancelada exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al cancelar póliza:", error);
                setErrorMessage("Error al cancelar la póliza");
            }
        }
    };

    const handleCrearTramite = async (e) => {
        e.preventDefault();
        try {
            const tramite = {
                usuario: { idUsuario: user.idUsuario },
                seguro: formTramite.idSeguro ? { idSeguro: parseInt(formTramite.idSeguro) } : null,
                tipoTramite: formTramite.tipoTramite,
                descripcion: formTramite.descripcion,
                prioridad: formTramite.prioridad,
                canalAtencion: 'Web'
            };

            await SegurosService.crearTramite(tramite);
            setSuccessMessage("Trámite creado exitosamente");
            setShowTramiteModal(false);
            setFormTramite({
                tipoTramite: 'Consulta',
                descripcion: '',
                prioridad: 'Media',
                idSeguro: ''
            });
            cargarDatos();
        } catch (error) {
            console.error("Error al crear trámite:", error);
            setErrorMessage("Error al crear el trámite");
        }
    };

    const handleGuardarPoliza = async (e) => {
        e.preventDefault();
        try {
            const polizaData = {
                usuario: { idUsuario: user.idUsuario },
                tipoSeguro: { idTipoSeguro: parseInt(formPoliza.tipoSeguro) },
                compania: { idCompania: parseInt(formPoliza.compania) },
                numeroPoliza: formPoliza.numeroPoliza,
                fechaInicio: formPoliza.fechaInicio,
                fechaVencimiento: formPoliza.fechaVencimiento,
                montoAsegurado: parseFloat(formPoliza.montoAsegurado),
                primaMensual: parseFloat(formPoliza.primaMensual),
                formaPago: formPoliza.formaPago,
                estado: 'Vigente'
            };

            if (selectedPoliza) {
                await SegurosService.actualizarPoliza(selectedPoliza.idSeguro, polizaData);
                setSuccessMessage("Póliza actualizada exitosamente");
            } else {
                await SegurosService.crearPoliza(polizaData);
                setSuccessMessage("Póliza creada exitosamente");
            }

            setShowPolizaModal(false);
            limpiarFormularioPoliza();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar póliza:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar la póliza");
        }
    };

    const handlePagar = async (pago) => {
        if (window.confirm(`¿Confirmar pago de ${formatCurrency(pago.montoPagado)}?`)) {
            try {
                const pagoData = {
                    ...pago,
                    estado: 'Pagado',
                    fechaPago: new Date().toISOString().split('T')[0],
                    metodoPago: 'Tarjeta'
                };

                await SegurosService.registrarPago(pagoData);
                setSuccessMessage("Pago registrado exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al registrar pago:", error);
                setErrorMessage("Error al procesar el pago");
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const configs = {
            'Vigente': 'bg-green-100 text-green-800',
            'Activo': 'bg-green-100 text-green-800',
            'Vencido': 'bg-red-100 text-red-800',
            'Cancelado': 'bg-gray-100 text-gray-800',
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'En proceso': 'bg-blue-100 text-blue-800',
            'Resuelto': 'bg-green-100 text-green-800',
            'Rechazado': 'bg-red-100 text-red-800'
        };
        return configs[estado] || configs['Activo'];
    };

    const getTramiteIcon = (estado) => {
        const icons = {
            'Pendiente': Clock,
            'En proceso': Clock,
            'Resuelto': CheckCircle2,
            'Rechazado': AlertCircle
        };
        return icons[estado] || Clock;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de seguros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mensajes */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                </div>
            )}

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

            {/* Header con botón de exportar */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Seguros</h1>
                
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

            {/* RESUMEN ADMINISTRATIVO */}
            {resumen && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Resumen administrativo</h2>
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                            ⚡ Datos actualizados
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Pólizas activas</p>
                            <p className="text-2xl font-bold text-blue-900">{resumen.polizasActivas}</p>
                            <p className="text-gray-500 text-xs">Vigentes</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Beneficiarios</p>
                            <p className="text-2xl font-bold text-green-900">{resumen.beneficiariosRegistrados}</p>
                            <p className="text-gray-500 text-xs">Registrados</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Pagos pendientes</p>
                            <p className="text-2xl font-bold text-purple-900">{formatCurrency(resumen.pagosPendientes)}</p>
                            <p className="text-gray-500 text-xs">Próximos 30 días</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                            <p className="text-gray-600 text-sm mb-1">Alertas</p>
                            <p className="text-2xl font-bold text-red-900">{resumen.alertas}</p>
                            <p className="text-gray-500 text-xs">Vencimientos / Trámites</p>
                        </div>
                    </div>
                </div>
            )}

            {/* PÓLIZAS ACTIVAS */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => toggleSection('polizas')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-lg"
                    >
                        {expandedSections.polizas ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <Shield size={20} />
                        Pólizas activas
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleNuevaPoliza}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Nueva póliza
                        </button>
                        <button 
                            onClick={handleExportarPDF}
                            disabled={exportando}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                </div>

                {expandedSections.polizas && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-teal-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Aseguradora</th>
                                    <th className="px-4 py-3 text-left">N° Póliza</th>
                                    <th className="px-4 py-3 text-left">Inicio</th>
                                    <th className="px-4 py-3 text-left">Vencimiento</th>
                                    <th className="px-4 py-3 text-right">Prima Mensual</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {polizas.length > 0 ? (
                                    polizas.map((poliza) => (
                                        <tr key={poliza.idSeguro} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">{poliza.tipoSeguro?.nombre}</td>
                                            <td className="px-4 py-3">{poliza.compania?.nombre}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{poliza.numeroPoliza}</td>
                                            <td className="px-4 py-3 text-sm">{formatDate(poliza.fechaInicio)}</td>
                                            <td className="px-4 py-3 text-sm">{formatDate(poliza.fechaVencimiento)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                                                {formatCurrency(poliza.primaMensual)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(poliza.estado)}`}>
                                                    {poliza.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditarPoliza(poliza)}
                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarPoliza(poliza.idSeguro)}
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                            No hay pólizas registradas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAGOS Y RECORDATORIOS */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <button
                    onClick={() => toggleSection('pagos')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-lg mb-4"
                >
                    {expandedSections.pagos ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <CreditCard size={20} />
                    Pagos y recordatorios
                </button>

                {expandedSections.pagos && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-teal-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Póliza</th>
                                    <th className="px-4 py-3 text-left">N° Cuota</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pagosPendientes.length > 0 ? (
                                    pagosPendientes.map((pago) => (
                                        <tr key={pago.idPago} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{pago.seguro?.numeroPoliza}</td>
                                            <td className="px-4 py-3">{pago.numeroCuota}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(pago.montoPagado)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(pago.estado)}`}>
                                                    {pago.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => handlePagar(pago)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                                                >
                                                    Pagar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No hay pagos pendientes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* TRÁMITES Y RECLAMOS */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => toggleSection('tramites')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-lg"
                    >
                        {expandedSections.tramites ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <FileText size={20} />
                        Trámites y reclamos
                    </button>
                    <button
                        onClick={() => setShowTramiteModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Nuevo trámite
                    </button>
                </div>

                {expandedSections.tramites && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-teal-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Detalle</th>
                                    <th className="px-4 py-3 text-left">Póliza</th>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left">Prioridad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tramites.length > 0 ? (
                                    tramites.map((tramite) => {
                                        const IconComponent = getTramiteIcon(tramite.estado);
                                        return (
                                            <tr key={tramite.idTramite} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{tramite.tipoTramite}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-700 truncate max-w-xs">
                                                        {tramite.descripcion}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {tramite.seguro?.numeroPoliza || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(tramite.fechaSolicitud).toLocaleDateString('es-PE')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(tramite.estado)}`}>
                                                        <IconComponent className="w-3 h-3" />
                                                        {tramite.estado}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                        tramite.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                                                        tramite.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {tramite.prioridad}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            No hay trámites registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL NUEVA/EDITAR PÓLIZA */}
            {showPolizaModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {selectedPoliza ? 'Editar Póliza' : 'Nueva Póliza'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPolizaModal(false);
                                    limpiarFormularioPoliza();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarPoliza} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Seguro *
                                    </label>
                                    <select
                                        name="tipoSeguro"
                                        value={formPoliza.tipoSeguro}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1">Vida</option>
                                        <option value="2">Salud</option>
                                        <option value="3">Vehicular</option>
                                        <option value="4">Hogar</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Compañía *
                                    </label>
                                    <select
                                        name="compania"
                                        value={formPoliza.compania}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1">Pacífico Seguros</option>
                                        <option value="2">Rímac Seguros</option>
                                        <option value="3">La Positiva</option>
                                        <option value="4">Mapfre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        N° de Póliza *
                                    </label>
                                    <input
                                        type="text"
                                        name="numeroPoliza"
                                        value={formPoliza.numeroPoliza}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        placeholder="POL-2024-001"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Forma de Pago *
                                    </label>
                                    <select
                                        name="formaPago"
                                        value={formPoliza.formaPago}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaInicio"
                                        value={formPoliza.fechaInicio}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Vencimiento *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaVencimiento"
                                        value={formPoliza.fechaVencimiento}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto Asegurado (S/) *
                                    </label>
                                    <input
                                        type="number"
                                        name="montoAsegurado"
                                        value={formPoliza.montoAsegurado}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        placeholder="50000"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prima Mensual (S/) *
                                    </label>
                                    <input
                                        type="number"
                                        name="primaMensual"
                                        value={formPoliza.primaMensual}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        placeholder="150.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPolizaModal(false);
                                        limpiarFormularioPoliza();
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    {selectedPoliza ? 'Actualizar' : 'Crear'} Póliza
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO TRÁMITE */}
            {showTramiteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Nuevo Trámite</h2>
                            <button
                                onClick={() => setShowTramiteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCrearTramite} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Trámite *
                                    </label>
                                    <select
                                        name="tipoTramite"
                                        value={formTramite.tipoTramite}
                                        onChange={(e) => handleFormChange(e, setFormTramite)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="Consulta">Consulta</option>
                                        <option value="Reclamo">Reclamo</option>
                                        <option value="Solicitud">Solicitud</option>
                                        <option value="Renovación">Renovación</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad
                                    </label>
                                    <select
                                        name="prioridad"
                                        value={formTramite.prioridad}
                                        onChange={(e) => handleFormChange(e, setFormTramite)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Póliza Relacionada (Opcional)
                                    </label>
                                    <select
                                        name="idSeguro"
                                        value={formTramite.idSeguro}
                                        onChange={(e) => handleFormChange(e, setFormTramite)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        <option value="">Ninguna</option>
                                        {polizas.map(poliza => (
                                            <option key={poliza.idSeguro} value={poliza.idSeguro}>
                                                {poliza.numeroPoliza} - {poliza.tipoSeguro?.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formTramite.descripcion}
                                    onChange={(e) => handleFormChange(e, setFormTramite)}
                                    rows="5"
                                    placeholder="Describe tu trámite, reclamo o consulta..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowTramiteModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Crear Trámite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}