import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    UserCheck,
    CreditCard,
    ShoppingCart,
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['DEV', 'ADMIN', 'COACH', 'CLIENTE'] },
        { path: '/checkin', icon: UserCheck, label: 'Check-In', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/membresias', icon: CreditCard, label: 'Membresías', roles: ['DEV', 'ADMIN'] },
        { path: '/ventas', icon: ShoppingCart, label: 'Ventas', roles: ['DEV', 'ADMIN'] },
        { path: '/usuarios', icon: Users, label: 'Usuarios', roles: ['DEV', 'ADMIN'] },
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
