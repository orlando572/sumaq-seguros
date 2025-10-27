import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);

    // Cargar usuario y token del localStorage al iniciar
    useEffect(() => {
        const savedToken = authService.getToken();
        const savedUser = authService.getCurrentUser();
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (loginData) => {
        // loginData contiene: { token, usuario, mensaje }
        setToken(loginData.token);
        setUser(loginData.usuario);
        setIsAuthenticated(true);
        // El token ya se guarda en authService.login()
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

     // Actualizar información del usuario en el contexto
    const updateUser = (updatedUserData) => {
        // Actualizar el usuario en el estado
        setUser(updatedUserData);
        // Actualizar también en localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    // Verificar si el usuario es administrador
    const isAdmin = () => {
        return user?.rol?.idRol === 1; // ID 1 para Administrador
    };

    // Verificar si el usuario es usuario regular
    const isRegularUser = () => {
        return user?.rol?.idRol === 2; // ID 2 para Usuario
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isAdmin,
        isRegularUser,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;