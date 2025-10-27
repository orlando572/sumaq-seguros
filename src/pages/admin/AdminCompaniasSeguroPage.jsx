import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, Building2, Phone, Mail, Globe, Award } from 'lucide-react';
import AdminCompaniasSeguroService from '../../service/admin/AdminCompaniasSeguroService';

export default function AdminCompaniasSeguroPage() {
    const [companias, setCompanias] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [companiaSeleccionada, setCompaniaSeleccionada] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        codigoSbs: '',
        calificacionRiesgo: '',
        telefono: '',
        email: '',
        sitioWeb: '',
        estado: 'Activo'
    });

    const calificaciones = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'];

    useEffect(() => {
        cargarDatos();
    }, [filtroEstado]);

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
            const [companiasRes, statsRes] = await Promise.all([
                AdminCompaniasSeguroService.listarCompanias(filtroEstado),
                AdminCompaniasSeguroService.obtenerEstadisticas()
            ]);
            setCompanias(companiasRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos");
        }
        setLoading(false);
    };

    const handleBuscar = () => {
        if (!busqueda.trim()) {
            cargarDatos();
            return;
        }
        const companiasFiltradas = companias.filter(compania => 
            compania.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            compania.codigoSbs?.toLowerCase().includes(busqueda.toLowerCase())
        );
        setCompanias(companiasFiltradas);
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setCompaniaSeleccionada(null);
        limpiarFormulario();
        setShowModal(true);
    };

    const handleEditar = (compania) => {
        setModoEdicion(true);
        setCompaniaSeleccionada(compania);
        setFormData({
            nombre: compania.nombre || '',
            codigoSbs: compania.codigoSbs || '',
            calificacionRiesgo: compania.calificacionRiesgo || '',
            telefono: compania.telefono || '',
            email: compania.email || '',
            sitioWeb: compania.sitioWeb || '',
            estado: compania.estado || 'Activo'
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta compañía de seguros?")) {
            try {
                await AdminCompaniasSeguroService.eliminarCompania(id);
                setSuccessMessage("Compañía eliminada exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                setErrorMessage("Error al eliminar la compañía");
            }
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await AdminCompaniasSeguroService.cambiarEstado(id, nuevoEstado);
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

        if (!formData.nombre) {
            setErrorMessage("El nombre de la compañía es obligatorio");
            return;
        }

        try {
            if (modoEdicion && companiaSeleccionada) {
                await AdminCompaniasSeguroService.actualizarCompania(companiaSeleccionada.idCompania, formData);
                setSuccessMessage("Compañía actualizada exitosamente");
            } else {
                await AdminCompaniasSeguroService.crearCompania(formData);
                setSuccessMessage("Compañía creada exitosamente");
            }

            setShowModal(false);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar la compañía");
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            codigoSbs: '',
            calificacionRiesgo: '',
            telefono: '',
            email: '',
            sitioWeb: '',
            estado: 'Activo'
        });
    };

    const getEstadoBadge = (estado) => {
        const configs = {
            'Activo': 'bg-green-100 text-green-800',
            'Inactivo': 'bg-gray-100 text-gray-800'
        };
        return configs[estado] || configs['Activo'];
    };

    const getCalificacionColor = (calificacion) => {
        if (!calificacion) return 'text-gray-500';
        if (calificacion.startsWith('AAA') || calificacion.startsWith('AA')) return 'text-green-600';
        if (calificacion.startsWith('A')) return 'text-blue-600';
        if (calificacion.startsWith('BBB')) return 'text-yellow-600';
        return 'text-orange-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando compañías de seguros...</p>
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
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Compañías de Seguros</h1>
                <button
                    onClick={handleNuevo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Compañía
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total Compañías</p>
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

            {/* Tabla de compañías */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Código SBS</th>
                                <th className="px-4 py-3 text-left">Calificación</th>
                                <th className="px-4 py-3 text-left">Contacto</th>
                                <th className="px-4 py-3 text-left">Sitio Web</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {companias.length > 0 ? (
                                companias.map((compania) => (
                                    <tr key={compania.idCompania} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{compania.idCompania}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium">{compania.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {compania.codigoSbs || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {compania.calificacionRiesgo ? (
                                                <div className="flex items-center gap-1">
                                                    <Award className={`w-4 h-4 ${getCalificacionColor(compania.calificacionRiesgo)}`} />
                                                    <span className={`font-semibold ${getCalificacionColor(compania.calificacionRiesgo)}`}>
                                                        {compania.calificacionRiesgo}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1 text-xs">
                                                {compania.telefono && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Phone className="w-3 h-3" />
                                                        {compania.telefono}
                                                    </div>
                                                )}
                                                {compania.email && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Mail className="w-3 h-3" />
                                                        {compania.email}
                                                    </div>
                                                )}
                                                {!compania.telefono && !compania.email && '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {compania.sitioWeb ? (
                                                <a 
                                                    href={compania.sitioWeb} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    Visitar
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={compania.estado}
                                                onChange={(e) => handleCambiarEstado(compania.idCompania, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(compania.estado)}`}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(compania)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(compania.idCompania)}
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
                                        No hay compañías de seguros registradas
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
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? "Editar Compañía de Seguros" : "Nueva Compañía de Seguros"}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Compañía *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                        placeholder="Ej: Pacífico Seguros"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código SBS</label>
                                    <input
                                        type="text"
                                        name="codigoSbs"
                                        value={formData.codigoSbs}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: 1234"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calificación de Riesgo</label>
                                    <select
                                        name="calificacionRiesgo"
                                        value={formData.calificacionRiesgo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar calificación</option>
                                        {calificaciones.map(cal => (
                                            <option key={cal} value={cal}>{cal}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: 01-513-5000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: contacto@pacifico.com.pe"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                                    <input
                                        type="url"
                                        name="sitioWeb"
                                        value={formData.sitioWeb}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: https://www.pacifico.com.pe"
                                    />
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
                                    {modoEdicion ? "Actualizar" : "Crear"} Compañía
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
