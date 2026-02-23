import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, X, Calendar, User, CheckCircle, XCircle, Pencil, Trash2, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import apiClient from '../services/apiClient';
import membresiaService from '../services/membresiaService';
import toast, { Toaster } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import './Membresias.css';

const Membresias = () => {
    const [membresias, setMembresias] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [tiposMembresia, setTiposMembresia] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);

    const [selectedClientes, setSelectedClientes] = useState([]);
    const [currentClienteToAdd, setCurrentClienteToAdd] = useState('');

    const [pagos, setPagos] = useState([]);
    const [currentPagoType, setCurrentPagoType] = useState('');
    const [currentPagoMonto, setCurrentPagoMonto] = useState('');

    const [selectedTipoMembresia, setSelectedTipoMembresia] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMembresia, setEditingMembresia] = useState(null);
    const [editTipoMembresia, setEditTipoMembresia] = useState('');
    const [editFechaInicio, setEditFechaInicio] = useState('');
    const [editEstado, setEditEstado] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete Confirm State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingMembresia, setDeletingMembresia] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Abono Modal State
    const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
    const [abonoMembresia, setAbonoMembresia] = useState(null);
    const [abonoTipoPago, setAbonoTipoPago] = useState('');
    const [abonoMonto, setAbonoMonto] = useState('');
    const [abonoSubmitting, setAbonoSubmitting] = useState(false);

    const isAdmin = user && (user.roles.includes('ADMIN') || user.roles.includes('DEV'));
    const canRegisterAbono = user && (user.roles.includes('ADMIN') || user.roles.includes('DEV') || user.roles.includes('COACH'));

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

            let filteredClientes = clientesRes.data;
            if (user && !user.roles.includes('DEV')) {
                if (user.idGimnasio) {
                    filteredClientes = filteredClientes.filter(c => c.idGimnasio === user.idGimnasio);
                }
                if (user.idSucursalPorDefecto) {
                    filteredClientes = filteredClientes.filter(c => c.idSucursalPorDefecto === user.idSucursalPorDefecto);
                }
            }

            setClientes(filteredClientes);
            setTiposMembresia(tiposMembresiaRes.data);
            setTiposPago(tiposPagoRes.data);

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

    const closeModal = () => { setIsModalOpen(false); };

    const getSelectedPlanDetails = () => {
        if (!selectedTipoMembresia) return null;
        return tiposMembresia.find(tm => tm.id === parseInt(selectedTipoMembresia));
    };

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

    const getTotal = () => {
        const plan = getSelectedPlanDetails();
        if (!plan) return 0;
        return plan.precioBase * (selectedClientes.length > 0 ? selectedClientes.length : 1);
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
        if (monto <= 0) { toast.error("El monto debe ser mayor a 0"); return; }

        const tipo = tiposPago.find(tp => tp.id === parseInt(currentPagoType));
        if (!tipo) return;

        if (getTotalPagado() + monto > getTotal() + 0.01) {
            toast.error("El monto excede el total a pagar");
            return;
        }

        setPagos([...pagos, { tipoPagoId: tipo.id, nombre: tipo.nombre, monto: monto }]);
        setCurrentPagoType('');
        setCurrentPagoMonto('');
    };

    const removePago = (index) => {
        const newPagos = [...pagos];
        newPagos.splice(index, 1);
        setPagos(newPagos);
    };

    useEffect(() => {
        if (currentPagoType) {
            const faltante = getFaltante();
            if (faltante > 0) setCurrentPagoMonto(faltante.toFixed(2));
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

        setSubmitting(true);
        try {
            let request;
            if (selectedClientes.length > 1) {
                request = {
                    clientesIds: selectedClientes,
                    tipoMembresiaId: parseInt(selectedTipoMembresia),
                    pagos: pagos.map(p => ({ tipoPagoId: p.tipoPagoId, monto: p.monto })),
                    fechaInicio: fechaInicio,
                    referencia: 'Web'
                };
                await apiClient.post('/api/membresias/grupal', request);
            } else {
                request = {
                    clienteId: selectedClientes[0],
                    tipoMembresiaId: parseInt(selectedTipoMembresia),
                    pagos: pagos.map(p => ({ tipoPagoId: p.tipoPagoId, monto: p.monto })),
                    fechaInicio: fechaInicio,
                    referencia: 'Web'
                };
                await membresiaService.createMembresia(request);
            }

            toast.success(getFaltante() > 0.05
                ? 'Membresía(s) creada(s) con saldo pendiente'
                : 'Membresía(s) creada(s) exitosamente');
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

    // ===== EDIT LOGIC =====
    const openEditModal = async (membresia) => {
        try {
            const tiposMembresiaRes = await apiClient.get('/api/tipos-membresia');
            setTiposMembresia(tiposMembresiaRes.data);
        } catch (error) { toast.error('Error al cargar tipos de membresía'); return; }
        setEditingMembresia(membresia);
        setEditTipoMembresia(membresia.tipoMembresiaId.toString());
        setEditFechaInicio(membresia.fechaInicio);
        setEditEstado(membresia.estado);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => { setIsEditModalOpen(false); setEditingMembresia(null); };

    const handleEditSubmit = async () => {
        if (!editTipoMembresia || !editFechaInicio || !editEstado) { toast.error('Complete todos los campos'); return; }
        setEditSubmitting(true);
        try {
            await membresiaService.updateMembresia(editingMembresia.id, {
                tipoMembresiaId: parseInt(editTipoMembresia),
                fechaInicio: editFechaInicio,
                estado: editEstado
            });
            toast.success('Membresía actualizada exitosamente');
            closeEditModal();
            fetchMembresias();
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al actualizar membresía';
            toast.error(msg);
        } finally { setEditSubmitting(false); }
    };

    // ===== DELETE LOGIC =====
    const openDeleteModal = (membresia) => { setDeletingMembresia(membresia); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setDeletingMembresia(null); };

    const handleDeleteConfirm = async () => {
        setDeleteSubmitting(true);
        try {
            await membresiaService.deleteMembresia(deletingMembresia.id);
            toast.success('Membresía eliminada exitosamente');
            closeDeleteModal();
            fetchMembresias();
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al eliminar membresía';
            toast.error(msg);
        } finally { setDeleteSubmitting(false); }
    };

    // ===== ABONO LOGIC =====
    const openAbonoModal = async (membresia) => {
        try {
            const tiposPagoRes = await apiClient.get('/api/tipos-pago');
            setTiposPago(tiposPagoRes.data);
        } catch (error) { toast.error('Error al cargar tipos de pago'); return; }
        setAbonoMembresia(membresia);
        setAbonoMonto(membresia.saldoPendiente?.toFixed(2) || '');
        setAbonoTipoPago('');
        setIsAbonoModalOpen(true);
    };

    const closeAbonoModal = () => { setIsAbonoModalOpen(false); setAbonoMembresia(null); };

    const handleAbonoSubmit = async () => {
        if (!abonoTipoPago || !abonoMonto) { toast.error('Complete todos los campos'); return; }
        const monto = parseFloat(abonoMonto);
        if (monto <= 0) { toast.error('El monto debe ser mayor a 0'); return; }

        setAbonoSubmitting(true);
        try {
            await membresiaService.registrarAbono(abonoMembresia.id, {
                tipoPagoId: parseInt(abonoTipoPago),
                monto: monto,
                referencia: 'ABONO'
            });
            toast.success('Abono registrado exitosamente');
            closeAbonoModal();
            fetchMembresias();
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al registrar abono';
            toast.error(msg);
        } finally { setAbonoSubmitting(false); }
    };

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'ACTIVA': return 'badge-success';
            case 'PENDIENTE': return 'badge-warning';
            case 'VENCIDA': return 'badge-gray';
            case 'CANCELADA': return 'badge-danger';
            default: return 'badge-gray';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'ACTIVA': return <CheckCircle size={12} />;
            case 'PENDIENTE': return <Clock size={12} />;
            default: return <XCircle size={12} />;
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
                                    <th>Pendiente</th>
                                    <th>Estado</th>
                                    <th>Registrado por</th>
                                    {(isAdmin || canRegisterAbono) && <th>Acciones</th>}
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
                                            {m.saldoPendiente > 0 ? (
                                                <span className="saldo-pendiente-value">${m.saldoPendiente?.toFixed(2)}</span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)' }}>$0.00</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getEstadoBadgeClass(m.estado)}`}>
                                                {getEstadoIcon(m.estado)}
                                                {m.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="registrado-por-text">
                                                {m.registradoPorNombre || '-'}
                                            </span>
                                        </td>
                                        {(isAdmin || canRegisterAbono) && (
                                            <td>
                                                <div className="membresia-actions">
                                                    {canRegisterAbono && m.saldoPendiente > 0 && (
                                                        <button className="btn-abono-inline" onClick={() => openAbonoModal(m)} title="Registrar Abono">
                                                            <DollarSign size={14} />
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <button className="sucursal-btn-edit" onClick={() => openEditModal(m)}>
                                                                <Pencil size={14} /> Editar
                                                            </button>
                                                            <button className="sucursal-btn-delete" onClick={() => openDeleteModal(m)}>
                                                                <Trash2 size={14} /> Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}
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
                                    <span className={`status-badge ${getEstadoBadgeClass(m.estado)}`}>
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
                                    {m.saldoPendiente > 0 && (
                                        <div className="card-row">
                                            <span>Pendiente:</span>
                                            <span className="saldo-pendiente-value">${m.saldoPendiente?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {m.registradoPorNombre && (
                                        <div className="card-row">
                                            <span><User size={14} /> Registrado:</span>
                                            <span>{m.registradoPorNombre}</span>
                                        </div>
                                    )}
                                </div>
                                {(isAdmin || canRegisterAbono) && (
                                    <div className="membresia-card-actions">
                                        {canRegisterAbono && m.saldoPendiente > 0 && (
                                            <button className="btn-abono-inline" onClick={() => openAbonoModal(m)}>
                                                <DollarSign size={14} /> Abono
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <>
                                                <button className="sucursal-btn-edit" onClick={() => openEditModal(m)}>
                                                    <Pencil size={14} /> Editar
                                                </button>
                                                <button className="sucursal-btn-delete" onClick={() => openDeleteModal(m)}>
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== CREATE MODAL ===== */}
            {isModalOpen && (
                <div className="membresias-modal-overlay" onClick={closeModal}>
                    <div className="membresias-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="membresias-modal-header">
                            <h2><CreditCard size={20} /> Nueva Membresía</h2>
                            <button className="membresias-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        <div className="membresias-modal-body">
                            <div className="membresias-form-group">
                                <label>Cliente(s) *</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select value={currentClienteToAdd} onChange={(e) => setCurrentClienteToAdd(e.target.value)} style={{ flex: 1 }}>
                                        <option value="">Seleccionar cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.username})</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={addCliente} style={{ height: '38px', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 1rem', cursor: 'pointer' }}>
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
                                <select value={selectedTipoMembresia} onChange={(e) => setSelectedTipoMembresia(e.target.value)}>
                                    <option value="">Seleccionar plan...</option>
                                    {tiposMembresia.map(tm => (
                                        <option key={tm.id} value={tm.id}>{tm.nombre} - ${tm.precioBase} ({tm.duracionDias} días)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="membresias-form-group">
                                <label>Fecha de Inicio *</label>
                                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                            </div>

                            {planDetails && (
                                <div className="membership-summary">
                                    <div className="summary-row"><span>Plan Seleccionado:</span><span>{planDetails.nombre}</span></div>
                                    <div className="summary-row"><span>Duración:</span><span>{planDetails.duracionDias} días</span></div>
                                    <div className="summary-row"><span>Vencimiento estimado:</span><span>{fechaFinCalculada}</span></div>
                                    <div className="summary-row"><span>Clientes:</span><span>{selectedClientes.length || 1}</span></div>
                                    <div className="summary-row total"><span>Total a Pagar:</span><span>${getTotal().toFixed(2)}</span></div>
                                </div>
                            )}

                            {/* Split Payment Section */}
                            {planDetails && selectedClientes.length > 0 && (
                                <div className="membresias-form-group" style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                                    <label>Pagos</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <select value={currentPagoType} onChange={(e) => setCurrentPagoType(e.target.value)} style={{ width: '100%' }}>
                                                <option value="">Método de pago...</option>
                                                {tiposPago.map(tp => (
                                                    <option key={tp.id} value={tp.id}>{tp.descripcion}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ width: '100px' }}>
                                            <input type="number" value={currentPagoMonto} onChange={(e) => setCurrentPagoMonto(e.target.value)} step="0.01" placeholder="0.00" />
                                        </div>
                                        <button type="button" onClick={addPago} style={{ height: '38px', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 1rem', cursor: 'pointer' }}>
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
                                        <span>Faltante: <span style={{ color: getFaltante() > 0 ? '#f59e0b' : 'var(--color-text-muted)' }}>${getFaltante().toFixed(2)}</span></span>
                                    </div>
                                    {getFaltante() > 0.05 && pagos.length > 0 && (
                                        <div className="partial-payment-notice">
                                            La membresía se creará con estado <strong>PENDIENTE</strong> y un saldo de <strong>${getFaltante().toFixed(2)}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="membresias-modal-footer">
                            <button type="button" className="membresias-btn-cancel" onClick={closeModal}>Cancelar</button>
                            <button type="button" className="membresias-btn-submit" onClick={handleSubmit}
                                disabled={submitting || selectedClientes.length === 0 || pagos.length === 0}>
                                <CreditCard size={16} />
                                {submitting ? 'Procesando...' : (getFaltante() > 0.05 ? 'Crear con Saldo Pendiente' : 'Crear Membresía')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT MODAL ===== */}
            {isEditModalOpen && editingMembresia && (
                <div className="membresias-modal-overlay" onClick={closeEditModal}>
                    <div className="membresias-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="membresias-modal-header">
                            <h2><Pencil size={20} /> Editar Membresía #{editingMembresia.id}</h2>
                            <button className="membresias-modal-close" onClick={closeEditModal}><X size={18} /></button>
                        </div>
                        <div className="membresias-modal-body">
                            <div className="edit-member-info"><User size={16} /><span>{editingMembresia.clienteNombre}</span></div>
                            <div className="membresias-form-group">
                                <label>Plan / Tipo de Membresía</label>
                                <select value={editTipoMembresia} onChange={(e) => setEditTipoMembresia(e.target.value)}>
                                    {tiposMembresia.map(tm => (
                                        <option key={tm.id} value={tm.id}>{tm.nombre} - ${tm.precioBase} ({tm.duracionDias} días)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="membresias-form-group">
                                <label>Fecha de Inicio</label>
                                <input type="date" value={editFechaInicio} onChange={(e) => setEditFechaInicio(e.target.value)} />
                            </div>
                            <div className="membresias-form-group">
                                <label>Estado</label>
                                <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
                                    <option value="ACTIVA">ACTIVA</option>
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="VENCIDA">VENCIDA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                </select>
                            </div>
                        </div>
                        <div className="membresias-modal-footer">
                            <button type="button" className="membresias-btn-cancel" onClick={closeEditModal}>Cancelar</button>
                            <button type="button" className="membresias-btn-submit" onClick={handleEditSubmit} disabled={editSubmitting}>
                                <Pencil size={16} /> {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {isDeleteModalOpen && deletingMembresia && (
                <div className="membresias-modal-overlay" onClick={closeDeleteModal}>
                    <div className="membresias-modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="membresias-modal-header delete-modal-header">
                            <h2><AlertTriangle size={20} /> Confirmar Eliminación</h2>
                            <button className="membresias-modal-close" onClick={closeDeleteModal}><X size={18} /></button>
                        </div>
                        <div className="membresias-modal-body delete-modal-body">
                            <div className="delete-warning-icon"><AlertTriangle size={48} /></div>
                            <p className="delete-warning-text">
                                ¿Estás seguro de eliminar la membresía <strong>#{deletingMembresia.id}</strong> de <strong>{deletingMembresia.clienteNombre}</strong>?
                            </p>
                            <p className="delete-warning-subtext">Esta acción eliminará la membresía y todos sus pagos asociados. No se puede deshacer.</p>
                        </div>
                        <div className="membresias-modal-footer">
                            <button type="button" className="membresias-btn-cancel" onClick={closeDeleteModal}>Cancelar</button>
                            <button type="button" className="membresias-btn-delete-confirm" onClick={handleDeleteConfirm} disabled={deleteSubmitting}>
                                <Trash2 size={16} /> {deleteSubmitting ? 'Eliminando...' : 'Eliminar Membresía'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ABONO MODAL ===== */}
            {isAbonoModalOpen && abonoMembresia && (
                <div className="membresias-modal-overlay" onClick={closeAbonoModal}>
                    <div className="membresias-modal abono-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="membresias-modal-header">
                            <h2><DollarSign size={20} /> Registrar Abono</h2>
                            <button className="membresias-modal-close" onClick={closeAbonoModal}><X size={18} /></button>
                        </div>
                        <div className="membresias-modal-body">
                            <div className="abono-info-card">
                                <div className="abono-info-row">
                                    <span>Membresía</span>
                                    <strong>#{abonoMembresia.id} — {abonoMembresia.clienteNombre}</strong>
                                </div>
                                <div className="abono-info-row">
                                    <span>Plan</span>
                                    <strong>{abonoMembresia.tipoMembresiaNombre} — ${abonoMembresia.precio?.toFixed(2)}</strong>
                                </div>
                                <div className="abono-info-row saldo-highlight">
                                    <span>Saldo Pendiente</span>
                                    <strong>${abonoMembresia.saldoPendiente?.toFixed(2)}</strong>
                                </div>
                            </div>

                            <div className="membresias-form-group">
                                <label>Método de Pago *</label>
                                <select value={abonoTipoPago} onChange={(e) => setAbonoTipoPago(e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {tiposPago.map(tp => (
                                        <option key={tp.id} value={tp.id}>{tp.descripcion}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="membresias-form-group">
                                <label>Monto del Abono *</label>
                                <input type="number" value={abonoMonto} onChange={(e) => setAbonoMonto(e.target.value)}
                                    step="0.01" max={abonoMembresia.saldoPendiente} placeholder="0.00" />
                            </div>
                        </div>
                        <div className="membresias-modal-footer">
                            <button className="membresias-btn-cancel" onClick={closeAbonoModal}>Cancelar</button>
                            <button className="membresias-btn-submit" onClick={handleAbonoSubmit}
                                disabled={abonoSubmitting || !abonoTipoPago || !abonoMonto}>
                                <DollarSign size={16} /> {abonoSubmitting ? 'Registrando...' : 'Registrar Abono'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membresias;
