import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    TrendingUp, 
    TrendingDown,
    DollarSign, 
    Shield, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Activity,
    Users,
    CreditCard,
    Briefcase,
    Calendar,
    FileText,
    AlertCircle,
    PieChart,
    BarChart3,
    MessageSquare
} from 'lucide-react';
import DashboardService from '../../service/user/DashboardService';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.idUsuario) {
            cargarDatos();
        }
    }, [user]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const response = await DashboardService.obtenerResumenCompleto(user.idUsuario);
            setResumen(response.data);
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
        } finally {
            setLoading(false);
        }
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
        return date.toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getAlertIcon = (iconName) => {
        const icons = {
            'AlertTriangle': AlertTriangle,
            'CreditCard': CreditCard,
            'FileText': FileText,
            'AlertCircle': AlertCircle
        };
        return icons[iconName] || AlertCircle;
    };

    const getAlertColor = (tipo) => {
        const colors = {
            'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
            'danger': 'bg-red-50 border-red-200 text-red-800',
            'info': 'bg-blue-50 border-blue-200 text-blue-800',
            'success': 'bg-green-50 border-green-200 text-green-800'
        };
        return colors[tipo] || colors['info'];
    };

    const getActivityIcon = (iconName) => {
        const icons = {
            'DollarSign': DollarSign,
            'Shield': Shield,
            'TrendingUp': TrendingUp,
            'BarChart': BarChart3,
            'Activity': Activity
        };
        return icons[iconName] || Activity;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!resumen) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Error al cargar la información del dashboard</p>
                </div>
            </div>
        );
    }

    const infoPersonal = resumen.infoPersonal || {};
    const resumenFinanciero = resumen.resumenFinanciero || {
        saldoTotal: 0,
        saldoDisponible: 0,
        aportesYearActual: 0,
        proyeccionPensionMensual: 0,
        rentabilidadPromedio: 0
    };
    const resumenSeguros = resumen.resumenSeguros || {
        totalSeguros: 0,
        segurosActivos: 0,
        primaMensualTotal: 0,
        coberturaTotal: 0
    };
    const alertas = resumen.alertas || { alertas: [], totalAlertas: 0 };
    const actividadReciente = resumen.actividadReciente || { actividades: [] };
    const estadisticasYear = resumen.estadisticasYear || [];
    const infoPensiones = resumen.infoPensiones || {
        tipoRegimen: 'No especificado',
        afp: 'No afiliado',
        cuspp: null,
        fechaAfiliacion: null
    };

    // Debug
    console.log('estadisticasYear:', estadisticasYear);

    return (
        <div className="space-y-6">
            {/* Header con saludo personalizado */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {infoPersonal.fotoPerfil ? (
                            <img 
                                src={infoPersonal.fotoPerfil} 
                                alt="Foto de perfil" 
                                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">¡Hola, {infoPersonal.nombre.split(' ')[0]}!</h1>
                            <p className="text-emerald-100 mt-1">
                                Bienvenido a tu SumaqSeguros
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertas importantes */}
            {alertas && alertas.totalAlertas > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Alertas y Notificaciones ({alertas.totalAlertas})
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alertas.alertas.map((alerta, index) => {
                            const IconComponent = getAlertIcon(alerta.icono);
                            return (
                                <div 
                                    key={index} 
                                    className={`p-4 rounded-lg border ${getAlertColor(alerta.tipo)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm mb-1">
                                                {alerta.titulo}
                                            </h3>
                                            <p className="text-sm">
                                                {alerta.mensaje}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Resumen Financiero - Tarjetas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Saldo Total */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Pensiones
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Saldo Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(resumenFinanciero.saldoTotal)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Disponible: {formatCurrency(resumenFinanciero.saldoDisponible)}
                    </p>
                </div>

                {/* Aportes del Año */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {new Date().getFullYear()}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Aportes del Año</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(resumenFinanciero.aportesYearActual)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        Acumulado anual
                    </p>
                </div>

                {/* Proyección Pensión */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            Proyección
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Pensión Estimada</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(resumenFinanciero.proyeccionPensionMensual)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Mensual aproximado
                    </p>
                </div>

                {/* Seguros Activos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Seguros
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Pólizas Activas</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {resumenSeguros.segurosActivos}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Prima mensual: {formatCurrency(resumenSeguros.primaMensualTotal)}
                    </p>
                </div>
            </div>

            {/* Información de Pensiones y Cobertura de Seguros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de Pensiones */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Información de Pensiones
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Tipo de Régimen</span>
                            <span className="font-semibold text-gray-900">
                                {infoPensiones.tipoRegimen}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">AFP</span>
                            <span className="font-semibold text-gray-900">
                                {infoPensiones.afp}
                            </span>
                        </div>
                        {infoPensiones.cuspp && (
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 text-sm">CUSPP</span>
                                <span className="font-mono text-sm text-gray-700">
                                    {infoPensiones.cuspp}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600 text-sm">Fecha de Afiliación</span>
                            <span className="text-gray-900">
                                {formatDate(infoPensiones.fechaAfiliacion)}
                            </span>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-900">
                                    Rentabilidad Promedio
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">
                                {resumenFinanciero.rentabilidadPromedio}%
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">Anual aproximado</p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Seguros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Resumen de Seguros
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Total de Seguros</span>
                            <span className="font-semibold text-gray-900">
                                {resumenSeguros.totalSeguros}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Pólizas Activas</span>
                            <span className="font-semibold text-emerald-600">
                                {resumenSeguros.segurosActivos}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Prima Mensual Total</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(resumenSeguros.primaMensualTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600 text-sm">Cobertura Total</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(resumenSeguros.coberturaTotal)}
                            </span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    Protección Total
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatCurrency(resumenSeguros.coberturaTotal)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">Suma asegurada</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Aportes por Año y Actividad Reciente */}
        

            {/* Accesos Rápidos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Accesos Rápidos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                        onClick={() => navigate('/pensiones')}
                        className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
                    >
                        <Users className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-900">Gestión de Pensiones</p>
                    </button>
                    <button 
                        onClick={() => navigate('/seguros')}
                        className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group"
                    >
                        <Shield className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-900">Gestión de Seguros</p>
                    </button>
                    <button 
                        onClick={() => navigate('/comparador')}
                        className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group"
                    >
                        <BarChart3 className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-900">Comparador</p>
                    </button>
                    <button 
                        onClick={() => navigate('/asistencia')}
                        className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all group"
                    >
                        <MessageSquare className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-900">Asistencia Virtual</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;