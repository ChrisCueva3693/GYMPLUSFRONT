import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    UserCheck,
    CreditCard,
    ShoppingCart,
    FileText,
    Users,
    Building2,
    MapPin,
    LogOut,
    Menu,
    X,
    Package
} from 'lucide-react';
import './DashboardLayout.css';
import BranchSelector from '../components/BranchSelector';

const DashboardLayout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Track screen resize
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['DEV', 'ADMIN'] },
        { path: '/inicio', icon: UserCheck, label: 'Inicio', roles: ['CLIENTE'] },
        { path: '/checkin', icon: UserCheck, label: 'Entradas', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/membresias', icon: CreditCard, label: 'Membresías', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/tipos-membresia', icon: Users, label: 'Tipos Membresia', roles: ['DEV', 'ADMIN'] },
        { path: '/ventas', icon: ShoppingCart, label: 'Ventas', roles: ['DEV', 'ADMIN', 'COACH'] },

        { path: '/usuarios', icon: Users, label: 'Usuarios', roles: ['DEV', 'ADMIN'] },
        { path: '/clientes', icon: Users, label: 'Clientes', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/reportes', icon: FileText, label: 'Reportes', roles: ['DEV', 'ADMIN'] },
        { path: '/gimnasios', icon: Building2, label: 'Gimnasios', roles: ['DEV'] },
        { path: '/sucursales', icon: MapPin, label: 'Sucursales', roles: ['DEV', 'ADMIN'] },
        { path: '/productos', icon: Package, label: 'Productos', roles: ['DEV', 'ADMIN'] },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">GP</div>
                        {sidebarOpen && <span className="logo-text">GymPlus</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems
                        .filter(item => !item.roles || item.roles.some(role => user?.roles?.includes(role)))
                        .map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                title={item.label}
                                onClick={() => isMobile && setSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        ))}
                </nav>

                <div className="sidebar-footer">
                    <div className={`user-info ${!sidebarOpen ? 'collapsed' : ''}`}>
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="user-details">
                                <p className="user-name">{user?.nombreCompleto || user?.username}</p>
                                <p className="user-role">{user?.roles?.[0] || 'Usuario'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Cerrar sesión"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay Backdrop */}
            {isMobile && sidebarOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 90
                    }}
                />
            )}

            {/* Main Content */}
            <div className="main-content">
                <header className="top-header">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="toggle-sidebar-btn"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="header-title">
                        <h2>{menuItems.find(item => isActive(item.path))?.label || 'GymPlus'}</h2>
                    </div>

                    <div className="header-actions">
                        <BranchSelector />
                        {/* Placeholder for additional actions */}
                    </div>
                </header>

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
