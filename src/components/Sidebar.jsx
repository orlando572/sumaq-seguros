import React from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, CreditCard, Users, Shield, BarChart3, LogOut } from "lucide-react";
import SidebarHeader from './SidebarHeader';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/asistencia", icon: MessageSquare, label: "Asistencia Virtual" },
        { path: "/financiero", icon: CreditCard, label: "Panel Financiero" },
        { path: "/pensiones", icon: Users, label: "Gestión de Pensiones" },
        { path: "/seguros", icon: Shield, label: "Gestión de Seguros" },
        { path: "/comparador", icon: BarChart3, label: "Comparador" },
    ];

    return (
        <aside className="w-64 bg-emerald-900 h-screen flex flex-col flex-shrink-0">
            <SidebarHeader />
            <nav className="flex-1 mt-4">
                {menuItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-emerald-700 ${isActive ? "bg-emerald-700 border-r-4 border-white" : ""}`
                        }>
                        <Icon size={20} className="text-emerald-200" />
                        <span className="text-white text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-emerald-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-emerald-700">
                    <LogOut size={20} className="text-emerald-200" />
                    <span className="text-white text-sm font-medium">Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;