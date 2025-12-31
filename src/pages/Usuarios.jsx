import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import './Membresias.css'; // Reusing styles

const Usuarios = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGym, setSelectedGym] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    // Migration state
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableBranches, setAvailableBranches] = useState([]);
    const [migrationData, setMigrationData] = useState({ idSucursal: '', notas: '' });

    useEffect(() => {
        loadUsuarios();
        loadBranchesForMigration();
    }, []);

    const loadBranchesForMigration = async () => {
        try {
            const response = await apiClient.get('/api/sucursales');
            // Filter branches: ADMIN can only migrate to branches they manage
            let branches = response.data;
            if (user?.roles?.includes('ADMIN') && user.idGimnasio) {
                branches = branches.filter(b => b.idGimnasio === user.idGimnasio);
            }
            setAvailableBranches(branches);
        } catch (error) {
            console.error('Error loading branches', error);
        }
    };

    const openMigrationModal = (usuario) => {
        setSelectedUser(usuario);
        // Filter out user's current branch from options
        // const branches = availableBranches.filter(b => b.id !== usuario.idSucursalPorDefecto);
        // setAvailableBranches(branches); // better to keep all but disable? simple filter is ok.
        setMigrationData({ idSucursal: '', notas: '' });
        setShowMigrationModal(true);
    };

    const handleMigrationSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !migrationData.idSucursal) return;

        try {
            await apiClient.post(`/api/usuarios/${selectedUser.id}/vincular-sucursal`, {
                idSucursal: Number(migrationData.idSucursal),
                notas: migrationData.notas
            });
            toast.success('Usuario migrado exitosamente');
            setShowMigrationModal(false);
            loadUsuarios(); // Reload list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al migrar usuario');
        }
    };

    const loadUsuarios = async () => {
        setLoading(true);
        try {
            let response;

            // Si es DEV, puede ver todos los usuarios
            if (user?.roles?.includes('DEV')) {
                response = await apiClient.get('/api/usuarios');
            }
            // Si es ADMIN, solo ve usuarios de su sucursal
            else if (user?.roles?.includes('ADMIN')) {
                if (user.idSucursalPorDefecto) {
                    response = await apiClient.get(`/api/usuarios/sucursal/${user.idSucursalPorDefecto}`);
                } else {
                    // Si no tiene sucursal asignada, no ve usuarios
                    setUsuarios([]);
                    setLoading(false);
                    toast.error('No tienes una sucursal asignada', { icon: '⚠️' });
                    return;
                }
            }
            // Otros roles no ven usuarios
            else {
                setUsuarios([]);
                setLoading(false);
                return;
            }

            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = usuarios.filter(u => {
        const matchesSearch = !searchTerm ||
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.cedula && u.cedula.includes(searchTerm));

        return matchesSearch;
    });

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="membresias-page">
            <div className="page-header">
                <div>
                    <h1>Gestión de Usuarios</h1>
                    <p className="text-secondary">
                        Total: {filteredUsuarios.length} usuarios
                    </p>
                </div>
                <RoleGuard allowedRoles={['DEV', 'ADMIN']}>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => toast('Función en desarrollo', { icon: 'ℹ️' })}
                    >
                        <UserPlus size={20} />
                        Nuevo Usuario
                    </Button>
                </RoleGuard>
            </div>
            {/* Modal de Migración */}
            {showMigrationModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowMigrationModal(false)}>
                    <Card className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
                        <h2>Migrar Usuario de Sucursal</h2>
                        <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            Estás a punto de migrar al usuario <strong>{selectedUser.nombre} {selectedUser.apellido}</strong> a una nueva sucursal.
                        </p>

                        <form onSubmit={handleMigrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Sucursal Destino *
                                </label>
                                <select
                                    value={migrationData.idSucursal}
                                    onChange={(e) => setMigrationData({ ...migrationData, idSucursal: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    <option value="">Seleccionar nueva sucursal...</option>
                                    {availableBranches.map(b => (
                                        <option key={b.id} value={b.id}>{b.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Notas / Motivo"
                                type="text"
                                value={migrationData.notas}
                                onChange={(e) => setMigrationData({ ...migrationData, notas: e.target.value })}
                                placeholder="Razón del cambio..."
                                fullWidth
                            />

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <Button type="button" variant="ghost" onClick={() => setShowMigrationModal(false)} fullWidth>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" fullWidth loading={loading}>
                                    Confirmar Migración
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            <Card className="animate-fadeIn" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <Input
                            type="text"
                            placeholder="Buscar por nombre, email o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search size={20} />}
                            fullWidth
                        />
                    </div>
                </div>
            </Card>

            <div className="membresias-grid">
                {filteredUsuarios.length === 0 ? (
                    <Card className="empty-state">
                        <Filter size={64} />
                        <h3>No se encontraron usuarios</h3>
                        <p>Ajusta los filtros de búsqueda</p>
                    </Card>
                ) : (
                    filteredUsuarios.map((usuario, index) => (
                        <Card
                            key={usuario.id}
                            className="membresia-card animate-fadeIn"
                            style={{ animationDelay: `${index * 30}ms` }}
                            hover
                        >
                            <div className="membresia-header">
                                <div className="user-avatar-sm">
                                    {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                </div>
                                <div className="membresia-user">
                                    <h3>{usuario.nombre} {usuario.apellido}</h3>
                                    <p className="text-tertiary">{usuario.email}</p>
                                </div>
                            </div>

                            {usuario.cedula ? (
                                <div className="status-badge badge-success">
                                    📋 {usuario.cedula}
                                </div>
                            ) : (
                                <div className="status-badge badge-warning">
                                    ⚠️ Sin cédula
                                </div>
                            )}

                            <div className="membresia-dates">
                                <div className="date-row">
                                    <span className="date-label">Username:</span>
                                    <span className="date-value">{usuario.username}</span>
                                </div>
                                {usuario.telefono && (
                                    <div className="date-row">
                                        <span className="date-label">Teléfono:</span>
                                        <span className="date-value">{usuario.telefono}</span>
                                    </div>
                                )}
                                <div className="date-row">
                                    <span className="date-label">Roles:</span>
                                    <span className="date-value">
                                        {usuario.roles?.join(', ') || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <RoleGuard allowedRoles={['DEV', 'ADMIN']}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    onClick={() => toast('Editar usuario - Función en desarrollo', { icon: 'ℹ️' })}
                                >
                                    <Edit size={16} />
                                    Editar
                                </Button>
                            </RoleGuard>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Usuarios;
