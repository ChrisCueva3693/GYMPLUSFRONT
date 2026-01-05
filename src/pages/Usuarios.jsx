import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Users, X, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import './Usuarios.css';

const Usuarios = () => {
    const { user } = useAuth();
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

    // Roles that ADMIN can assign (not DEV)
    const availableRoles = user?.roles?.includes('DEV')
        ? ['DEV', 'ADMIN', 'CLIENTE']
        : ['ADMIN', 'CLIENTE'];

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        setLoading(true);
        try {
            let response;
            if (user?.roles?.includes('DEV')) {
                response = await apiClient.get('/api/usuarios');
            } else if (user?.roles?.includes('ADMIN')) {
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
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error loading usuarios:', error);
            toast.error('Error al cargar usuarios');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentUsuario,
                idGimnasio: currentUsuario.idGimnasio || user?.idGimnasio,
                idSucursalPorDefecto: currentUsuario.idSucursalPorDefecto || user?.idSucursalPorDefecto
            };

            // Remove password if empty (for update)
            if (isEditing && !payload.password) {
                delete payload.password;
            }

            if (isEditing) {
                await apiClient.put(`/api/usuarios/${currentUsuario.id}`, payload);
                toast.success('Usuario actualizado');
            } else {
                await apiClient.post('/api/usuarios', payload);
                toast.success('Usuario creado');
            }
            closeModal();
            loadUsuarios();
        } catch (error) {
            console.error('Error saving usuario:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || 'Error al guardar';
            toast.error(typeof errorMsg === 'string' ? errorMsg : 'Error al guardar usuario');
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role?.toUpperCase()) {
            case 'DEV': return 'dev';
            case 'ADMIN': return 'admin';
            default: return 'cliente';
        }
    };

    return (
        <div className="usuarios-page">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="usuarios-header">
                <div className="usuarios-header-title">
                    <Users size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Gestión de Usuarios</h1>
                        <p>Total: {filteredUsuarios.length} usuarios</p>
                    </div>
                </div>
                <button className="usuarios-btn-new" onClick={() => handleOpenModal()}>
                    <UserPlus size={18} />
                    Nuevo Usuario
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

            {/* Table */}
            {loading ? (
                <div className="usuarios-loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="usuarios-table-container">
                    {filteredUsuarios.length > 0 ? (
                        <table className="usuarios-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
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
                        <div className="usuarios-empty">
                            <Users size={48} />
                            <p>No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="usuarios-modal-overlay" onClick={closeModal}>
                    <div className="usuarios-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="usuarios-modal-header">
                            <div className="usuarios-modal-header-info">
                                <div className="usuarios-modal-header-icon">
                                    {isEditing ? <Edit size={20} /> : <UserPlus size={20} />}
                                </div>
                                <div>
                                    <h2>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                                    <p>{isEditing ? 'Modifica los datos' : 'Ingresa la información'}</p>
                                </div>
                            </div>
                            <button className="usuarios-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="usuarios-modal-body">
                                <div className="usuarios-form-row">
                                    <div className="usuarios-form-group">
                                        <label>Nombre *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Juan"
                                            value={currentUsuario.nombre}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="usuarios-form-group">
                                        <label>Apellido *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Pérez"
                                            value={currentUsuario.apellido}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, apellido: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="usuarios-form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="correo@ejemplo.com"
                                        value={currentUsuario.email}
                                        onChange={(e) => setCurrentUsuario({ ...currentUsuario, email: e.target.value })}
                                    />
                                </div>

                                <div className="usuarios-form-row">
                                    <div className="usuarios-form-group">
                                        <label>Username *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="usuario123"
                                            value={currentUsuario.username}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="usuarios-form-group">
                                        <label>{isEditing ? 'Nueva Contraseña' : 'Contraseña *'}</label>
                                        <input
                                            type="password"
                                            required={!isEditing}
                                            placeholder={isEditing ? 'Dejar vacío para no cambiar' : '••••••••'}
                                            value={currentUsuario.password}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="usuarios-form-row">
                                    <div className="usuarios-form-group">
                                        <label>Cédula</label>
                                        <input
                                            type="text"
                                            placeholder="1234567890"
                                            value={currentUsuario.cedula}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, cedula: e.target.value })}
                                        />
                                    </div>
                                    <div className="usuarios-form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            placeholder="+593 99 999 9999"
                                            value={currentUsuario.telefono}
                                            onChange={(e) => setCurrentUsuario({ ...currentUsuario, telefono: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="usuarios-form-group">
                                    <label>Rol *</label>
                                    <select
                                        value={currentUsuario.roles?.[0] || 'CLIENTE'}
                                        onChange={(e) => setCurrentUsuario({ ...currentUsuario, roles: [e.target.value] })}
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="usuarios-modal-footer">
                                <button type="button" className="usuarios-btn-cancel" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="usuarios-btn-submit">
                                    <Save size={16} />
                                    {isEditing ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
