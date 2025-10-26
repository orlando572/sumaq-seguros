import { NavLink, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    Building2,
    LogOut,
    ArrowLeftRight
} from "lucide-react";
import SidebarHeader from './SidebarHeader';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCambiarAUsuario = () => {
        navigate('/dashboard');
    };

    const menuItems = [
        { path: "/admin/usuarios", icon: Users, label: "Gestión de Usuarios" },
        { path: "/admin/afps", icon: Building2, label: "Gestión de AFPs" },
    ];

    return (
        <aside className="w-64 bg-indigo-900 h-screen flex flex-col flex-shrink-0">
            <SidebarHeader />
            <div className="px-4 py-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase">Panel Administrador</span>
            </div>
            <nav className="flex-1 mt-2">
                {menuItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-indigo-700 ${isActive ? "bg-indigo-700 border-r-4 border-white" : ""}`
                        }>
                        <Icon size={20} className="text-indigo-200" />
                        <span className="text-white text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-indigo-700">
                <button
                    onClick={handleCambiarAUsuario}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-emerald-600 bg-indigo-800">
                    <ArrowLeftRight size={20} className="text-white" />
                    <span className="text-white text-sm font-medium">Ver como Usuario</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-indigo-700">
                    <LogOut size={20} className="text-indigo-200" />
                    <span className="text-white text-sm font-medium">Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;