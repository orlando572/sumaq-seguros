import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminSegurosService from '../../service/admin/AdminSegurosService';
import CatalogosService from '../../service/user/CatalogosService';

export default function AdminSegurosPage() {
    const [seguros, setSeguros] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ totalSeguros: 0, segurosActivos: 0, segurosVencidos: 0, montoTotalAsegurado: 0 });
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [seguroSeleccionado, setSeguroSeleccionado] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [tiposSeguros, setTiposSeguros] = useState([]);
    const [companias, setCompanias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [formData, setFormData] = useState({
        idUsuario: '', idTipoSeguro: '', idCompania: '', numeroPoliza: '',
        fechaInicio: '', fechaVencimiento: '', montoAsegurado: '', primaMensual: '',
        formaPago: 'Mensual', estado: 'Activo'
    });

    useEffect(() => {
        cargarDatos();
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => { setSuccessMessage(''); setErrorMessage(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [segurosRes, statsRes] = await Promise.all([
                AdminSegurosService.listarTodosSeguros(busqueda, filtroEstado),
                AdminSegurosService.obtenerEstadisticas()
            ]);
            setSeguros(segurosRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Error al cargar datos");
        }
        setLoading(false);
    };

    const cargarCatalogos = async () => {
        try {
            const [tiposRes, companiasRes, usuariosRes] = await Promise.all([
                CatalogosService.obtenerTiposSeguros(),
                CatalogosService.obtenerCompanias(),
                AdminSegurosService.listarUsuarios()
            ]);
            setTiposSeguros(tiposRes.data || []);
            setCompanias(companiasRes.data || []);
            setUsuarios(usuariosRes.data || []);
        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        }
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setSeguroSeleccionado(null);
        setFormData({ idUsuario: '', idTipoSeguro: '', idCompania: '', numeroPoliza: '', fechaInicio: '', fechaVencimiento: '', montoAsegurado: '', primaMensual: '', formaPago: 'Mensual', estado: 'Activo' });
        setShowModal(true);
    };

    const handleEditar = (seguro) => {
        setModoEdicion(true);
        setSeguroSeleccionado(seguro);
        setFormData({
            idUsuario: seguro.usuario?.idUsuario || '',
            idTipoSeguro: seguro.tipoSeguro?.idTipoSeguro || '',
            idCompania: seguro.compania?.idCompania || '',
            numeroPoliza: seguro.numeroPoliza || '',
            fechaInicio: seguro.fechaInicio || '',
            fechaVencimiento: seguro.fechaVencimiento || '',
            montoAsegurado: seguro.montoAsegurado || '',
            primaMensual: seguro.primaMensual || '',
            formaPago: seguro.formaPago || 'Mensual',
            estado: seguro.estado || 'Activo'
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar este seguro?")) {
            try {
                await AdminSegurosService.eliminarSeguro(id);
                setSuccessMessage("Seguro eliminado");
                cargarDatos();
            } catch (error) {
                setErrorMessage("Error al eliminar");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const seguroData = {
                usuario: { idUsuario: parseInt(formData.idUsuario) },
                tipoSeguro: { idTipoSeguro: parseInt(formData.idTipoSeguro) },
                compania: { idCompania: parseInt(formData.idCompania) },
                numeroPoliza: formData.numeroPoliza,
                fechaInicio: formData.fechaInicio,
                fechaVencimiento: formData.fechaVencimiento,
                montoAsegurado: parseFloat(formData.montoAsegurado),
                primaMensual: parseFloat(formData.primaMensual),
                formaPago: formData.formaPago,
                estado: formData.estado
            };

            if (modoEdicion) {
                await AdminSegurosService.actualizarSeguro(seguroSeleccionado.idSeguro, seguroData);
                setSuccessMessage("Seguro actualizado");
            } else {
                await AdminSegurosService.crearSeguro(seguroData);
                setSuccessMessage("Seguro creado");
            }
            setShowModal(false);
            cargarDatos();
        } catch (error) {
            setErrorMessage("Error al guardar");
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-PE') : '-';
    const getEstadoBadge = (estado) => {
        const badges = { 'Activo': 'bg-green-100 text-green-800', 'Vigente': 'bg-green-100 text-green-800', 'Vencido': 'bg-red-100 text-red-800', 'Cancelado': 'bg-gray-100 text-gray-800' };
        return badges[estado] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando seguros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />{successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />{errorMessage}
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Seguros</h1>
                <button onClick={handleNuevo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" />Nuevo Seguro
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total Seguros</p>
                        <p className="text-2xl font-bold text-gray-800">{estadisticas.totalSeguros}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                        <p className="text-gray-600 text-sm">Activos</p>
                        <p className="text-2xl font-bold text-green-800">{estadisticas.segurosActivos}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
                        <p className="text-gray-600 text-sm">Vencidos</p>
                        <p className="text-2xl font-bold text-red-800">{estadisticas.segurosVencidos}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200">
                        <p className="text-gray-600 text-sm">Monto Total</p>
                        <p className="text-xl font-bold text-indigo-800">{formatCurrency(estadisticas.montoTotalAsegurado)}</p>
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
                                placeholder="Buscar por número de póliza o usuario..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && cargarDatos()}
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
                        <option value="Vigente">Vigente</option>
                        <option value="Vencido">Vencido</option>
                    </select>
                    <button
                        onClick={cargarDatos}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Tabla de seguros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Usuario</th>
                                    <th className="px-4 py-3 text-left">Póliza</th>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Compañía</th>
                                    <th className="px-4 py-3 text-left">Monto</th>
                                    <th className="px-4 py-3 text-left">Prima</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {seguros.length === 0 ? (
                                    <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No hay seguros</td></tr>
                                ) : (
                                    seguros.map((seguro) => (
                                        <tr key={seguro.idSeguro} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">{seguro.usuario?.nombre} {seguro.usuario?.apellido}</div>
                                                <div className="text-sm text-gray-500">{seguro.usuario?.dni}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{seguro.numeroPoliza}</td>
                                            <td className="px-4 py-3 text-sm">{seguro.tipoSeguro?.nombre}</td>
                                            <td className="px-4 py-3 text-sm">{seguro.compania?.nombre}</td>
                                            <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(seguro.montoAsegurado)}</td>
                                            <td className="px-4 py-3 text-sm">{formatCurrency(seguro.primaMensual)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(seguro.estado)}`}>
                                                    {seguro.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleEditar(seguro)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleEliminar(seguro.idSeguro)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{modoEdicion ? 'Editar' : 'Nuevo'} Seguro</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Usuario *</label>
                                    <select name="idUsuario" value={formData.idUsuario} onChange={(e) => setFormData({...formData, idUsuario: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="">Seleccione</option>
                                        {usuarios.map(u => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                                    <select name="idTipoSeguro" value={formData.idTipoSeguro} onChange={(e) => setFormData({...formData, idTipoSeguro: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="">Seleccione</option>
                                        {tiposSeguros.map(t => <option key={t.idTipoSeguro} value={t.idTipoSeguro}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Compañía *</label>
                                    <select name="idCompania" value={formData.idCompania} onChange={(e) => setFormData({...formData, idCompania: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="">Seleccione</option>
                                        {companias.map(c => <option key={c.idCompania} value={c.idCompania}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nº Póliza *</label>
                                    <input type="text" value={formData.numeroPoliza} onChange={(e) => setFormData({...formData, numeroPoliza: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Inicio *</label>
                                    <input type="date" value={formData.fechaInicio} onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha Vencimiento *</label>
                                    <input type="date" value={formData.fechaVencimiento} onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monto Asegurado *</label>
                                    <input type="number" step="0.01" value={formData.montoAsegurado} onChange={(e) => setFormData({...formData, montoAsegurado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prima Mensual *</label>
                                    <input type="number" step="0.01" value={formData.primaMensual} onChange={(e) => setFormData({...formData, primaMensual: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Forma de Pago *</label>
                                    <select value={formData.formaPago} onChange={(e) => setFormData({...formData, formaPago: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="Mensual">Mensual</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estado *</label>
                                    <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="Activo">Activo</option>
                                        <option value="Vigente">Vigente</option>
                                        <option value="Vencido">Vencido</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{modoEdicion ? 'Actualizar' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
