import React, { useState, useEffect } from 'react';
import { X, Save, Edit, UserPlus, Building2, MapPin } from 'lucide-react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const UserFormModal = ({ isOpen, onClose, initialData, isEditing, onSuccess, forcedRole = null, allowedRoles = null }) => {
    const { user } = useAuth();
    const isDev = user?.roles?.includes('DEV');

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        username: '',
        password: '',
        telefono: '',
        cedula: '',
        cedulaTipo: 'CEDULA',
        roles: [],
        idGimnasio: null,
        idSucursalPorDefecto: null
    });

    // DEV-only: empresa and sucursal lists
    const [gimnasios, setGimnasios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loadingGimnasios, setLoadingGimnasios] = useState(false);
    const [loadingSucursales, setLoadingSucursales] = useState(false);
    const [selectedGimnasioId, setSelectedGimnasioId] = useState('');

    // Roles logic
    let availableRoles = [];

    if (forcedRole) {
        availableRoles = [forcedRole];
    } else if (allowedRoles) {
        availableRoles = allowedRoles;
    } else {
        if (isDev) {
            availableRoles = ['DEV', 'ADMIN', 'COACH', 'CLIENTE'];
        } else if (user?.roles?.includes('ADMIN')) {
            availableRoles = ['ADMIN', 'COACH', 'CLIENTE'];
        } else if (user?.roles?.includes('COACH')) {
            availableRoles = ['CLIENTE'];
        }
    }

    // Load gimnasios when modal opens (DEV only)
    useEffect(() => {
        if (isOpen && isDev) {
            loadGimnasios();
        }
    }, [isOpen, isDev]);

    // Load sucursales when gimnasio changes
    useEffect(() => {
        if (selectedGimnasioId) {
            loadSucursales(selectedGimnasioId);
        } else {
            setSucursales([]);
        }
    }, [selectedGimnasioId]);

    const loadGimnasios = async () => {
        setLoadingGimnasios(true);
        try {
            const response = await apiClient.get('/api/gimnasios');
            setGimnasios(response.data);
        } catch (error) {
            console.error('Error loading gimnasios:', error);
            toast.error('Error al cargar empresas');
        } finally {
            setLoadingGimnasios(false);
        }
    };

    const loadSucursales = async (idGimnasio) => {
        setLoadingSucursales(true);
        try {
            const response = await apiClient.get(`/api/sucursales/gimnasio/${idGimnasio}`);
            setSucursales(response.data);
        } catch (error) {
            console.error('Error loading sucursales:', error);
            toast.error('Error al cargar sucursales');
        } finally {
            setLoadingSucursales(false);
        }
    };

    // Init form data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData && isEditing) {
                setFormData({
                    id: initialData.id,
                    nombre: initialData.nombre || '',
                    apellido: initialData.apellido || '',
                    email: initialData.email || '',
                    username: initialData.username || '',
                    password: '',
                    telefono: initialData.telefono || '',
                    cedula: initialData.cedula || '',
                    cedulaTipo: initialData.cedulaTipo || 'CEDULA',
                    roles: initialData.roles || (forcedRole ? [forcedRole] : []),
                    idGimnasio: initialData.idGimnasio || user?.idGimnasio,
                    idSucursalPorDefecto: initialData.idSucursalPorDefecto || user?.idSucursalPorDefecto
                });
                // If DEV and editing, pre-select the gimnasio
                if (isDev && initialData.idGimnasio) {
                    setSelectedGimnasioId(String(initialData.idGimnasio));
                }
            } else {
                setFormData({
                    nombre: '',
                    apellido: '',
                    email: '',
                    username: '',
                    password: '',
                    telefono: '',
                    cedula: '',
                    cedulaTipo: 'CEDULA',
                    roles: forcedRole ? [forcedRole] : [],
                    idGimnasio: isDev ? null : user?.idGimnasio,
                    idSucursalPorDefecto: isDev ? null : user?.idSucursalPorDefecto
                });
                if (isDev) {
                    setSelectedGimnasioId('');
                    setSucursales([]);
                }
            }
        }
    }, [isOpen, initialData, isEditing, user, forcedRole, allowedRoles, isDev]);

    const handleGimnasioChange = (e) => {
        const gimId = e.target.value;
        setSelectedGimnasioId(gimId);
        setFormData(prev => ({
            ...prev,
            idGimnasio: gimId ? Number(gimId) : null,
            idSucursalPorDefecto: null // Reset sucursal when empresa changes
        }));
    };

    const handleSucursalChange = (e) => {
        const sucId = e.target.value;
        setFormData(prev => ({
            ...prev,
            idSucursalPorDefecto: sucId ? Number(sucId) : null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.roles || formData.roles.length === 0) {
            toast.error('Debe seleccionar un rol');
            return;
        }

        // DEV must select empresa and sucursal
        if (isDev && !forcedRole) {
            if (!formData.idGimnasio) {
                toast.error('Debe seleccionar una empresa');
                return;
            }
            if (!formData.idSucursalPorDefecto) {
                toast.error('Debe seleccionar una sucursal');
                return;
            }
        }

        try {
            const payload = {
                ...formData,
                idGimnasio: formData.idGimnasio || user?.idGimnasio,
                idSucursalPorDefecto: formData.idSucursalPorDefecto || user?.idSucursalPorDefecto
            };

            if (isEditing && !payload.password) {
                delete payload.password;
            }

            if (isEditing) {
                await apiClient.put(`/api/usuarios/${formData.id}`, payload);
                toast.success('Usuario actualizado');
            } else {
                await apiClient.post('/api/usuarios', payload);
                toast.success('Usuario creado');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving usuario:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || 'Error al guardar';
            toast.error(typeof errorMsg === 'string' ? errorMsg : 'Error al guardar usuario');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="usuarios-modal-overlay" onClick={onClose}>
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
                    <button className="usuarios-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="usuarios-modal-body">
                        {/* DEV-only: Empresa & Sucursal selectors */}
                        {isDev && !forcedRole && (
                            <div className="usuarios-form-row">
                                <div className="usuarios-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building2 size={14} color="var(--color-accent-primary)" />
                                        Empresa *
                                    </label>
                                    <select
                                        value={selectedGimnasioId}
                                        onChange={handleGimnasioChange}
                                        required
                                        disabled={loadingGimnasios}
                                    >
                                        <option value="" disabled>
                                            {loadingGimnasios ? 'Cargando...' : 'Seleccionar empresa...'}
                                        </option>
                                        {gimnasios.map(g => (
                                            <option key={g.id} value={g.id}>{g.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="usuarios-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} color="var(--color-accent-primary)" />
                                        Sucursal *
                                    </label>
                                    <select
                                        value={formData.idSucursalPorDefecto || ''}
                                        onChange={handleSucursalChange}
                                        required
                                        disabled={!selectedGimnasioId || loadingSucursales}
                                    >
                                        <option value="" disabled>
                                            {loadingSucursales ? 'Cargando...' : !selectedGimnasioId ? 'Primero seleccione empresa' : 'Seleccionar sucursal...'}
                                        </option>
                                        {sucursales.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre} — {s.ciudad || 'Sin ciudad'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="usuarios-form-row">
                            <div className="usuarios-form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Juan"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="usuarios-form-group">
                                <label>Apellido *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Pérez"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="usuarios-form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                required
                                placeholder="correo@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="usuarios-form-row">
                            <div className="usuarios-form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="usuario123"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="usuarios-form-group">
                                <label>{isEditing ? 'Nueva Contraseña' : 'Contraseña *'}</label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    placeholder={isEditing ? 'Dejar vacío para no cambiar' : '••••••••'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="usuarios-form-row">
                            <div className="usuarios-form-group">
                                <label>Cédula</label>
                                <input
                                    type="text"
                                    placeholder="1234567890"
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                />
                            </div>
                            <div className="usuarios-form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    placeholder="+593 99 999 9999"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="usuarios-form-group">
                            <label>Rol *</label>
                            {(() => {
                                const currentRole = formData.roles?.[0];
                                const isRoleAboveMe = isEditing && currentRole && !availableRoles.includes(currentRole);
                                const isDisabled = !!forcedRole || isRoleAboveMe;
                                return (
                                    <select
                                        value={currentRole || ''}
                                        onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                                        disabled={isDisabled}
                                        required
                                    >
                                        <option value="" disabled>Seleccionar rol...</option>
                                        {isRoleAboveMe && (
                                            <option value={currentRole}>{currentRole}</option>
                                        )}
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="usuarios-modal-footer">
                        <button type="button" className="usuarios-btn-cancel" onClick={onClose}>
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
    );
};

export default UserFormModal;
