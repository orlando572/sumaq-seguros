import React from 'react';
import { useAuth } from '../context/AuthContext';

const PensionesPage = () => {
    const { user } = useAuth();
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Gestión de Pensiones
            </h1>
            
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Información Laboral</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Centro de Trabajo</p>
                            <p className="font-medium">{user?.centroTrabajo || 'No registrado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tipo de Régimen</p>
                            <p className="font-medium">{user?.tipoRegimen || 'No registrado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tipo de Contrato</p>
                            <p className="font-medium">{user?.tipoContrato || 'No registrado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fecha de Afiliación</p>
                            <p className="font-medium">
                                {user?.fechaAfiliacion ? 
                                    new Date(user.fechaAfiliacion).toLocaleDateString() : 
                                    'No registrado'
                                }
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">Estado de Aportes</h3>
                    <p className="text-gray-600">
                        Aquí podrás ver tu historial de aportes y proyecciones
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PensionesPage;