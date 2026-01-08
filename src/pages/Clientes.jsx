import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Users } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { useIsMobile } from '../hooks/useIsMobile';
import './Usuarios.css'; // Reusing existing styles

const Clientes = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUsuario, setCurrentUsuario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        username: '',
        password: '',
        telefono: '',
        cedula: '',
        cedulaTipo: 'CEDULA',
        roles: ['CLIENTE'],
        idGimnasio: null,
        idSucursalPorDefecto: null
    });

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        setLoading(true);
        try {
            let response;
            // Fetch logic can be similar, but we'll filter on frontend for now
            // Ideally backend would have a /clientes endpoint, but reusing /usuarios and filtering is safer without backend changes
            if (user?.roles?.includes('DEV')) {
                response = await apiClient.get('/api/usuarios');
            } else if (user?.roles?.includes('ADMIN') || user?.roles?.includes('COACH')) {
                if (user.idSucursalPorDefecto) {
                    response = await apiClient.get(`/api/usuarios/sucursal/${user.idSucursalPorDefecto}`);
                } else {
                    setUsuarios([]);
                    setLoading(false);
                    toast.error('No tienes una sucursal asignada');
                    return;
                }
            } else {
                setUsuarios([]);
                setLoading(false);
                return;
            }

            // Filter strictly for CLIENTE role
            const clientes = response.data.filter(u => u.roles?.includes('CLIENTE'));
            setUsuarios(clientes);

        } catch (error) {
            console.error('Error loading clientes:', error);
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = usuarios.filter(u => {
        const matchesSearch = !searchTerm ||
            u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.cedula?.includes(searchTerm);
        return matchesSearch;
    });

    const handleOpenModal = (usuario = null) => {
        if (usuario) {
            setIsEditing(true);
            setCurrentUsuario({
                id: usuario.id,
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                email: usuario.email || '',
                username: usuario.username || '',
                password: '', // Don't show password
                telefono: usuario.telefono || '',
                cedula: usuario.cedula || '',
                cedulaTipo: usuario.cedulaTipo || 'CEDULA',
                roles: usuario.roles || ['CLIENTE'],
                idGimnasio: usuario.idGimnasio || user?.idGimnasio,
                idSucursalPorDefecto: usuario.idSucursalPorDefecto || user?.idSucursalPorDefecto
            });
        } else {
            setIsEditing(false);
            setCurrentUsuario({
                nombre: '',
                apellido: '',
                email: '',
                username: '',
                password: '',
                telefono: '',
                cedula: '',
                cedulaTipo: 'CEDULA',
                roles: ['CLIENTE'],
                idGimnasio: user?.idGimnasio,
                idSucursalPorDefecto: user?.idSucursalPorDefecto
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
    };

    const handleSuccess = () => {
        loadUsuarios();
    };

    const getRoleBadgeClass = (role) => {
        return 'cliente';
    };

    return (
        <div className="usuarios-page">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="usuarios-header">
                <div className="usuarios-header-title">
                    <Users size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Gestión de Clientes</h1>
                        <p>Total: {filteredUsuarios.length} clientes</p>
                    </div>
                </div>
                <button className="usuarios-btn-new" onClick={() => handleOpenModal()}>
                    <UserPlus size={18} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="usuarios-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table & Mobile Cards */}
            {loading ? (
                <div className="usuarios-loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="usuarios-table-container">
                    {filteredUsuarios.length > 0 ? (
                        <>
                            {!isMobile ? (
                                <table className="usuarios-table">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Username</th>
                                            <th>Cédula</th>
                                            <th>Rol</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsuarios.map((usuario) => (
                                            <tr key={usuario.id}>
                                                <td>
                                                    <div className="usuario-name-cell">
                                                        <div className="usuario-avatar">
                                                            {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                                                        </div>
                                                        <div className="usuario-info">
                                                            <span className="name">{usuario.nombre} {usuario.apellido}</span>
                                                            <span className="email">{usuario.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ color: 'var(--color-text-tertiary)' }}>@{usuario.username}</span>
                                                </td>
                                                <td>
                                                    {usuario.cedula || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        {usuario.roles?.map(role => (
                                                            <span key={role} className={`role-badge ${getRoleBadgeClass(role)}`}>
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="usuario-actions">
                                                        <button className="btn-edit" onClick={() => handleOpenModal(usuario)} title="Editar">
                                                            <Edit size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="usuarios-mobile-list">
                                    {filteredUsuarios.map((usuario) => (
                                        <div className="usuario-card" key={usuario.id}>
                                            <div className="usuario-card-header">
                                                <div className="usuario-avatar">
                                                    {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                                                </div>
                                                <div className="usuario-card-info">
                                                    <h3>{usuario.nombre} {usuario.apellido}</h3>
                                                    <span className="email">{usuario.email}</span>
                                                </div>
                                                <button className="btn-edit-mobile" onClick={() => handleOpenModal(usuario)}>
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                            <div className="usuario-card-details">
                                                <div className="detail-item">
                                                    <span>Username:</span> @{usuario.username}
                                                </div>
                                                <div className="detail-item">
                                                    <span>Cédula:</span> {usuario.cedula || '—'}
                                                </div>
                                                <div className="roles-container">
                                                    {usuario.roles?.map(role => (
                                                        <span key={role} className={`role-badge ${getRoleBadgeClass(role)}`}>
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="usuarios-empty">
                            <Users size={48} />
                            <p>No se encontraron clientes</p>
                        </div>
                    )}
                </div>
            )}
            {/* Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                initialData={currentUsuario}
                isEditing={isEditing}
                onSuccess={handleSuccess}
                forcedRole="CLIENTE"
            />
        </div>
    );
};

{/* Modal */ }

export default Clientes;
