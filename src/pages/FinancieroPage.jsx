import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FinancieroPage = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    
    useEffect(() => {
        if (user?.idUsuario) {
            // Hacer petición al backend usando el ID del usuario
            axios.get(`http://localhost:8090/api/productos/${user.idUsuario}`)
                .then(response => {
                    setProductos(response.data);
                })
                .catch(error => {
                    console.error("Error al cargar productos:", error);
                });
        }
    }, [user]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Panel Financiero
            </h1>
            <p className="text-gray-600 mb-4">
                Usuario: {user?.nombre} {user?.apellido}
            </p>
            <div className="mt-4">
                <h3 className="font-semibold mb-2">Mis Productos</h3>
                {productos.length > 0 ? (
                    <ul>
                        {productos.map(prod => (
                            <li key={prod.id}>{prod.nombre}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay productos registrados</p>
                )}
            </div>
        </div>
    );
};

export default FinancieroPage;