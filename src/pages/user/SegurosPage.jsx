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
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SegurosService from '../../service/user/SegurosService';
import CatalogosService from '../../service/user/CatalogosService';

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
    
    // Catálogos
    const [tiposSeguros, setTiposSeguros] = useState([]);
    const [companias, setCompanias] = useState([]);

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
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [selectedPoliza, setSelectedPoliza] = useState(null);
    const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
    const [selectedPago, setSelectedPago] = useState(null);
    const [porcentajeDisponible, setPorcentajeDisponible] = useState(100);

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
        telefono: '',
        fechaNacimiento: '',
        idSeguro: ''
    });

    const [formTramite, setFormTramite] = useState({
        tipoTramite: 'Consulta',
        descripcion: '',
        prioridad: 'Media',
        idSeguro: ''
    });

    const [formPago, setFormPago] = useState({
        metodoPago: 'Tarjeta de crédito',
        numeroTarjeta: '',
        nombreTitular: '',
        fechaExpiracion: '',
        cvv: ''
    });

    useEffect(() => {
        if (user?.idUsuario) {
            cargarDatos();
        }
        cargarCatalogos();
    }, [user]);
    
    const cargarCatalogos = async () => {
        try {
            const [tiposRes, companiasRes] = await Promise.all([
                CatalogosService.obtenerTiposSeguros(),
                CatalogosService.obtenerCompanias()
            ]);
            setTiposSeguros(tiposRes.data);
            setCompanias(companiasRes.data);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        }
    };

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

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

    const generarNumeroPoliza = () => {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const hora = String(fecha.getHours()).padStart(2, '0');
        const minuto = String(fecha.getMinutes()).padStart(2, '0');
        const segundo = String(fecha.getSeconds()).padStart(2, '0');
        return `POL-${año}${mes}${dia}-${hora}${minuto}${segundo}`;
    };

    const handleNuevaPoliza = () => {
        setSelectedPoliza(null);
        limpiarFormularioPoliza();
        // Generar número de póliza automáticamente
        setFormPoliza(prev => ({
            ...prev,
            numeroPoliza: generarNumeroPoliza()
        }));
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
                setSuccessMessage("Póliza creada exitosamente. Los pagos se generaron automáticamente.");
            }

            setShowPolizaModal(false);
            limpiarFormularioPoliza();
            await cargarDatos(); // Esperar a que se recarguen los datos
        } catch (error) {
            console.error("Error al guardar póliza:", error);
            
            // Mejorar el mensaje de error
            let mensajeError = "Error al guardar la póliza";
            
            if (error.response?.data?.error) {
                const errorMsg = error.response.data.error;
                
                // Detectar error de número de póliza duplicado
                if (errorMsg.includes("duplicate key") || errorMsg.includes("numero_poliza")) {
                    mensajeError = "El número de póliza ya existe. Por favor, usa otro número.";
                } else {
                    mensajeError = errorMsg;
                }
            } else if (error.response?.data?.mensaje) {
                mensajeError = error.response.data.mensaje;
            }
            
            setErrorMessage(mensajeError);
        }
    };

    const handlePagar = (pago) => {
        setSelectedPago(pago);
        setFormPago({
            metodoPago: 'Tarjeta de crédito',
            numeroTarjeta: '',
            nombreTitular: '',
            fechaExpiracion: '',
            cvv: ''
        });
        setShowPagoModal(true);
    };

    const handleProcesarPago = async (e) => {
        e.preventDefault();
        try {
            const pagoData = {
                idPago: selectedPago.idPago,
                seguro: { idSeguro: selectedPago.seguro.idSeguro },
                numeroCuota: selectedPago.numeroCuota,
                montoPagado: selectedPago.montoCuota,
                montoCuota: selectedPago.montoCuota,
                fechaVencimiento: selectedPago.fechaVencimiento,
                metodoPago: formPago.metodoPago,
                fechaPago: new Date().toISOString(),
                estado: 'Pagado'
            };

            await SegurosService.registrarPago(pagoData);
            setSuccessMessage("Pago procesado exitosamente");
            setShowPagoModal(false);
            setFormPago({
                metodoPago: 'Tarjeta de crédito',
                numeroTarjeta: '',
                nombreTitular: '',
                fechaExpiracion: '',
                cvv: ''
            });
            await cargarDatos();
        } catch (error) {
            console.error("Error al procesar pago:", error);
            setErrorMessage(error.response?.data || "Error al procesar el pago");
        }
    };

    const calcularPorcentajeDisponible = async (idSeguro) => {
        try {
            const response = await SegurosService.obtenerBeneficiarios(idSeguro);
            const beneficiarios = response.data || [];
            const totalUsado = beneficiarios.reduce((sum, b) => sum + (parseFloat(b.porcentaje) || 0), 0);
            setPorcentajeDisponible(100 - totalUsado);
        } catch (error) {
            console.error("Error al calcular porcentaje:", error);
            setPorcentajeDisponible(100);
        }
    };

    const handleNuevoBeneficiario = async (poliza) => {
        setSelectedPoliza(poliza);
        await calcularPorcentajeDisponible(poliza.idSeguro);
        setFormBeneficiario({
            nombreCompleto: '',
            parentesco: '',
            porcentaje: '',
            dni: '',
            telefono: '',
            fechaNacimiento: '',
            idSeguro: poliza.idSeguro
        });
        setShowBeneficiarioModal(true);
    };

    const handleGuardarBeneficiario = async (e) => {
        e.preventDefault();
        try {
            const beneficiarioData = {
                seguro: { idSeguro: parseInt(formBeneficiario.idSeguro) },
                nombreCompleto: formBeneficiario.nombreCompleto,
                parentesco: formBeneficiario.parentesco,
                porcentaje: parseFloat(formBeneficiario.porcentaje),
                dni: formBeneficiario.dni || null,
                fechaNacimiento: formBeneficiario.fechaNacimiento || null,
                telefono: formBeneficiario.telefono || null,
                estado: 'Activo'
            };

            await SegurosService.agregarBeneficiario(beneficiarioData);
            setSuccessMessage("Beneficiario agregado exitosamente");
            setShowBeneficiarioModal(false);
            setFormBeneficiario({
                nombreCompleto: '',
                parentesco: '',
                porcentaje: '',
                dni: '',
                telefono: '',
                fechaNacimiento: '',
                idSeguro: ''
            });
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar beneficiario:", error);
            setErrorMessage(error.response?.data || "Error al guardar el beneficiario");
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

            <h1 className="text-3xl font-bold text-gray-800">Gestión de Seguros</h1>

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
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <Download className="w-4 h-4" /> Exportar
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
                                                    <button
                                                        onClick={() => handleNuevoBeneficiario(poliza)}
                                                        className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded transition-colors"
                                                        title="Agregar Beneficiario"
                                                    >
                                                        <Users className="w-4 h-4" />
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
                                    <th className="px-4 py-3 text-left">Vencimiento</th>
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
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(pago.montoCuota || pago.montoPagado)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {pago.fechaVencimiento ? formatDate(pago.fechaVencimiento) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(pago.estado)}`}>
                                                    {pago.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => handlePagar(pago)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                                                    disabled={pago.estado === 'Pagado'}
                                                >
                                                    {pago.estado === 'Pagado' ? 'Pagado' : 'Pagar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
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
                                onClick={() => setShowPolizaModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarPoliza} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tipo de Seguro */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Seguro *
                                    </label>
                                    <select
                                        name="tipoSeguro"
                                        value={formPoliza.tipoSeguro}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {tiposSeguros.map(tipo => (
                                            <option key={tipo.idTipoSeguro} value={tipo.idTipoSeguro}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Compañía */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Compañía Aseguradora *
                                    </label>
                                    <select
                                        name="compania"
                                        value={formPoliza.compania}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {companias.map(comp => (
                                            <option key={comp.idCompania} value={comp.idCompania}>
                                                {comp.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Número de Póliza */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Póliza *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="numeroPoliza"
                                            value={formPoliza.numeroPoliza}
                                            onChange={(e) => handleFormChange(e, setFormPoliza)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormPoliza(prev => ({ ...prev, numeroPoliza: generarNumeroPoliza() }))}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                                            title="Generar nuevo número"
                                        >
                                            🔄
                                        </button>
                                    </div>
                                </div>

                                {/* Forma de Pago */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Forma de Pago *
                                    </label>
                                    <select
                                        name="formaPago"
                                        value={formPoliza.formaPago}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Bimestral">Bimestral</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>

                                {/* Fecha Inicio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaInicio"
                                        value={formPoliza.fechaInicio}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* Fecha Vencimiento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Vencimiento *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaVencimiento"
                                        value={formPoliza.fechaVencimiento}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* Monto Asegurado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto Asegurado (S/) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="montoAsegurado"
                                        value={formPoliza.montoAsegurado}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* Prima Mensual */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prima Mensual (S/) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="primaMensual"
                                        value={formPoliza.primaMensual}
                                        onChange={(e) => handleFormChange(e, setFormPoliza)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Al crear la póliza, se generarán automáticamente los pagos según la forma de pago seleccionada.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowPolizaModal(false)}
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

            {/* MODAL NUEVO BENEFICIARIO */}
            {showBeneficiarioModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Agregar Beneficiario - Póliza {selectedPoliza?.numeroPoliza}
                            </h2>
                            <button
                                onClick={() => setShowBeneficiarioModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarBeneficiario} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre Completo */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombreCompleto"
                                        value={formBeneficiario.nombreCompleto}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* Parentesco */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parentesco *
                                    </label>
                                    <select
                                        name="parentesco"
                                        value={formBeneficiario.parentesco}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Cónyuge">Cónyuge</option>
                                        <option value="Hijo">Hijo/a</option>
                                        <option value="Padre">Padre</option>
                                        <option value="Madre">Madre</option>
                                        <option value="Hermano">Hermano/a</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                {/* Porcentaje */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Porcentaje (%) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        name="porcentaje"
                                        value={formBeneficiario.porcentaje}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                {/* DNI */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        DNI
                                    </label>
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formBeneficiario.dni}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        maxLength="20"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaNacimiento"
                                        value={formBeneficiario.fechaNacimiento}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formBeneficiario.telefono}
                                        onChange={(e) => handleFormChange(e, setFormBeneficiario)}
                                        maxLength="20"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className={`border rounded-lg p-4 mt-4 ${porcentajeDisponible > 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className={`text-sm font-medium ${porcentajeDisponible > 0 ? 'text-blue-800' : 'text-red-800'}`}>
                                        Porcentaje disponible:
                                    </p>
                                    <span className={`text-2xl font-bold ${porcentajeDisponible > 0 ? 'text-blue-900' : 'text-red-900'}`}>
                                        {porcentajeDisponible}%
                                    </span>
                                </div>
                                <p className={`text-xs ${porcentajeDisponible > 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                    {porcentajeDisponible > 0 
                                        ? `Puedes asignar hasta ${porcentajeDisponible}% a este beneficiario.`
                                        : 'Ya se ha asignado el 100% del beneficio. No puedes agregar más beneficiarios.'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowBeneficiarioModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Agregar Beneficiario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PROCESAR PAGO */}
            {showPagoModal && selectedPago && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Procesar Pago</h2>
                            <button
                                onClick={() => setShowPagoModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Póliza:</span>
                                <span className="font-semibold">{selectedPago.seguro?.numeroPoliza}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Cuota:</span>
                                <span className="font-semibold">#{selectedPago.numeroCuota}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Monto a pagar:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(selectedPago.montoCuota)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleProcesarPago} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Método de Pago
                                </label>
                                <select
                                    name="metodoPago"
                                    value={formPago.metodoPago}
                                    onChange={(e) => handleFormChange(e, setFormPago)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    required
                                >
                                    <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                                    <option value="Tarjeta de débito">Tarjeta de débito</option>
                                    <option value="Transferencia bancaria">Transferencia bancaria</option>
                                    <option value="Débito automático">Débito automático</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Tarjeta
                                </label>
                                <input
                                    type="text"
                                    name="numeroTarjeta"
                                    value={formPago.numeroTarjeta}
                                    onChange={(e) => handleFormChange(e, setFormPago)}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Titular
                                </label>
                                <input
                                    type="text"
                                    name="nombreTitular"
                                    value={formPago.nombreTitular}
                                    onChange={(e) => handleFormChange(e, setFormPago)}
                                    placeholder="Como aparece en la tarjeta"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Expiración
                                    </label>
                                    <input
                                        type="text"
                                        name="fechaExpiracion"
                                        value={formPago.fechaExpiracion}
                                        onChange={(e) => handleFormChange(e, setFormPago)}
                                        placeholder="MM/AA"
                                        maxLength="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formPago.cvv}
                                        onChange={(e) => handleFormChange(e, setFormPago)}
                                        placeholder="123"
                                        maxLength="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-green-800 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Transacción segura y encriptada
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowPagoModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                >
                                    Pagar {formatCurrency(selectedPago.montoCuota)}
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