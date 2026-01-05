import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Save, CreditCard } from 'lucide-react';
import apiClient from '../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import './Membresias.css'; // Reuse existing styles or create new ones
import { useBranch } from '../context/BranchContext';

const TiposMembresia = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTipo, setEditingTipo] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        duracionDias: 30,
        precioBase: ''
    });

    const { selectedBranchId } = useBranch();

    useEffect(() => {
        if (selectedBranchId) {
            fetchTipos();
        }
    }, [selectedBranchId]);

    const fetchTipos = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/tipos-membresia');
            setTipos(response.data);
        } catch (error) {
            console.error('Error fetching tipos:', error);
            toast.error('Error al cargar tipos de membresía');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tipo = null) => {
        if (tipo) {
            setEditingTipo(tipo);
            setFormData({
                nombre: tipo.nombre,
                descripcion: tipo.descripcion || '',
                duracionDias: tipo.duracionDias,
                precioBase: tipo.precioBase
            });
        } else {
            setEditingTipo(null);
            setFormData({
                nombre: '',
                descripcion: '',
                duracionDias: 30,
                precioBase: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTipo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTipo) {
                await apiClient.put(`/api/tipos-membresia/${editingTipo.id}`, formData);
                toast.success('Tipo actualizado exitosamente');
            } else {
                await apiClient.post('/api/tipos-membresia', formData);
                toast.success('Tipo creado exitosamente');
            }
            handleCloseModal();
            fetchTipos();
        } catch (error) {
            console.error('Error saving tipo:', error);
            toast.error(error.response?.data?.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este tipo de membresía?')) return;
        try {
            await apiClient.delete(`/api/tipos-membresia/${id}`);
            toast.success('Tipo eliminado exitosamente');
            fetchTipos();
        } catch (error) {
            console.error('Error deleting tipo:', error);
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="membresias-page"> {/* Reuse generic class or create specific */}
            <Toaster position="top-right" />

            <div className="membresias-header">
                <div className="membresias-header-title">
                    <CreditCard size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Tipos de Membresía</h1>
                        <p>Gestiona las tarifas y planes del gimnasio</p>
                    </div>
                </div>
                <button className="membresias-btn-new" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Nuevo Tipo
                </button>
            </div>

            {loading ? (
                <div className="loading-container">Loading...</div>
            ) : (
                <div className="membresias-table-container">
                    <table className="membresias-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Duración (Días)</th>
                                <th>Precio Base</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.map((tipo) => (
                                <tr key={tipo.id}>
                                    <td>{tipo.nombre}</td>
                                    <td>{tipo.descripcion || '-'}</td>
                                    <td>{tipo.duracionDias}</td>
                                    <td>${parseFloat(tipo.precioBase).toFixed(2)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="icon-btn edit" onClick={() => handleOpenModal(tipo)}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(tipo.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="membresias-modal-overlay">
                    <div className="membresias-modal">
                        <div className="membresias-modal-header">
                            <h2>{editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
                            <button className="membresias-modal-close" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="membresias-modal-body">
                                <div className="membresias-form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="membresias-form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>
                                <div className="membresias-form-group">
                                    <label>Duración (Días)</label>
                                    <input
                                        type="number"
                                        value={formData.duracionDias}
                                        onChange={(e) => setFormData({ ...formData, duracionDias: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="membresias-form-group">
                                    <label>Precio Base</label>
                                    <input
                                        type="number"
                                        value={formData.precioBase}
                                        onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="membresias-modal-footer">
                                <button type="button" className="membresias-btn-cancel" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="membresias-btn-submit">
                                    <Save size={16} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TiposMembresia;
