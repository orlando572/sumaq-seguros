import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Dashboard
            </h1>
            <div className="space-y-4">
                <p className="text-gray-600">
                    Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">DNI</p>
                        <p className="text-xl font-bold text-emerald-700">{user?.dni}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Correo</p>
                        <p className="text-xl font-bold text-blue-700">{user?.correo}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="text-xl font-bold text-purple-700">{user?.telefono}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;