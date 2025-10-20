import { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PensionesService from '../../service/user/PensionesService';

export default function PensionesPage() {
    const { user } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [aportes, setAportes] = useState([]);
    const [saldos, setSaldos] = useState([]);
    const [estado, setEstado] = useState(null);
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(null);
    const [selectedAporte, setSelectedAporte] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        periodo: '',
        montoAporte: '',
        aporteTrabajador: '',
        aporteEmpleador: '',
        comisionCobrada: '',
        seguroInvalidez: '',
        fechaAporte: '',
        empleador: '',
        rucEmpleador: '',
        salarioDeclarado: '',
        diasTrabajados: '',
        observaciones: '',
    });

    useEffect(() => {
        if (user?.idUsuario) {
            cargarDatos();
        }
    }, [user]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resumenRes, aportesRes, saldosRes, estadoRes] = await Promise.all([
                PensionesService.obtenerResumen(user.idUsuario),
                PensionesService.obtenerAportes(user.idUsuario),
                PensionesService.obtenerSaldos(user.idUsuario),
                PensionesService.obtenerEstado(user.idUsuario),
            ]);

            setResumen(resumenRes.data);
            setAportes(aportesRes.data || []);
            setSaldos(saldosRes.data || []);
            setEstado(estadoRes.data);

            // Datos de trámites simulados
            setTramites([
                { id: 1, tipo: "Apelación", detalle: "Revisión cálculo ONP", estado: "En proceso", fecha: "02/08/2025" },
                { id: 2, tipo: "Bono", detalle: "Programa especial AFP", estado: "Aprobado", fecha: "28/07/2025" },
            ]);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert("Error al cargar los datos");
        }
        setLoading(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const limpiarFormulario = () => {
        setFormData({
            periodo: '',
            montoAporte: '',
            aporteTrabajador: '',
            aporteEmpleador: '',
            comisionCobrada: '',
            seguroInvalidez: '',
            fechaAporte: '',
            empleador: '',
            rucEmpleador: '',
            salarioDeclarado: '',
            diasTrabajados: '',
            observaciones: '',
        });
    };

    const handleGuardarAporte = async (e) => {
        e.preventDefault();

        if (!formData.periodo || !formData.montoAporte || !formData.fechaAporte) {
            alert("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const aporte = {
                usuario: { idUsuario: user.idUsuario },
                institucion: { idInstitucion: 2 },
                tipoFondo: { idTipoFondo: 2 },
                periodo: formData.periodo,
                montoAporte: parseFloat(formData.montoAporte),
                aporteTrabajador: parseFloat(formData.aporteTrabajador) || 0,
                aporteEmpleador: parseFloat(formData.aporteEmpleador) || 0,
                comisionCobrada: parseFloat(formData.comisionCobrada) || 0,
                seguroInvalidez: parseFloat(formData.seguroInvalidez) || 0,
                fechaAporte: formData.fechaAporte,
                empleador: formData.empleador,
                rucEmpleador: formData.rucEmpleador,
                salarioDeclarado: parseFloat(formData.salarioDeclarado) || 0,
                diasTrabajados: parseInt(formData.diasTrabajados) || 0,
                observaciones: formData.observaciones,
                estado: "Registrado"
            };

            if (selectedAporte) {
                await PensionesService.actualizarAporte(selectedAporte.idAporte, aporte);
                setSuccessMessage("Aporte actualizado exitosamente");
            } else {
                await PensionesService.crearAporte(aporte);
                setSuccessMessage("Aporte creado exitosamente");
            }

            setShowForm(null);
            setSelectedAporte(null);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar aporte:", error);
            alert("Error al guardar el aporte: " + (error.response?.data?.mensaje || error.message));
        }
    };

    const handleEditar = (aporte) => {
        setSelectedAporte(aporte);
        setFormData({
            periodo: aporte.periodo,
            montoAporte: aporte.montoAporte,
            aporteTrabajador: aporte.aporteTrabajador,
            aporteEmpleador: aporte.aporteEmpleador,
            comisionCobrada: aporte.comisionCobrada,
            seguroInvalidez: aporte.seguroInvalidez,
            fechaAporte: aporte.fechaAporte,
            empleador: aporte.empleador,
            rucEmpleador: aporte.rucEmpleador,
            salarioDeclarado: aporte.salarioDeclarado,
            diasTrabajados: aporte.diasTrabajados,
            observaciones: aporte.observaciones,
        });
        setShowForm('aporte');
    };

    const handleEliminar = async (idAporte) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este aporte?")) {
            try {
                await PensionesService.eliminarAporte(idAporte);
                setSuccessMessage("Aporte eliminado exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar el aporte");
            }
        }
    };

    const handleCancelar = () => {
        setShowForm(null);
        setSelectedAporte(null);
        limpiarFormulario();
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

    const getTramiteBadge = (estado) => {
        const config = {
            'Pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            'En proceso': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
            'Aprobado': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
            'Rechazado': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
        };
        return config[estado] || config['Pendiente'];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de pensiones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-800">Gestión de Pensiones</h1>

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
                <p className="text-gray-600 text-sm mb-1">Estado AFP</p>
                <p className="text-2xl font-bold text-blue-900">{resumen.estadoAFP}</p>
                <p className="text-gray-500 text-xs">Integra</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Estado ONP</p>
                <p className="text-2xl font-bold text-green-900">{resumen.estadoONP}</p>
                <p className="text-gray-500 text-xs">Último aporte: 06/2024</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Años aportados</p>
                <p className="text-2xl font-bold text-purple-900">{resumen.años || 0}</p>
                <p className="text-gray-500 text-xs">ONP + AFP</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Saldo disponible</p>
                <p className="text-2xl font-bold text-teal-900">{formatCurrency(resumen.saldoDisponible)}</p>
                <p className="text-gray-500 text-xs">Disponible para retiro</p>
            </div>
        </div>
    </div>
)}

            {/* APORTES */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Aportes registrados</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSelectedAporte(null);
                                limpiarFormulario();
                                setShowForm('aporte');
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Nuevo aporte
                        </button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <Download className="w-4 h-4" /> Exportar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Período</th>
                                <th className="px-4 py-3 text-left">Empleador</th>
                                <th className="px-4 py-3 text-right">Monto Total</th>
                                <th className="px-4 py-3 text-right">Trabajador</th>
                                <th className="px-4 py-3 text-right">Empleador</th>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {aportes.length > 0 ? (
                                aportes.map((aporte) => (
                                    <tr key={aporte.idAporte} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{aporte.periodo}</td>
                                        <td className="px-4 py-3">{aporte.empleador}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                                            {formatCurrency(aporte.montoAporte)}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(aporte.aporteTrabajador)}</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(aporte.aporteEmpleador)}</td>
                                        <td className="px-4 py-3 text-sm">{aporte.fechaAporte}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                {aporte.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(aporte)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(aporte.idAporte)}
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                                    title="Eliminar"
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
                                        No hay aportes registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TRÁMITES, APELACIONES Y BONOS */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Trámites, apelaciones y bonos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tramites.map((tramite) => {
                        const config = getTramiteBadge(tramite.estado);
                        const IconComponent = config.icon;
                        return (
                            <div key={tramite.id} className={`${config.bg} ${config.text} p-4 rounded-lg border-l-4`}>
                                <div className="flex items-start gap-3">
                                    <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm mb-1">{tramite.tipo}</h4>
                                        <p className="text-sm mb-3">{tramite.detalle}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium">{tramite.estado}</span>
                                            <span className="opacity-75">{tramite.fecha}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL FORMULARIO */}
            {showForm === 'aporte' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {selectedAporte ? "Editar Aporte" : "Nuevo Aporte"}
                            </h2>
                            <button
                                onClick={handleCancelar}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleGuardarAporte} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Período (Ej: 2025-08) *
                                    </label>
                                    <input
                                        type="text"
                                        name="periodo"
                                        value={formData.periodo}
                                        onChange={handleFormChange}
                                        placeholder="2025-08"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha del Aporte *
                                    </label>
                                    <input
                                        type="date"
                                        name="fechaAporte"
                                        value={formData.fechaAporte}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto Total Aporte *
                                    </label>
                                    <input
                                        type="number"
                                        name="montoAporte"
                                        value={formData.montoAporte}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="1200.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aporte Trabajador
                                    </label>
                                    <input
                                        type="number"
                                        name="aporteTrabajador"
                                        value={formData.aporteTrabajador}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="500.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aporte Empleador
                                    </label>
                                    <input
                                        type="number"
                                        name="aporteEmpleador"
                                        value={formData.aporteEmpleador}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="600.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Empleador
                                    </label>
                                    <input
                                        type="text"
                                        name="empleador"
                                        value={formData.empleador}
                                        onChange={handleFormChange}
                                        placeholder="Nombre de la empresa"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        RUC Empleador
                                    </label>
                                    <input
                                        type="text"
                                        name="rucEmpleador"
                                        value={formData.rucEmpleador}
                                        onChange={handleFormChange}
                                        placeholder="20123456789"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Salario Declarado
                                    </label>
                                    <input
                                        type="number"
                                        name="salarioDeclarado"
                                        value={formData.salarioDeclarado}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="2500.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Días Trabajados
                                    </label>
                                    <input
                                        type="number"
                                        name="diasTrabajados"
                                        value={formData.diasTrabajados}
                                        onChange={handleFormChange}
                                        placeholder="30"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comisión Cobrada
                                    </label>
                                    <input
                                        type="number"
                                        name="comisionCobrada"
                                        value={formData.comisionCobrada}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="50.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Seguro Invalidez
                                    </label>
                                    <input
                                        type="number"
                                        name="seguroInvalidez"
                                        value={formData.seguroInvalidez}
                                        onChange={handleFormChange}
                                        step="0.01"
                                        placeholder="50.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleFormChange}
                                    rows="3"
                                    placeholder="Detalles adicionales..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCancelar}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    {selectedAporte ? "Actualizar" : "Guardar"} Aporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}