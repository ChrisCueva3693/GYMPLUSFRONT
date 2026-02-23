import React, { useState, useEffect, useRef } from 'react';
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
    Package,
    Sun,
    Moon,
    ChevronDown,
    Zap
} from 'lucide-react';
import './DashboardLayout.css';
import BranchSelector from '../components/BranchSelector';
import VentaAgilModal from '../components/VentaAgilModal';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isVentaAgilOpen, setIsVentaAgilOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const canUseVentaAgil = user && (user.roles?.includes('ADMIN') || user.roles?.includes('COACH') || user.roles?.includes('DEV'));

    // Handle responsive
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggle theme on <html>
    useEffect(() => {
        const html = document.documentElement;
        if (darkMode) {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname, isMobile]);

    // Close user dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close sidebar on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                setUserDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const handleLogout = () => {
        setUserDropdownOpen(false);
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['DEV', 'ADMIN'] },
        { path: '/inicio', icon: UserCheck, label: 'Inicio', roles: ['CLIENTE'] },
        { path: '/checkin', icon: UserCheck, label: 'Asistencia', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/membresias', icon: CreditCard, label: 'Membresías', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/tipos-membresia', icon: Users, label: 'Tipos Membresia', roles: ['DEV', 'ADMIN'] },
        { path: '/ventas', icon: ShoppingCart, label: 'Ventas', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/usuarios', icon: Users, label: 'Usuarios', roles: ['DEV', 'ADMIN'] },
        { path: '/clientes', icon: Users, label: 'Clientes', roles: ['DEV', 'ADMIN', 'COACH'] },
        { path: '/productos', icon: Package, label: 'Productos', roles: ['DEV', 'ADMIN'] },
        { path: '/sucursales', icon: MapPin, label: 'Sucursales', roles: ['DEV'] },
        { path: '/reportes', icon: FileText, label: 'Reportes', roles: ['DEV', 'ADMIN'] },
        { path: '/gimnasios', icon: Building2, label: 'Gimnasios', roles: ['DEV'] },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="dashboard-layout">
            {/* Mobile backdrop */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">GP</div>
                        <span className="logo-text">GYM PLUS</span>
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
                                <span>{item.label}</span>
                            </Link>
                        ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`main-content ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}>
                <header className="top-header">
                    <div className="header-left">
                        <button
                            onClick={toggleSidebar}
                            className="toggle-sidebar-btn"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <div className="header-right">
                        {canUseVentaAgil && (
                            <button
                                className="theme-toggle-btn"
                                onClick={() => setIsVentaAgilOpen(true)}
                                title="Venta Rápida (Escáner)"
                                style={{ color: '#10b981', marginRight: '8px' }}
                            >
                                <Zap size={20} />
                            </button>
                        )}
                        <BranchSelector />

                        <button
                            className="theme-toggle-btn"
                            onClick={() => setDarkMode(prev => !prev)}
                            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="user-menu" ref={dropdownRef}>
                            <button
                                className="user-menu-trigger"
                                onClick={() => setUserDropdownOpen(prev => !prev)}
                            >
                                <div className="user-avatar">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="user-menu-info">
                                    <span className="user-menu-name">
                                        {user?.nombreCompleto || user?.username}
                                    </span>
                                    <span className="user-menu-role">
                                        {user?.roles?.[0] || 'Usuario'}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`dropdown-arrow ${userDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {userDropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <p className="dropdown-fullname">
                                            {user?.nombreCompleto || user?.username}
                                        </p>
                                        <p className="dropdown-email">
                                            {user?.email || user?.username}
                                        </p>
                                        <span className="dropdown-role-badge">
                                            {user?.roles?.[0] || 'Usuario'}
                                        </span>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <button className="user-dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    {children}
                </main>
            </div>

            <VentaAgilModal
                isOpen={isVentaAgilOpen}
                onClose={() => setIsVentaAgilOpen(false)}
            />
        </div>
    );
};

export default DashboardLayout;
