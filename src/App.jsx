import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import Layout from "./components/Layout";
import Login from "./pages/Login";
import DashboardPage from './pages/DashboardPage';
import AsistenciaPage from './pages/AsistenciaPage';
import FinancieroPage from './pages/FinancieroPage';
import PensionesPage from './pages/PensionesPage';
import SegurosPage from './pages/SegurosPage';
import ComparadorPage from './pages/ComparadorPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
      />
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
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
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