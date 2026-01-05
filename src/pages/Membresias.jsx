import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, X, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import membresiaService from '../services/membresiaService';
import toast, { Toaster } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './Membresias.css';

const Membresias = () => {
    const [membresias, setMembresias] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [tiposMembresia, setTiposMembresia] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);

    // New Membresia Form
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedTipoMembresia, setSelectedTipoMembresia] = useState('');
    const [selectedTipoPago, setSelectedTipoPago] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMembresias();
    }, []);

    const fetchMembresias = async () => {
        try {
            setLoading(true);
            const data = await membresiaService.getMembresias();
            setMembresias(data);
        } catch (error) {
            console.error('Error fetching membresias:', error);
            toast.error('Error al cargar membresías');
        } finally {
            setLoading(false);
        }
    };

    const openModal = async () => {
        try {
            const [clientesRes, tiposMembresiaRes, tiposPagoRes] = await Promise.all([
                apiClient.get('/api/usuarios'),
                apiClient.get('/api/tipos-membresia'),
                apiClient.get('/api/tipos-pago')
            ]);

            setClientes(clientesRes.data);
            setTiposMembresia(tiposMembresiaRes.data);
            setTiposPago(tiposPagoRes.data);

            // Reset form
            setSelectedCliente('');
            setSelectedTipoMembresia('');
            setSelectedTipoPago('');
            setFechaInicio(new Date().toISOString().split('T')[0]);

            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading modal data:', error);
            toast.error('Error al cargar datos');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const getSelectedPlanDetails = () => {
        if (!selectedTipoMembresia) return null;
        return tiposMembresia.find(tm => tm.id === parseInt(selectedTipoMembresia));
    };

    const handleSubmit = async () => {
        if (!selectedCliente || !selectedTipoMembresia || !selectedTipoPago || !fechaInicio) {
            toast.error('Complete todos los campos requeridos');
            return;
        }

        setSubmitting(true);
        try {
            const request = {
                clienteId: parseInt(selectedCliente),
                tipoMembresiaId: parseInt(selectedTipoMembresia),
                tipoPagoId: parseInt(selectedTipoPago),
                fechaInicio: fechaInicio
            };

            await membresiaService.createMembresia(request);
            toast.success('Membresía creada exitosamente');
            closeModal();
            fetchMembresias();
        } catch (error) {
            console.error('Error creating membresia:', error);
            const msg = error.response?.data?.message || 'Error al procesar membresía';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const planDetails = getSelectedPlanDetails();
    const fechaFinCalculada = planDetails && fechaInicio
        ? format(addDays(new Date(fechaInicio), planDetails.duracionDias), 'yyyy-MM-dd')
        : '';

    return (
        <div className="membresias-page">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="membresias-header">
                <div className="membresias-header-title">
                    <CreditCard size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Membresías</h1>
                        <p>Gestiona las suscripciones de los clientes</p>
                    </div>
                </div>
                <button className="membresias-btn-new" onClick={openModal}>
                    <Plus size={18} />
                    Nueva Membresía
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #ccc', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            ) : (
                <div className="membresias-table-container">
                    {membresias.length > 0 ? (
                        <table className="membresias-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Plan</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membresias.map((m) => (
                                    <tr key={m.id}>
                                        <td>#{m.id}</td>
                                        <td>{m.clienteNombre}</td>
                                        <td>{m.tipoMembresiaNombre}</td>
                                        <td>{format(new Date(m.fechaInicio), 'dd MMM yyyy', { locale: es })}</td>
                                        <td>{format(new Date(m.fechaFin), 'dd MMM yyyy', { locale: es })}</td>
                                        <td style={{ fontWeight: 600 }}>${m.precio?.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${m.estado === 'ACTIVA' ? 'badge-success' : 'badge-gray'}`}>
                                                {m.estado === 'ACTIVA' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {m.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No hay membresías registradas</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="membresias-modal-overlay" onClick={closeModal}>
                    <div className="membresias-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="membresias-modal-header">
                            <h2><CreditCard size={20} /> Nueva Membresía</h2>
                            <button className="membresias-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="membresias-modal-body">
                            <div className="membresias-form-group">
                                <label>Cliente *</label>
                                <select
                                    value={selectedCliente}
                                    onChange={(e) => setSelectedCliente(e.target.value)}
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} {c.apellido} ({c.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="membresias-form-group">
                                <label>Plan / Tipo de Membresía *</label>
                                <select
                                    value={selectedTipoMembresia}
                                    onChange={(e) => setSelectedTipoMembresia(e.target.value)}
                                >
                                    <option value="">Seleccionar plan...</option>
                                    {tiposMembresia.map(tm => (
                                        <option key={tm.id} value={tm.id}>
                                            {tm.nombre} - ${tm.precioBase} ({tm.duracionDias} días)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="membresias-form-group">
                                <label>Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>

                            <div className="membresias-form-group">
                                <label>Forma de Pago *</label>
                                <select
                                    value={selectedTipoPago}
                                    onChange={(e) => setSelectedTipoPago(e.target.value)}
                                >
                                    <option value="">Seleccionar forma de pago...</option>
                                    {tiposPago.map(tp => (
                                        <option key={tp.id} value={tp.id}>
                                            {tp.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {planDetails && (
                                <div className="membership-summary">
                                    <div className="summary-row">
                                        <span>Plan Seleccionado:</span>
                                        <span>{planDetails.nombre}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Duración:</span>
                                        <span>{planDetails.duracionDias} días</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Vencimiento estimado:</span>
                                        <span>{fechaFinCalculada}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total a Pagar:</span>
                                        <span>${planDetails.precioBase.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="membresias-modal-footer">
                            <button type="button" className="membresias-btn-cancel" onClick={closeModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="membresias-btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                <CreditCard size={16} />
                                {submitting ? 'Procesando...' : 'Crear Membresía'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membresias;
