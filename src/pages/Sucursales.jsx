import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Edit, Trash2, Filter } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import '../pages/Membresias.css';

const Sucursales = () => {
    const { user } = useAuth();
    const [sucursales, setSucursales] = useState([]);
    const [gimnasios, setGimnasios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGym, setSelectedGym] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        idGimnasio: '',
    });

    const isDev = user?.roles?.includes('DEV');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Si es DEV, cargar gimnasios primero
            if (isDev) {
                const gymsResponse = await apiClient.get('/api/gimnasios');
                setGimnasios(gymsResponse.data);
            }

            // Cargar sucursales
            const response = await apiClient.get('/api/sucursales');
            let branches = response.data;

            // Si es ADMIN, filtrar solo sus sucursales
            if (!isDev && user?.idGimnasio) {
                branches = branches.filter(s => s.idGimnasio === user.idGimnasio);
            }

            setSucursales(branches);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            // Si es ADMIN, forzar su gimnasio
            idGimnasio: isDev ? formData.idGimnasio : user.idGimnasio,
        };

        try {
            if (editingBranch) {
                await apiClient.put(`/api/sucursales/${editingBranch.id}`, dataToSend);
                toast.success('Sucursal actualizada');
            } else {
                await apiClient.post('/api/sucursales', dataToSend);
                toast.success('Sucursal creada');
            }
            setShowModal(false);
            setEditingBranch(null);
            setFormData({ nombre: '', direccion: '', telefono: '', idGimnasio: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al guardar sucursal');
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            nombre: branch.nombre,
            direccion: branch.direccion || '',
            telefono: branch.telefono || '',
            idGimnasio: branch.idGimnasio?.toString() || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;

        try {
            await apiClient.delete(`/api/sucursales/${id}`);
            toast.success('Sucursal eliminada');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar sucursal');
        }
    };

    const filteredSucursales = sucursales.filter(s => {
        const matchesSearch = !searchTerm ||
            s.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGym = !selectedGym || s.idGimnasio?.toString() === selectedGym;
        return matchesSearch && matchesGym;
    });

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="membresias-page">
            <div className="page-header">
                <div>
                    <h1>Gestión de Sucursales</h1>
                    <p className="text-secondary">Total: {filteredSucursales.length} sucursales</p>
                </div>
                <Button variant="primary" onClick={() => { setShowModal(true); setEditingBranch(null); setFormData({ nombre: '', direccion: '', telefono: '', idGimnasio: isDev ? '' : user.idGimnasio?.toString() }); }}>
                    <Plus size={20} />
                    Nueva Sucursal
                </Button>
            </div>

            <Card className="animate-fadeIn" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <Input
                            type="text"
                            placeholder="Buscar sucursal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search size={20} />}
                            fullWidth
                        />
                    </div>

                    {isDev && gimnasios.length > 0 && (
                        <div style={{ minWidth: '200px' }}>
                            <select
                                value={selectedGym}
                                onChange={(e) => setSelectedGym(e.target.value)}
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
                                <option value="">Todos los gimnasios</option>
                                {gimnasios.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            <div className="membresias-grid">
                {filteredSucursales.map((branch, index) => (
                    <Card key={branch.id} className="membresia-card animate-fadeIn" style={{ animationDelay: `${index * 30}ms` }} hover>
                        <div className="membresia-header">
                            <div className="user-avatar-sm" style={{ background: 'var(--gradient-success)' }}>
                                <MapPin size={20} />
                            </div>
                            <div className="membresia-user">
                                <h3>{branch.nombre}</h3>
                                <p className="text-tertiary">{branch.gimnasioNombre || 'Gimnasio'}</p>
                            </div>
                        </div>

                        <div className="membresia-dates">
                            {branch.direccion && (
                                <div className="date-row">
                                    <span className="date-label">Dirección:</span>
                                    <span className="date-value">{branch.direccion}</span>
                                </div>
                            )}
                            {branch.telefono && (
                                <div className="date-row">
                                    <span className="date-label">Teléfono:</span>
                                    <span className="date-value">{branch.telefono}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(branch)} style={{ flex: 1 }}>
                                <Edit size={16} />
                                Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(branch.id)} style={{ flex: 1 }}>
                                <Trash2 size={16} />
                                Eliminar
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <Card className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
                        <h2>{editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                            {isDev && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                        Gimnasio *
                                    </label>
                                    <select
                                        value={formData.idGimnasio}
                                        onChange={(e) => setFormData({ ...formData, idGimnasio: e.target.value })}
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
                                        <option value="">Seleccionar gimnasio...</option>
                                        {gimnasios.map(g => (
                                            <option key={g.id} value={g.id}>{g.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

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

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} fullWidth>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" fullWidth>
                                    {editingBranch ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Sucursales;
