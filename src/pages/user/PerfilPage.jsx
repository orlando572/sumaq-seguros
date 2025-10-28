import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, AlertCircle, CheckCircle2, User, Mail, Phone, MapPin, Briefcase, Shield, Bell } from 'lucide-react';
import PerfilService from '../../service/user/PerfilService';
import UsuarioService from '../../service/user/UsuarioService';
import ImageUploader from '../../components/ImageUploader';

export default function PerfilPage() {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [roles, setRoles] = useState([]);
    const [afps, setAfps] = useState([]);

    const [formData, setFormData] = useState({
        // Información Personal
        nombre: '',
        apellido: '',
        dni: '',
        fechaNacimiento: '',
        genero: '',
        estadoCivil: '',
        
        // Información de Contacto
        correo: '',
        telefono: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        
        // Información Laboral
        centroTrabajo: '',
        salarioActual: '',
        fechaIngresoTrabajo: '',
        tipoContrato: '',
        
        // Información de Pensiones
        cuspp: '',
        idAfp: '',
        tipoRegimen: '',
        fechaAfiliacion: '',
        
        // Preferencias
        notificacionesEmail: false,
        notificacionesSms: false,
        
        // Foto de Perfil
        fotoPerfil: ''
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
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [perfilRes, rolesRes, afpsRes] = await Promise.all([
                PerfilService.obtenerPerfil(user.idUsuario),
                UsuarioService.listarRoles(),
                UsuarioService.listarAfps()
            ]);

            const perfil = perfilRes.data;
            
            setFormData({
                nombre: perfil.nombre || '',
                apellido: perfil.apellido || '',
                dni: perfil.dni || '',
                fechaNacimiento: perfil.fechaNacimiento || '',
                genero: perfil.genero || '',
                estadoCivil: perfil.estadoCivil || '',
                correo: perfil.correo || '',
                telefono: perfil.telefono || '',
                direccion: perfil.direccion || '',
                distrito: perfil.distrito || '',
                provincia: perfil.provincia || '',
                departamento: perfil.departamento || '',
                centroTrabajo: perfil.centroTrabajo || '',
                salarioActual: perfil.salarioActual || '',
                fechaIngresoTrabajo: perfil.fechaIngresoTrabajo || '',
                tipoContrato: perfil.tipoContrato || '',
                cuspp: perfil.cuspp || '',
                idAfp: perfil.idAfp || '',
                tipoRegimen: perfil.tipoRegimen || '',
                fechaAfiliacion: perfil.fechaAfiliacion || '',
                notificacionesEmail: perfil.notificacionesEmail || false,
                notificacionesSms: perfil.notificacionesSms || false,
                fotoPerfil: perfil.fotoPerfil || ''
            });

            setRoles(rolesRes.data);
            setAfps(afpsRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar la información del perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (base64Image) => {
        setFormData(prev => ({
            ...prev,
            fotoPerfil: base64Image
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.nombre || !formData.apellido || !formData.dni || !formData.correo) {
            setErrorMessage("Por favor completa los campos obligatorios (Nombre, Apellido, DNI, Correo)");
            return;
        }

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await PerfilService.actualizarPerfil(user.idUsuario, formData);
            
            setSuccessMessage("¡Perfil actualizado exitosamente!");
            
            // Actualizar el contexto de usuario con los nuevos datos
            const usuarioActualizado = response.data.data;
            login(usuarioActualizado);
            
            // Recargar datos para obtener la información completa
            setTimeout(() => {
                cargarDatos();
            }, 1000);
            
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            const mensaje = error.response?.data?.mensaje || "Error al actualizar el perfil";
            setErrorMessage(mensaje);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Mensajes */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuración de Perfil</h1>
                <p className="text-gray-600 mt-1">Administra tu información personal y preferencias</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Foto de Perfil */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Foto de Perfil</h2>
                    </div>
                    <ImageUploader 
                        currentImage={formData.fotoPerfil}
                        onImageChange={handleImageChange}
                    />
                </div>

                {/* Información Personal */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Información Personal</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                DNI *
                            </label>
                            <input
                                type="text"
                                name="dni"
                                value={formData.dni}
                                onChange={handleInputChange}
                                maxLength="8"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Género
                            </label>
                            <select
                                name="genero"
                                value={formData.genero}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado Civil
                            </label>
                            <select
                                name="estadoCivil"
                                value={formData.estadoCivil}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Soltero">Soltero</option>
                                <option value="Casado">Casado</option>
                                <option value="Divorciado">Divorciado</option>
                                <option value="Viudo">Viudo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Mail className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Información de Contacto</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distrito
                            </label>
                            <input
                                type="text"
                                name="distrito"
                                value={formData.distrito}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provincia
                            </label>
                            <input
                                type="text"
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Departamento
                            </label>
                            <input
                                type="text"
                                name="departamento"
                                value={formData.departamento}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Información Laboral */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Información Laboral</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Centro de Trabajo
                            </label>
                            <input
                                type="text"
                                name="centroTrabajo"
                                value={formData.centroTrabajo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Salario Actual
                            </label>
                            <input
                                type="number"
                                name="salarioActual"
                                value={formData.salarioActual}
                                onChange={handleInputChange}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Ingreso Trabajo
                            </label>
                            <input
                                type="date"
                                name="fechaIngresoTrabajo"
                                value={formData.fechaIngresoTrabajo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Contrato
                            </label>
                            <select
                                name="tipoContrato"
                                value={formData.tipoContrato}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Dependiente">Dependiente</option>
                                <option value="Independiente">Independiente</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Información de Pensiones */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Información de Pensiones</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CUSPP
                            </label>
                            <input
                                type="text"
                                name="cuspp"
                                value={formData.cuspp}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Régimen
                            </label>
                            <select
                                name="tipoRegimen"
                                value={formData.tipoRegimen}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar</option>
                                <option value="ONP">ONP</option>
                                <option value="SPP">SPP (AFP)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                AFP
                            </label>
                            <select
                                name="idAfp"
                                value={formData.idAfp}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">Ninguna</option>
                                {afps.map(afp => (
                                    <option key={afp.idAfp} value={afp.idAfp}>
                                        {afp.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Afiliación
                            </label>
                            <input
                                type="date"
                                name="fechaAfiliacion"
                                value={formData.fechaAfiliacion}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferencias de Notificaciones */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Bell className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Preferencias de Notificaciones</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="notificacionesEmail"
                                checked={formData.notificacionesEmail}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Notificaciones por Email
                                </span>
                                <p className="text-xs text-gray-500">
                                    Recibe actualizaciones y alertas en tu correo electrónico
                                </p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="notificacionesSms"
                                checked={formData.notificacionesSms}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Notificaciones por SMS
                                </span>
                                <p className="text-xs text-gray-500">
                                    Recibe alertas importantes en tu teléfono móvil
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => cargarDatos()}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            saving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}