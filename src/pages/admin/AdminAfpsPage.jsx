import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import AdminAfpService from '../../service/admin/AdminAfpService';

export default function AdminAfpsPage() {
    const [afps, setAfps] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [instituciones, setInstituciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [afpSeleccionada, setAfpSeleccionada] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        codigoSbs: '',
        comisionFlujo: '',
        comisionSaldo: '',
        comisionMixta: '',
        rentabilidadPromedio: '',
        fondosDisponibles: '["1", "2", "3"]',
        estado: 'Activo',
        idInstitucion: ''
    });

    useEffect(() => {
        cargarDatos();
        cargarInstituciones();
    }, []);

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
            const [afpsRes, statsRes] = await Promise.all([
                AdminAfpService.listarAfps(busqueda, filtroEstado),
                AdminAfpService.obtenerEstadisticas()
            ]);
            setAfps(afpsRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos");
        }
        setLoading(false);
    };

    const cargarInstituciones = async () => {
        // Simulado - En producción, crear endpoint para listar instituciones
        setInstituciones([
            { idInstitucion: 1, nombre: 'Institución AFP Integra' },
            { idInstitucion: 2, nombre: 'Institución AFP Prima' },
            { idInstitucion: 3, nombre: 'Institución AFP Habitat' },
            { idInstitucion: 4, nombre: 'Institución AFP Profuturo' }
        ]);
    };

    const handleBuscar = () => {
        cargarDatos();
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setAfpSeleccionada(null);
        limpiarFormulario();
        setShowModal(true);
    };

    const handleEditar = (afp) => {
        setModoEdicion(true);
        setAfpSeleccionada(afp);
        setFormData({
            nombre: afp.nombre || '',
            codigoSbs: afp.codigoSbs || '',
            comisionFlujo: afp.comisionFlujo || '',
            comisionSaldo: afp.comisionSaldo || '',
            comisionMixta: afp.comisionMixta || '',
            rentabilidadPromedio: afp.rentabilidadPromedio || '',
            fondosDisponibles: afp.fondosDisponibles || '["1", "2", "3"]',
            estado: afp.estado || 'Activo',
            idInstitucion: afp.institucion?.idInstitucion || ''
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta AFP?")) {
            try {
                await AdminAfpService.eliminarAfp(id);
                setSuccessMessage("AFP eliminada exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                setErrorMessage("Error al eliminar la AFP");
            }
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await AdminAfpService.cambiarEstado(id, nuevoEstado);
            setSuccessMessage("Estado actualizado exitosamente");
            cargarDatos();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setErrorMessage("Error al cambiar el estado");
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.codigoSbs) {
            setErrorMessage("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const afpData = {
                ...formData,
                institucion: formData.idInstitucion ? { idInstitucion: parseInt(formData.idInstitucion) } : null,
                comisionFlujo: formData.comisionFlujo ? parseFloat(formData.comisionFlujo) : null,
                comisionSaldo: formData.comisionSaldo ? parseFloat(formData.comisionSaldo) : null,
                comisionMixta: formData.comisionMixta ? parseFloat(formData.comisionMixta) : null,
                rentabilidadPromedio: formData.rentabilidadPromedio ? parseFloat(formData.rentabilidadPromedio) : null
            };

            if (modoEdicion && afpSeleccionada) {
                await AdminAfpService.actualizarAfp(afpSeleccionada.idAfp, afpData);
                setSuccessMessage("AFP actualizada exitosamente");
            } else {
                await AdminAfpService.crearAfp(afpData);
                setSuccessMessage("AFP creada exitosamente");
            }

            setShowModal(false);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar la AFP");
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            codigoSbs: '',
            comisionFlujo: '',
            comisionSaldo: '',
            comisionMixta: '',
            rentabilidadPromedio: '',
            fondosDisponibles: '["1", "2", "3"]',
            estado: 'Activo',
            idInstitucion: ''
        });
    };

    const getEstadoBadge = (estado) => {
        const configs = {
            'Activo': 'bg-green-100 text-green-800',
            'Inactivo': 'bg-gray-100 text-gray-800'
        };
        return configs[estado] || configs['Activo'];
    };

    const formatPercent = (value) => {
        return value ? `${parseFloat(value).toFixed(2)}%` : '-';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando AFPs...</p>
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

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de AFPs</h1>
                <button
                    onClick={handleNuevo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva AFP
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total AFPs</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm">Activas</p>
                        <p className="text-2xl font-bold text-green-800">{estadisticas.activas}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Inactivas</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.inactivas}</p>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código SBS..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Todos los estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                    <button
                        onClick={handleBuscar}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Tabla de AFPs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Código SBS</th>
                                <th className="px-4 py-3 text-right">Comisión Flujo</th>
                                <th className="px-4 py-3 text-right">Comisión Saldo</th>
                                <th className="px-4 py-3 text-right">Rentabilidad</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {afps.length > 0 ? (
                                afps.map((afp) => (
                                    <tr key={afp.idAfp} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{afp.idAfp}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="font-medium">{afp.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {afp.codigoSbs}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatPercent(afp.comisionFlujo)}</td>
                                        <td className="px-4 py-3 text-right">{formatPercent(afp.comisionSaldo)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-green-600 font-semibold">
                                                {formatPercent(afp.rentabilidadPromedio)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={afp.estado}
                                                onChange={(e) => handleCambiarEstado(afp.idAfp, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(afp.estado)}`}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(afp)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(afp.idAfp)}
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
                                        No hay AFPs registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de formulario */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? "Editar AFP" : "Nueva AFP"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código SBS *</label>
                                    <input
                                        type="text"
                                        name="codigoSbs"
                                        value={formData.codigoSbs}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisión Flujo (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="comisionFlujo"
                                        value={formData.comisionFlujo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisión Saldo (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="comisionSaldo"
                                        value={formData.comisionSaldo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisión Mixta (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="comisionMixta"
                                        value={formData.comisionMixta}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rentabilidad Promedio (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="rentabilidadPromedio"
                                        value={formData.rentabilidadPromedio}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                                    <select
                                        name="idInstitucion"
                                        value={formData.idInstitucion}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar Institución</option>
                                        {instituciones.map(inst => (
                                            <option key={inst.idInstitucion} value={inst.idInstitucion}>
                                                {inst.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fondos Disponibles (JSON)</label>
                                    <input
                                        type="text"
                                        name="fondosDisponibles"
                                        value={formData.fondosDisponibles}
                                        onChange={handleFormChange}
                                        placeholder='["1", "2", "3"]'
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Ejemplo: ["1", "2", "3"]</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    {modoEdicion ? "Actualizar" : "Crear"} AFP
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}