import { Search, User } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/perfil");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Búsqueda */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar transacciones, aportes, alertas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Perfil de usuario */}
        <div
          className="flex items-center space-x-4 cursor-pointer group"
          onClick={handleProfileClick}
          title="Ver perfil"
        >
          <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-emerald-600 transition-colors">
            Bienvenido, {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </span>
          <div className="relative w-10 h-10">
            {user?.fotoPerfil ? (
              <img
                src={user.fotoPerfil}
                alt="Foto de perfil"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-emerald-500 hover:ring-emerald-600 transition-all"
              />
            ) : (
              <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-emerald-500 hover:ring-emerald-600 transition-all">
                <User size={20} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
