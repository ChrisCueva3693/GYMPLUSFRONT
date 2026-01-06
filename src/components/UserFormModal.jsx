import React, { useState, useEffect } from 'react';
import { X, Save, Edit, UserPlus } from 'lucide-react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const UserFormModal = ({ isOpen, onClose, initialData, isEditing, onSuccess, forcedRole = null, allowedRoles = null }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
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

    // Roles logic
    let availableRoles = ['CLIENTE'];
    if (!forcedRole) {
        if (user?.roles?.includes('DEV')) {
            availableRoles = ['DEV', 'ADMIN', 'COACH', 'CLIENTE'];
        } else if (user?.roles?.includes('ADMIN')) {
            availableRoles = ['ADMIN', 'COACH', 'CLIENTE'];
        } else if (user?.roles?.includes('COACH')) {
            availableRoles = ['CLIENTE'];
        }
    } else if (allowedRoles) {
        // If allowedRoles is explicitly provided, use it
        availableRoles = allowedRoles;
    } else {
        availableRoles = [forcedRole];
    }

    useEffect(() => {
        if (isOpen) {
            if (initialData && isEditing) {
                setFormData({
                    id: initialData.id,
                    nombre: initialData.nombre || '',
                    apellido: initialData.apellido || '',
                    email: initialData.email || '',
                    username: initialData.username || '',
                    password: '', // Don't show password
                    telefono: initialData.telefono || '',
                    cedula: initialData.cedula || '',
                    cedulaTipo: initialData.cedulaTipo || 'CEDULA',
                    roles: initialData.roles || ['CLIENTE'],
                    idGimnasio: initialData.idGimnasio || user?.idGimnasio,
                    idSucursalPorDefecto: initialData.idSucursalPorDefecto || user?.idSucursalPorDefecto
                });
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
                    roles: forcedRole ? [forcedRole] : ['CLIENTE'],
                    idGimnasio: user?.idGimnasio,
                    idSucursalPorDefecto: user?.idSucursalPorDefecto
                });
            }
        }
    }, [isOpen, initialData, isEditing, user, forcedRole, allowedRoles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                idGimnasio: formData.idGimnasio || user?.idGimnasio,
                idSucursalPorDefecto: formData.idSucursalPorDefecto || user?.idSucursalPorDefecto
            };

            // Remove password if empty (for update)
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
                            <select
                                value={formData.roles?.[0] || 'CLIENTE'}
                                onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                                disabled={!!forcedRole}
                            >
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
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
