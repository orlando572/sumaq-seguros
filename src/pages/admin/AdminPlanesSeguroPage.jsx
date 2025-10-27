import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, Shield, Car, Home, Heart } from 'lucide-react';
import AdminPlanesSeguroService from '../../service/admin/AdminPlanesSeguroService';

export default function AdminPlanesSeguroPage() {
    const [planes, setPlanes] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        coberturaPrincipal: '',
        estado: 'Activo'
    });

    const categorias = ['Vehicular', 'Hogar', 'Salud', 'Vida'];

    const categoryIcons = {
        'Vehicular': Car,
        'Hogar': Home,
        'Salud': Heart,
        'Vida': Shield
    };

    useEffect(() => {
        cargarDatos();
    }, [filtroCategoria, filtroEstado]);

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
            const [planesRes, statsRes] = await Promise.all([
                AdminPlanesSeguroService.listarPlanes(filtroCategoria, filtroEstado),
                AdminPlanesSeguroService.obtenerEstadisticas()
            ]);
            setPlanes(planesRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos");
        }
        setLoading(false);
    };

    const handleBuscar = () => {
        const planesFiltrados = planes.filter(plan => 
            plan.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            plan.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
        );
        setPlanes(planesFiltrados);
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setPlanSeleccionado(null);
        limpiarFormulario();
        setShowModal(true);
    };

    const handleEditar = (plan) => {
        setModoEdicion(true);
        setPlanSeleccionado(plan);
        setFormData({
            nombre: plan.nombre || '',
            descripcion: plan.descripcion || '',
            categoria: plan.categoria || '',
            coberturaPrincipal: plan.coberturaPrincipal || '',
            estado: plan.estado || 'Activo'
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este plan de seguro?")) {
            try {
                await AdminPlanesSeguroService.eliminarPlan(id);
                setSuccessMessage("Plan eliminado exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                setErrorMessage("Error al eliminar el plan");
            }
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await AdminPlanesSeguroService.cambiarEstado(id, nuevoEstado);
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

        if (!formData.nombre || !formData.categoria) {
            setErrorMessage("Por favor completa los campos obligatorios");
            return;
        }

        try {
            if (modoEdicion && planSeleccionado) {
                await AdminPlanesSeguroService.actualizarPlan(planSeleccionado.idTipoSeguro, formData);
                setSuccessMessage("Plan actualizado exitosamente");
            } else {
                await AdminPlanesSeguroService.crearPlan(formData);
                setSuccessMessage("Plan creado exitosamente");
            }

            setShowModal(false);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar el plan");
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            categoria: '',
            coberturaPrincipal: '',
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

    const getCategoryIcon = (categoria) => {
        const Icon = categoryIcons[categoria] || Shield;
        return <Icon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando planes de seguro...</p>
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
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Planes de Seguro</h1>
                <button
                    onClick={handleNuevo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Plan
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total Planes</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm">Activos</p>
                        <p className="text-2xl font-bold text-green-800">{estadisticas.activos}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Inactivos</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.inactivos}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                        <p className="text-gray-600 text-sm">Categorías</p>
                        <p className="text-2xl font-bold text-blue-800">4</p>
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
                                placeholder="Buscar por nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
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

            {/* Tabla de planes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Categoría</th>
                                <th className="px-4 py-3 text-left">Descripción</th>
                                <th className="px-4 py-3 text-left">Cobertura Principal</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {planes.length > 0 ? (
                                planes.map((plan) => (
                                    <tr key={plan.idTipoSeguro} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{plan.idTipoSeguro}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(plan.categoria)}
                                                <span className="font-medium">{plan.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {plan.categoria}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate">{plan.descripcion || '-'}</td>
                                        <td className="px-4 py-3 max-w-xs truncate">{plan.coberturaPrincipal || '-'}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={plan.estado}
                                                onChange={(e) => handleCambiarEstado(plan.idTipoSeguro, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(plan.estado)}`}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(plan)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(plan.idTipoSeguro)}
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
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No hay planes de seguro registrados
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
                                {modoEdicion ? "Editar Plan de Seguro" : "Nuevo Plan de Seguro"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6">
                            <div className="grid grid-cols-1 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleFormChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cobertura Principal</label>
                                    <input
                                        type="text"
                                        name="coberturaPrincipal"
                                        value={formData.coberturaPrincipal}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                    {modoEdicion ? "Actualizar" : "Crear"} Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
