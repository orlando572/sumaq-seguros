import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, X, Layers, LogIn, IdCard } from 'lucide-react';
import UsuarioService from '../service/UsuarioService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loginData, setLoginData] = useState({ dni: '', claveSol: '' });
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', dni: '', fechaNacimiento: '', genero: '',
        estadoCivil: '', correo: '', telefono: '', direccion: '', distrito: '',
        provincia: '', departamento: '', claveSol: '', centroTrabajo: '',
        fechaIngresoTrabajo: '', tipoContrato: '', tipoRegimen: '',
        fechaAfiliacion: '', notificacionesEmail: false, notificacionesSms: false,
    });

    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        UsuarioService.login(loginData.dni, loginData.claveSol)
            .then(response => {
                const userData = response.data;
                login(userData); // Guarda el usuario en el contexto
                navigate('/dashboard');
            })
            .catch(error => {
                console.error("Error al iniciar sesión:", error);
                alert("Credenciales incorrectas o error en el servidor");
            });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        UsuarioService.registrarUsuario(formData)
            .then(response => {
                alert(response.data.mensaje || 'Registro exitoso');
                setIsModalOpen(false);
                setFormData({
                    nombre: '', apellido: '', dni: '', fechaNacimiento: '', genero: '',
                    estadoCivil: '', correo: '', telefono: '', direccion: '', distrito: '',
                    provincia: '', departamento: '', claveSol: '', centroTrabajo: '',
                    fechaIngresoTrabajo: '', tipoContrato: '', tipoRegimen: '',
                    fechaAfiliacion: '', notificacionesEmail: false, notificacionesSms: false,
                    idAfp: '',
                });
            })
            .catch(error => {
                console.error("Error al registrar:", error);
                alert("Error al registrar usuario. Revisa la consola.");
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center mr-2">
                                <Layers className="w-7 h-7 text-black" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800">SumaqSeguros</h1>
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Iniciar sesión</h2>

                    <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="dni"
                            value={loginData.dni}
                            onChange={handleLoginInputChange}
                            placeholder="DNI"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            name="claveSol"
                            value={loginData.claveSol}
                            onChange={handleLoginInputChange}
                            placeholder="Clave SOL"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center">
                        <LogIn className="w-5 h-5 mr-2" />Ingresar
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                        Crear cuenta
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Crear Cuenta</h2>

                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">DNI</label><input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Correo Electrónico</label><input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Teléfono</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Dirección</label><input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Distrito</label><input type="text" name="distrito" value={formData.distrito} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Provincia</label><input type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Departamento</label><input type="text" name="departamento" value={formData.departamento} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Clave SOL</label><input type="password" name="claveSol" value={formData.claveSol} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Centro de Trabajo</label><input type="text" name="centroTrabajo" value={formData.centroTrabajo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Fecha Ingreso a Trabajo</label><input type="date" name="fechaIngresoTrabajo" value={formData.fechaIngresoTrabajo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Fecha Afiliación AFP/ONP</label><input type="date" name="fechaAfiliacion" value={formData.fechaAfiliacion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Género</label><select name="genero" value={formData.genero} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"><option value="">Seleccionar</option><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700">Estado Civil</label><select name="estadoCivil" value={formData.estadoCivil} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"><option value="">Seleccionar</option><option value="Soltero">Soltero</option><option value="Casado">Casado</option><option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700">Tipo Contrato</label><select name="tipoContrato" value={formData.tipoContrato} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"><option value="">Seleccionar</option><option value="Dependiente">Dependiente</option><option value="Independiente">Independiente</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700">Tipo Régimen</label><select name="tipoRegimen" value={formData.tipoRegimen} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"><option value="">Seleccionar</option><option value="ONP">ONP</option><option value="SPP">AFP</option></select></div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">AFP</label>
                                <select
                                    name="idAfp"
                                    value={formData.idAfp || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                    required
                                >
                                    <option value="">Seleccionar AFP</option>
                                    <option value="1">AFP Integra</option>
                                    <option value="2">AFP Prima</option>
                                    <option value="3">AFP Habitat</option>
                                    <option value="4">AFP Profuturo</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 flex items-center space-x-4 mt-2">
                                <label className="flex items-center"><input type="checkbox" name="notificacionesEmail" checked={formData.notificacionesEmail} onChange={handleInputChange} className="h-4 w-4" /> <span className="ml-2 text-sm">Acepto notificaciones por Email</span></label>
                                <label className="flex items-center"><input type="checkbox" name="notificacionesSms" checked={formData.notificacionesSms} onChange={handleInputChange} className="h-4 w-4" /> <span className="ml-2 text-sm">Acepto notificaciones por SMS</span></label>
                            </div>

                            <button type="submit" className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg mt-4 flex items-center justify-center"><UserPlus className="w-5 h-5 mr-2" />Registrarse</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}