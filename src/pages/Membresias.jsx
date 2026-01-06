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
    const [selectedClientes, setSelectedClientes] = useState([]); // List of client IDs
    const [currentClienteToAdd, setCurrentClienteToAdd] = useState('');

    // Split Payment State
    const [pagos, setPagos] = useState([]);
    const [currentPagoType, setCurrentPagoType] = useState('');
    const [currentPagoMonto, setCurrentPagoMonto] = useState('');

    const [selectedTipoMembresia, setSelectedTipoMembresia] = useState('');
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
            setSelectedClientes([]);
            setCurrentClienteToAdd('');
            setSelectedTipoMembresia('');
            setPagos([]);
            setCurrentPagoType('');
            setCurrentPagoMonto('');
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

    // Group Logic
    const addCliente = () => {
        if (!currentClienteToAdd) return;
        const clienteId = parseInt(currentClienteToAdd);
        if (selectedClientes.includes(clienteId)) {
            toast.error("El cliente ya está agregado");
            return;
        }
        setSelectedClientes([...selectedClientes, clienteId]);
        setCurrentClienteToAdd('');
    };

    const removeCliente = (clienteId) => {
        setSelectedClientes(selectedClientes.filter(id => id !== clienteId));
    };

    const getClienteName = (id) => {
        const c = clientes.find(c => c.id === id);
        return c ? `${c.nombre} ${c.apellido} (${c.username})` : 'Desconocido';
    };

    // Payment Logic
    const getTotal = () => {
        const plan = getSelectedPlanDetails();
        if (!plan) return 0;
        return plan.precioBase * (selectedClientes.length > 0 ? selectedClientes.length : 1);
        // If 0 clients selected yet, assume 1 for price preview, but mandate >0 to submit
    };

    const getTotalPagado = () => {
        return pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    };

    const getFaltante = () => {
        return Math.max(0, getTotal() - getTotalPagado());
    };

    const addPago = () => {
        if (!currentPagoType || !currentPagoMonto) return;

        const monto = parseFloat(currentPagoMonto);
        if (monto <= 0) {
            toast.error("El monto debe ser mayor a 0");
            return;
        }

        const tipo = tiposPago.find(tp => tp.id === parseInt(currentPagoType));
        if (!tipo) return;

        if (getTotalPagado() + monto > getTotal() + 0.01) {
            toast.error("El monto excede el total a pagar");
            return;
        }

        setPagos([...pagos, {
            tipoPagoId: tipo.id,
            nombre: tipo.nombre,
            monto: monto
        }]);

        setCurrentPagoType('');
        setCurrentPagoMonto('');
    };

    const removePago = (index) => {
        const newPagos = [...pagos];
        newPagos.splice(index, 1);
        setPagos(newPagos);
    };

    // Auto-fill amount logic
    useEffect(() => {
        if (currentPagoType) {
            const faltante = getFaltante();
            if (faltante > 0) {
                setCurrentPagoMonto(faltante.toFixed(2));
            }
        }
    }, [currentPagoType]);

    const handleSubmit = async () => {
        if (selectedClientes.length === 0 || !selectedTipoMembresia || !fechaInicio) {
            toast.error('Complete todos los campos requeridos');
            return;
        }

        if (pagos.length === 0) {
            toast.error('Debe agregar al menos un pago');
            return;
        }

        const total = getTotal();
        const pagado = getTotalPagado();

        if (Math.abs(pagado - total) > 0.05) {
            toast.error(`El pago total ($${pagado.toFixed(2)}) no coincide con el total ($${total.toFixed(2)})`);
            return;
        }

        setSubmitting(true);
        try {
            let request;

            // Logic: Always use the Group Endpoint for consistency if list > 1, 
            // OR even for 1 to support split payments if standard endpoint doesn't support it (which it does now).
            // But we created a specific DTO for multiple clients.
            // Let's use the group endpoint if we have multiple clients OR if we want to use the new DTO structure consistently.
            // Actually, existing CrearMembresiaRequest is for single client.
            // New GrupoMembresiaRequest is for list of clients.

            if (selectedClientes.length > 1) {
                // Group Request
                request = {
                    clientesIds: selectedClientes,
                    tipoMembresiaId: parseInt(selectedTipoMembresia),
                    pagos: pagos.map(p => ({
                        tipoPagoId: p.tipoPagoId,
                        monto: p.monto
                    })),
                    fechaInicio: fechaInicio,
                    referencia: 'Web'
                };
                await apiClient.post('/api/membresias/grupal', request); // Use generic client for new endpoint
            } else {
                // Single Request (using standard service if compatible, or just group with 1)
                // We updated CrearMembresiaRequest to support split payments too.
                request = {
                    clienteId: selectedClientes[0],
                    tipoMembresiaId: parseInt(selectedTipoMembresia),
                    pagos: pagos.map(p => ({
                        tipoPagoId: p.tipoPagoId,
                        monto: p.monto
                    })),
                    fechaInicio: fechaInicio,
                    referencia: 'Web'
                };
                await membresiaService.createMembresia(request);
            }

            toast.success('Membresía(s) creada(s) exitosamente');
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
                        <table className="membresias-table desktop-only">
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

                    {/* Mobile Card View */}
                    <div className="membresias-mobile-list mobile-only">
                        {membresias.map((m) => (
                            <div className="membresia-card" key={m.id}>
                                <div className="card-header">
                                    <div className="user-info">
                                        <div className="avatar-placeholder">
                                            {m.clienteNombre.charAt(0)}
                                        </div>
                                        <div>
                                            <h3>{m.clienteNombre}</h3>
                                            <span className="card-subtitle">#{m.id} • {m.tipoMembresiaNombre}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${m.estado === 'ACTIVA' ? 'badge-success' : 'badge-gray'}`}>
                                        {m.estado}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="card-row">
                                        <span><Calendar size={14} /> Inicio:</span>
                                        <strong>{format(new Date(m.fechaInicio), 'dd MMM', { locale: es })}</strong>
                                    </div>
                                    <div className="card-row">
                                        <span><Calendar size={14} /> Fin:</span>
                                        <strong>{format(new Date(m.fechaFin), 'dd MMM yyyy', { locale: es })}</strong>
                                    </div>
                                    <div className="card-row price-row">
                                        <span>Precio:</span>
                                        <span className="price-tag">${m.precio?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

                            {/* Clientes Group Selection */}
                            <div className="membresias-form-group">
                                <label>Cliente(s) *</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select
                                        value={currentClienteToAdd}
                                        onChange={(e) => setCurrentClienteToAdd(e.target.value)}
                                        style={{ flex: 1 }}
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre} {c.apellido} ({c.username})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addCliente}
                                        style={{
                                            height: '38px',
                                            backgroundColor: 'var(--color-bg-tertiary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '0 1rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="selected-clients-list" style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                    {selectedClientes.map(id => (
                                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid var(--color-border-light)', fontSize: '0.9rem' }}>
                                            <span>{getClienteName(id)}</span>
                                            <button onClick={() => removeCliente(id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} /></button>
                                        </div>
                                    ))}
                                    {selectedClientes.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ningún cliente seleccionado</span>}
                                </div>
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
                                    <div className="summary-row">
                                        <span>Clientes:</span>
                                        <span>{selectedClientes.length || 1}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total a Pagar:</span>
                                        <span>${getTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Split Payment Section (Reuse logic) */}
                            {planDetails && selectedClientes.length > 0 && (
                                <div className="membresias-form-group" style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                                    <label>Pagos</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <select
                                                value={currentPagoType}
                                                onChange={(e) => setCurrentPagoType(e.target.value)}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Método de pago...</option>
                                                {tiposPago.map(tp => (
                                                    <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ width: '100px' }}>
                                            <input
                                                type="number"
                                                value={currentPagoMonto}
                                                onChange={(e) => setCurrentPagoMonto(e.target.value)}
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addPago}
                                            style={{
                                                height: '38px',
                                                backgroundColor: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '0 1rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="pagos-list" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.5rem', marginBottom: '1rem' }}>
                                        {pagos.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Agrega un pago</div>
                                        ) : (
                                            pagos.map((p, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 5px', fontSize: '0.9rem' }}>
                                                    <span>{p.nombre}</span>
                                                    <span>${p.monto.toFixed(2)} <button onClick={() => removePago(index)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={12} /></button></span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="payment-summary" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span>Faltante: <span style={{ color: getFaltante() > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>${getFaltante().toFixed(2)}</span></span>
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
                                disabled={submitting || selectedClientes.length === 0 || getFaltante() > 0.05}
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
