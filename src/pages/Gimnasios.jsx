import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Edit, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleGuard from '../components/RoleGuard';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import '../pages/Membresias.css';

const Gimnasios = () => {
    const [gimnasios, setGimnasios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGym, setEditingGym] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        emailContacto: '',
    });

    useEffect(() => {
        loadGimnasios();
    }, []);

    const loadGimnasios = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/gimnasios');
            setGimnasios(response.data);
        } catch (error) {
            toast.error('Error al cargar gimnasios');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGym) {
                await apiClient.put(`/api/gimnasios/${editingGym.id}`, formData);
                toast.success('Gimnasio actualizado');
            } else {
                await apiClient.post('/api/gimnasios', formData);
                toast.success('Gimnasio creado');
            }
            setShowModal(false);
            setEditingGym(null);
            setFormData({ nombre: '', direccion: '', telefono: '', emailContacto: '' });
            loadGimnasios();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar gimnasio');
        }
    };

    const handleEdit = (gym) => {
        setEditingGym(gym);
        setFormData({
            nombre: gym.nombre,
            direccion: gym.direccion || '',
            telefono: gym.telefono || '',
            emailContacto: gym.emailContacto || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este gimnasio?')) return;

        try {
            await apiClient.delete(`/api/gimnasios/${id}`);
            toast.success('Gimnasio eliminado');
            loadGimnasios();
        } catch (error) {
            toast.error('Error al eliminar gimnasio');
        }
    };

    const handleToggleStatus = async (gym) => {
        const action = gym.activo ? 'suspender' : 'activar';
        if (!confirm(`¿Estás seguro de ${action} el gimnasio ${gym.nombre}?`)) return;

        try {
            await apiClient.patch(`/api/gimnasios/${gym.id}/estado`);
            toast.success(`Gimnasio ${gym.activo ? 'suspendido' : 'activado'}`);
            loadGimnasios();
        } catch (error) {
            toast.error(`Error al ${action} el gimnasio`);
        }
    };

    const filteredGimnasios = gimnasios.filter(g =>
        g.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="membresias-page">
            <div className="page-header">
                <div>
                    <h1>Gestión de Gimnasios</h1>
                    <p className="text-secondary">Total: {filteredGimnasios.length} gimnasios</p>
                </div>
                <Button variant="primary" onClick={() => { setShowModal(true); setEditingGym(null); setFormData({ nombre: '', direccion: '', telefono: '', email: '' }); }}>
                    <Plus size={20} />
                    Nuevo Gimnasio
                </Button>
            </div>

            <Card className="animate-fadeIn" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                <Input
                    type="text"
                    placeholder="Buscar gimnasio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={20} />}
                    fullWidth
                />
            </Card>

            <div className="membresias-grid">
                {filteredGimnasios.map((gym, index) => (
                    <Card key={gym.id} className="membresia-card animate-fadeIn" style={{ animationDelay: `${index * 30}ms` }} hover>
                        <div className="sucursal-card-header">
                            <div className="sucursal-icon" style={{ background: 'var(--gradient-blue)', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.25)' }}>
                                <Building2 size={18} />
                            </div>
                            <div className="sucursal-card-info">
                                <h3>{gym.nombre}</h3>
                                <p>{gym.emailContacto || 'Sin email'}</p>
                            </div>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                marginLeft: 'auto',
                                alignSelf: 'flex-start',
                                backgroundColor: gym.activo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: gym.activo ? 'var(--color-accent-success)' : 'var(--color-accent-danger)'
                            }}>
                                {gym.activo ? 'Activo' : 'Suspendido'}
                            </span>
                        </div>

                        <div className="membresia-dates">
                            {gym.direccion && (
                                <div className="date-row">
                                    <span className="date-label">Dirección:</span>
                                    <span className="date-value">{gym.direccion}</span>
                                </div>
                            )}
                            {gym.telefono && (
                                <div className="date-row">
                                    <span className="date-label">Teléfono:</span>
                                    <span className="date-value">{gym.telefono}</span>
                                </div>
                            )}
                        </div>

                        <div className="sucursal-card-actions">
                            <button className="sucursal-btn-edit" onClick={() => handleEdit(gym)}>
                                <Edit size={14} />
                                Editar
                            </button>
                            <button className="sucursal-btn-delete" onClick={() => handleDelete(gym.id)}>
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                            <button 
                                className="sucursal-btn-edit" 
                                style={{ 
                                    backgroundColor: gym.activo ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                    color: gym.activo ? 'var(--color-accent-danger)' : 'var(--color-accent-success)',
                                    border: 'none',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={() => handleToggleStatus(gym)}
                            >
                                {gym.activo ? 'Suspender' : 'Activar'}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <Card className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
                        <h2>{editingGym ? 'Editar Gimnasio' : 'Nuevo Gimnasio'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                            <Input
                                label="Nombre *"
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                fullWidth
                            />
                            <Input
                                label="Dirección"
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                fullWidth
                            />
                            <Input
                                label="Teléfono"
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                fullWidth
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.emailContacto}
                                onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                                fullWidth
                            />
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} fullWidth>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" fullWidth>
                                    {editingGym ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Gimnasios;
