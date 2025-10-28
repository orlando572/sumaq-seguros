import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, DollarSign, User, Calendar, Edit2, Trash2, X, Plus } from 'lucide-react';
import AdminAporteService from '../../service/admin/AdminAporteService';
import AdminUsuarioService from '../../service/admin/AdminUsuarioService';

export default function AdminAportesPage() {
    const [aportes, setAportes] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [aporteSeleccionado, setAporteSeleccionado] = useState(null);

    const [formData, setFormData] = useState({
        idUsuario: '',
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
        estado: 'Registrado'
    });

    useEffect(() => {
        cargarDatos();
        cargarUsuarios();
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
            const [aportesRes, statsRes] = await Promise.all([
                AdminAporteService.listarAportes(filtroUsuario || null, filtroEstado || null),
                AdminAporteService.obtenerEstadisticas()
            ]);
            setAportes(aportesRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos");
        }
        setLoading(false);
    };

    const cargarUsuarios = async () => {
        try {
            const response = await AdminUsuarioService.listarUsuarios();
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    const handleBuscar = () => {
        cargarDatos();
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setAporteSeleccionado(null);
        limpiarFormulario();
        setShowModal(true);
    };

    const handleEditar = (aporte) => {
        setModoEdicion(true);
        setAporteSeleccionado(aporte);
        setFormData({
            idUsuario: aporte.usuario?.idUsuario || '',
            periodo: aporte.periodo || '',
            montoAporte: aporte.montoAporte || '',
            aporteTrabajador: aporte.aporteTrabajador || '',
            aporteEmpleador: aporte.aporteEmpleador || '',
            comisionCobrada: aporte.comisionCobrada || '',
            seguroInvalidez: aporte.seguroInvalidez || '',
            fechaAporte: aporte.fechaAporte || '',
            empleador: aporte.empleador || '',
            rucEmpleador: aporte.rucEmpleador || '',
            salarioDeclarado: aporte.salarioDeclarado || '',
            diasTrabajados: aporte.diasTrabajados || '',
            observaciones: aporte.observaciones || '',
            estado: aporte.estado || 'Registrado'
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este aporte?")) {
            try {
                await AdminAporteService.eliminarAporte(id);
                setSuccessMessage("Aporte eliminado exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                setErrorMessage("Error al eliminar el aporte");
            }
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await AdminAporteService.cambiarEstado(id, nuevoEstado);
            setSuccessMessage("Estado actualizado exitosamente");
            cargarDatos();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setErrorMessage("Error al cambiar el estado");
        }
    };

    const getEstadoBadge = (estado) => {
        const configs = {
            'Registrado': 'bg-blue-100 text-blue-800',
            'Procesado': 'bg-green-100 text-green-800',
            'Observado': 'bg-yellow-100 text-yellow-800',
            'Eliminado': 'bg-red-100 text-red-800'
        };
        return configs[estado] || configs['Registrado'];
    };

    const formatCurrency = (value) => {
        return value ? `S/ ${parseFloat(value).toFixed(2)}` : '-';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-PE');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        
        // Auto-calcular monto total cuando cambian los aportes
        if (name === 'aporteTrabajador' || name === 'aporteEmpleador') {
            const trabajador = parseFloat(name === 'aporteTrabajador' ? value : newFormData.aporteTrabajador) || 0;
            const empleador = parseFloat(name === 'aporteEmpleador' ? value : newFormData.aporteEmpleador) || 0;
            newFormData.montoAporte = (trabajador + empleador).toFixed(2);
        }
        
        setFormData(newFormData);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!formData.idUsuario || !formData.montoAporte || !formData.fechaAporte) {
            setErrorMessage("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const aporteData = {
                ...formData,
                usuario: { idUsuario: parseInt(formData.idUsuario) },
                montoAporte: parseFloat(formData.montoAporte),
                aporteTrabajador: formData.aporteTrabajador ? parseFloat(formData.aporteTrabajador) : null,
                aporteEmpleador: formData.aporteEmpleador ? parseFloat(formData.aporteEmpleador) : null,
                comisionCobrada: formData.comisionCobrada ? parseFloat(formData.comisionCobrada) : null,
                seguroInvalidez: formData.seguroInvalidez ? parseFloat(formData.seguroInvalidez) : null,
                salarioDeclarado: formData.salarioDeclarado ? parseFloat(formData.salarioDeclarado) : null,
                diasTrabajados: formData.diasTrabajados ? parseInt(formData.diasTrabajados) : null
            };

            if (modoEdicion && aporteSeleccionado) {
                await AdminAporteService.actualizarAporte(aporteSeleccionado.idAporte, aporteData);
                setSuccessMessage("Aporte actualizado exitosamente");
            } else {
                await AdminAporteService.crearAporte(aporteData);
                setSuccessMessage("Aporte creado exitosamente");
            }

            setShowModal(false);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar el aporte");
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            idUsuario: '',
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
            estado: 'Registrado'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando aportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Aportes</h1>
                <button
                    onClick={handleNuevo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Aporte
                </button>
            </div>

            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total Aportes</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                        <p className="text-gray-600 text-sm">Registrados</p>
                        <p className="text-2xl font-bold text-blue-800">{estadisticas.registrados}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm">Procesados</p>
                        <p className="text-2xl font-bold text-green-800">{estadisticas.procesados}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
                        <p className="text-gray-600 text-sm">Observados</p>
                        <p className="text-2xl font-bold text-yellow-800">{estadisticas.observados}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200">
                        <p className="text-gray-600 text-sm">Monto Total</p>
                        <p className="text-2xl font-bold text-indigo-800">{formatCurrency(estadisticas.montoTotal)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Todos los usuarios</option>
                        {usuarios.map(usuario => (
                            <option key={usuario.idUsuario} value={usuario.idUsuario}>
                                {usuario.nombre} {usuario.apellido} - {usuario.dni}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="Registrado">Registrado</option>
                        <option value="Procesado">Procesado</option>
                        <option value="Observado">Observado</option>
                        <option value="Eliminado">Eliminado</option>
                    </select>
                    <button
                        onClick={handleBuscar}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Usuario</th>
                                <th className="px-4 py-3 text-left">Periodo</th>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-right">Monto</th>
                                <th className="px-4 py-3 text-left">Empleador</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {aportes.length > 0 ? (
                                aportes.map((aporte) => (
                                    <tr key={aporte.idAporte} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{aporte.idAporte}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <span className="font-medium block">
                                                        {aporte.usuario?.nombre} {aporte.usuario?.apellido}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{aporte.usuario?.dni}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                                {aporte.periodo || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(aporte.fechaAporte)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <span className="text-green-600 font-semibold">
                                                    {formatCurrency(aporte.montoAporte)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <span className="block font-medium">{aporte.empleador || '-'}</span>
                                                <span className="text-xs text-gray-500">{aporte.rucEmpleador || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={aporte.estado}
                                                onChange={(e) => handleCambiarEstado(aporte.idAporte, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(aporte.estado)}`}
                                            >
                                                <option value="Registrado">Registrado</option>
                                                <option value="Procesado">Procesado</option>
                                                <option value="Observado">Observado</option>
                                                <option value="Eliminado">Eliminado</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
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

            {/* Modal de formulario */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? "Editar Aporte" : "Nuevo Aporte"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                                    <select name="idUsuario" value={formData.idUsuario} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="">Seleccionar Usuario</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.idUsuario} value={usuario.idUsuario}>
                                                {usuario.nombre} {usuario.apellido} - {usuario.dni}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Aporte *</label>
                                    <input type="date" name="fechaAporte" value={formData.fechaAporte} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Aporte *</label>
                                    <input type="number" step="0.01" name="montoAporte" value={formData.montoAporte} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                                    <input type="text" name="periodo" value={formData.periodo} onChange={handleFormChange} placeholder="2024-01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aporte Trabajador</label>
                                    <input type="number" step="0.01" name="aporteTrabajador" value={formData.aporteTrabajador} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aporte Empleador</label>
                                    <input type="number" step="0.01" name="aporteEmpleador" value={formData.aporteEmpleador} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisión Cobrada</label>
                                    <input type="number" step="0.01" name="comisionCobrada" value={formData.comisionCobrada} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seguro Invalidez</label>
                                    <input type="number" step="0.01" name="seguroInvalidez" value={formData.seguroInvalidez} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Empleador</label>
                                    <input type="text" name="empleador" value={formData.empleador} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUC Empleador</label>
                                    <input type="text" name="rucEmpleador" value={formData.rucEmpleador} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salario Declarado</label>
                                    <input type="number" step="0.01" name="salarioDeclarado" value={formData.salarioDeclarado} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Días Trabajados</label>
                                    <input type="number" name="diasTrabajados" value={formData.diasTrabajados} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select name="estado" value={formData.estado} onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                        <option value="Registrado">Registrado</option>
                                        <option value="Procesado">Procesado</option>
                                        <option value="Observado">Observado</option>
                                        <option value="Eliminado">Eliminado</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                    <textarea name="observaciones" value={formData.observaciones} onChange={handleFormChange} rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    {modoEdicion ? "Actualizar" : "Crear"} Aporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
