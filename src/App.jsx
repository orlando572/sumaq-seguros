import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/user/Login";
import DashboardPage from './pages/user/DashboardPage';
import AsistenciaPage from './pages/user/AsistenciaPage';
import FinancieroPage from './pages/user/FinancieroPage';
import PensionesPage from './pages/user/PensionesPage';
import SegurosPage from './pages/user/SegurosPage';
import ComparadorPage from './pages/user/ComparadorPage';

// Importar páginas de administrador
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsuariosPage from './pages/admin/AdminUsuariosPage';
import AdminAfpsPage from './pages/admin/AdminAfpsPage';

// Componente para proteger rutas de administrador
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : 
          (isAdmin() ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)
        } 
      />
      
      {/* Rutas de Usuario Normal - Los admins también pueden acceder */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="asistencia" element={<AsistenciaPage />} />
        <Route path="financiero" element={<FinancieroPage />} />
        <Route path="pensiones" element={<PensionesPage />} />
        <Route path="seguros" element={<SegurosPage />} />
        <Route path="comparador" element={<ComparadorPage />} />
      </Route>

      {/* Rutas de Administrador */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="afps" element={<AdminAfpsPage />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}