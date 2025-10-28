import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, User } from 'lucide-react';
import AdminUsuarioService from '../../service/admin/AdminUsuarioService';
import UsuarioService from '../../service/user/UsuarioService';

export default function AdminUsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [roles, setRoles] = useState([]);
    const [afps, setAfps] = useState([]);

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', dni: '', fechaNacimiento: '', genero: '',
        estadoCivil: '', correo: '', telefono: '', direccion: '', distrito: '',
        provincia: '', departamento: '', claveSol: '', centroTrabajo: '',
        salarioActual: '', fechaIngresoTrabajo: '', tipoContrato: '',
        cuspp: '', idAfp: '', tipoRegimen: '', fechaAfiliacion: '',
        notificacionesEmail: false, notificacionesSms: false, estado: 'Activo',
        idRol: ''
    });

    useEffect(() => {
        cargarDatos();
        cargarRoles();
        cargarAfps();
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
            const [usuariosRes, statsRes] = await Promise.all([
                AdminUsuarioService.listarUsuarios(busqueda, filtroEstado),
                AdminUsuarioService.obtenerEstadisticas()
            ]);
            setUsuarios(usuariosRes.data);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar los datos");
        }
        setLoading(false);
    };

    const cargarRoles = async () => {
        try {
            const response = await UsuarioService.listarRoles();
            setRoles(response.data);
        } catch (error) {
            console.error("Error al cargar roles:", error);
        }
    };

    const cargarAfps = async () => {
        try {
            const response = await UsuarioService.listarAfps();
            setAfps(response.data);
        } catch (error) {
            console.error("Error al cargar AFPs:", error);
        }
    };

    const handleBuscar = () => {
        cargarDatos();
    };

    const handleNuevo = () => {
        setModoEdicion(false);
        setUsuarioSeleccionado(null);
        limpiarFormulario();
        setShowModal(true);
    };

    const handleEditar = (usuario) => {
        setModoEdicion(true);
        setUsuarioSeleccionado(usuario);
        setFormData({
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            dni: usuario.dni || '',
            fechaNacimiento: usuario.fechaNacimiento || '',
            genero: usuario.genero || '',
            estadoCivil: usuario.estadoCivil || '',
            correo: usuario.correo || '',
            telefono: usuario.telefono || '',
            direccion: usuario.direccion || '',
            distrito: usuario.distrito || '',
            provincia: usuario.provincia || '',
            departamento: usuario.departamento || '',
            claveSol: usuario.claveSol || '',
            centroTrabajo: usuario.centroTrabajo || '',
            salarioActual: usuario.salarioActual || '',
            fechaIngresoTrabajo: usuario.fechaIngresoTrabajo || '',
            tipoContrato: usuario.tipoContrato || '',
            cuspp: usuario.cuspp || '',
            idAfp: usuario.afp?.idAfp || '',
            tipoRegimen: usuario.tipoRegimen || '',
            fechaAfiliacion: usuario.fechaAfiliacion || '',
            notificacionesEmail: usuario.notificacionesEmail || false,
            notificacionesSms: usuario.notificacionesSms || false,
            estado: usuario.estado || 'Activo',
            idRol: usuario.rol?.idRol || ''
        });
        setShowModal(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await AdminUsuarioService.eliminarUsuario(id);
                setSuccessMessage("Usuario eliminado exitosamente");
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar:", error);
                setErrorMessage("Error al eliminar el usuario");
            }
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await AdminUsuarioService.cambiarEstado(id, nuevoEstado);
            setSuccessMessage("Estado actualizado exitosamente");
            cargarDatos();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setErrorMessage("Error al cambiar el estado");
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            // Si cambia el régimen a ONP, limpiar el campo AFP
            if (name === 'tipoRegimen' && value === 'ONP') {
                newState.idAfp = '';
            }
            
            return newState;
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.dni || !formData.correo) {
            setErrorMessage("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const usuarioData = {
                ...formData,
                rol: formData.idRol ? { idRol: parseInt(formData.idRol) } : null,
                afp: (formData.idAfp && formData.idAfp !== '') ? { idAfp: parseInt(formData.idAfp) } : null,
                salarioActual: formData.salarioActual ? parseFloat(formData.salarioActual) : null
            };

            if (modoEdicion && usuarioSeleccionado) {
                await AdminUsuarioService.actualizarUsuario(usuarioSeleccionado.idUsuario, usuarioData);
                setSuccessMessage("Usuario actualizado exitosamente");
            } else {
                await AdminUsuarioService.crearUsuario(usuarioData);
                setSuccessMessage("Usuario creado exitosamente");
            }

            setShowModal(false);
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrorMessage(error.response?.data?.mensaje || "Error al guardar el usuario");
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '', apellido: '', dni: '', fechaNacimiento: '', genero: '',
            estadoCivil: '', correo: '', telefono: '', direccion: '', distrito: '',
            provincia: '', departamento: '', claveSol: '', centroTrabajo: '',
            salarioActual: '', fechaIngresoTrabajo: '', tipoContrato: '',
            cuspp: '', idAfp: '', tipoRegimen: '', fechaAfiliacion: '',
            notificacionesEmail: false, notificacionesSms: false, estado: 'Activo',
            idRol: ''
        });
    };

    const getEstadoBadge = (estado) => {
        const configs = {
            'Activo': 'bg-green-100 text-green-800',
            'Inactivo': 'bg-gray-100 text-gray-800',
            'Bloqueado': 'bg-red-100 text-red-800'
        };
        return configs[estado] || configs['Activo'];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
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
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <button
                    onClick={handleNuevo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">Total Usuarios</p>
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
                    <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
                        <p className="text-gray-600 text-sm">Bloqueados</p>
                        <p className="text-2xl font-bold text-red-800">{estadisticas.bloqueados}</p>
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
                                placeholder="Buscar por nombre, apellido o DNI..."
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
                        <option value="Bloqueado">Bloqueado</option>
                    </select>
                    <button
                        onClick={handleBuscar}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">DNI</th>
                                <th className="px-4 py-3 text-left">Correo</th>
                                <th className="px-4 py-3 text-left">Rol</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuarios.length > 0 ? (
                                usuarios.map((usuario) => (
                                    <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{usuario.idUsuario}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="font-medium">{usuario.nombre} {usuario.apellido}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{usuario.dni}</td>
                                        <td className="px-4 py-3">{usuario.correo}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                {usuario.rol?.nombreRol || 'Sin rol'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={usuario.estado}
                                                onChange={(e) => handleCambiarEstado(usuario.idUsuario, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(usuario.estado)}`}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                                <option value="Bloqueado">Bloqueado</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(usuario)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(usuario.idUsuario)}
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
                                        No hay usuarios registrados
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
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                        maxLength="8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                    <select
                                        name="genero"
                                        value={formData.genero}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                                    <select
                                        name="estadoCivil"
                                        value={formData.estadoCivil}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Soltero">Soltero</option>
                                        <option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option>
                                        <option value="Viudo">Viudo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                    <select
                                        name="idRol"
                                        value={formData.idRol}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar Rol</option>
                                        {roles.map(rol => (
                                            <option key={rol.idRol} value={rol.idRol}>{rol.nombreRol}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Régimen</label>
                                    <select
                                        name="tipoRegimen"
                                        value={formData.tipoRegimen}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="ONP">ONP</option>
                                        <option value="SPP">AFP (SPP)</option>
                                    </select>
                                </div>
                                {formData.tipoRegimen === 'SPP' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">AFP</label>
                                        <select
                                            name="idAfp"
                                            value={formData.idAfp}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Seleccionar AFP</option>
                                            {afps.map(afp => (
                                                <option key={afp.idAfp} value={afp.idAfp}>{afp.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Clave SOL</label>
                                    <input
                                        type="password"
                                        name="claveSol"
                                        value={formData.claveSol}
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
                                        <option value="Bloqueado">Bloqueado</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
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
                                    {modoEdicion ? "Actualizar" : "Crear"} Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}