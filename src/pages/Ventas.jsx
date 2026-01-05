import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Trash2, Eye } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import apiClient from '../services/apiClient';
import ventaService from '../services/ventaService';
import productoService from '../services/productoService';
import toast, { Toaster } from 'react-hot-toast';
import './Ventas.css';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);

    // New Venta Form
    const [selectedCliente, setSelectedCliente] = useState('');

    // Split Payment State
    const [pagos, setPagos] = useState([]); // [{ tipoPagoId, nombre, monto }]
    const [currentPagoType, setCurrentPagoType] = useState('');
    const [currentPagoMonto, setCurrentPagoMonto] = useState('');

    const [cart, setCart] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null); // For detail modal

    useEffect(() => {
        fetchVentas();
    }, []);

    const fetchVentas = async () => {
        try {
            setLoading(true);
            const data = await ventaService.getVentas();
            setVentas(data);
        } catch (error) {
            console.error('Error fetching ventas:', error);
            toast.error('Error al cargar ventas');
        } finally {
            setLoading(false);
        }
    };

    const openModal = async () => {
        try {
            // Fetch data for the modal
            const [clientesRes, productosRes, tiposPagoRes] = await Promise.all([
                apiClient.get('/api/usuarios'),
                productoService.getAll(),
                apiClient.get('/api/tipos-pago')
            ]);

            setClientes(clientesRes.data);
            setProductos(productosRes);
            setTiposPago(tiposPagoRes.data);

            // Reset form
            setSelectedCliente('');
            setPagos([]);
            setCurrentPagoType('');
            setCurrentPagoMonto('');
            setCart([]);
            setSelectedProducto('');
            setCantidad(1);

            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading modal data:', error);
            toast.error('Error al cargar datos');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addToCart = () => {
        if (!selectedProducto || cantidad < 1) return;

        const producto = productos.find(p => p.id === parseInt(selectedProducto));
        if (!producto) return;

        // Check stock
        const existingItem = cart.find(item => item.productoId === producto.id);
        const totalCantidad = (existingItem?.cantidad || 0) + cantidad;

        if (totalCantidad > producto.stockActual) {
            toast.error(`Stock insuficiente. Disponible: ${producto.stockActual}`);
            return;
        }

        if (existingItem) {
            setCart(cart.map(item =>
                item.productoId === producto.id
                    ? { ...item, cantidad: item.cantidad + cantidad }
                    : item
            ));
        } else {
            setCart([...cart, {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precioUnitario,
                cantidad: cantidad,
                stockActual: producto.stockActual
            }]);
        }

        setSelectedProducto('');
        setCantidad(1);
    };

    const removeFromCart = (productoId) => {
        setCart(cart.filter(item => item.productoId !== productoId));
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    };

    // Payment Logic
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

        if (getTotalPagado() + monto > getTotal() + 0.01) { // small tolerance
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

    // Auto-fill amount when type selected
    useEffect(() => {
        if (currentPagoType) {
            const faltante = getFaltante();
            if (faltante > 0) {
                setCurrentPagoMonto(faltante.toFixed(2));
            }
        }
    }, [currentPagoType]);


    const handleSubmit = async () => {
        if (!selectedCliente || cart.length === 0) {
            toast.error('Complete la información de venta y productos');
            return;
        }

        if (pagos.length === 0) {
            toast.error('Debe agregar al menos un pago');
            return;
        }

        const total = getTotal();
        const pagado = getTotalPagado();

        if (Math.abs(pagado - total) > 0.05) { // 5 cent tolerance
            toast.error(`El pago total ($${pagado.toFixed(2)}) no coincide con el total de la venta ($${total.toFixed(2)})`);
            return;
        }

        setSubmitting(true);
        try {
            const request = {
                clienteId: parseInt(selectedCliente),
                pagos: pagos.map(p => ({
                    tipoPagoId: p.tipoPagoId,
                    monto: p.monto
                })),
                items: cart.map(item => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad
                }))
            };

            await ventaService.createVenta(request);
            toast.success('Venta registrada exitosamente');
            closeModal();
            fetchVentas();
        } catch (error) {
            console.error('Error creating venta:', error);
            const msg = error.response?.data?.message || 'Error al procesar venta';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="ventas-page">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="ventas-header">
                <div className="ventas-header-title">
                    <ShoppingCart size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Punto de Venta</h1>
                        <p>Gestiona las ventas de productos</p>
                    </div>
                </div>
                <button className="ventas-btn-new" onClick={openModal}>
                    <Plus size={18} />
                    Nueva Venta
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="ventas-loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="ventas-table-container">
                    {ventas.length > 0 ? (
                        <table className="ventas-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventas.map((venta) => (
                                    <tr key={venta.id}>
                                        <td>#{venta.id}</td>
                                        <td>{venta.clienteNombre}</td>
                                        <td>{formatDate(venta.fechaVenta)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--color-accent-primary)' }}>
                                            ${venta.total?.toFixed(2)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className={`estado-badge ${venta.estado?.toLowerCase()}`}>
                                                    {venta.estado}
                                                </span>
                                                <button
                                                    className="icon-btn-view"
                                                    onClick={() => setSelectedVenta(venta)}
                                                    title="Ver Detalle"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="ventas-empty">
                            <ShoppingCart size={48} />
                            <p>No hay ventas registradas</p>
                        </div>
                    )}
                </div>
            )}

            {/* Sale Detail Modal */}
            {selectedVenta && (
                <div className="ventas-modal-overlay" onClick={() => setSelectedVenta(null)}>
                    <div className="ventas-modal detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ventas-modal-header">
                            <h2>Detalle de Venta #{selectedVenta.id}</h2>
                            <button className="ventas-modal-close" onClick={() => setSelectedVenta(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="ventas-modal-body">
                            <div className="detail-info-grid">
                                <div className="detail-item">
                                    <span className="label">Cliente</span>
                                    <span className="value">{selectedVenta.clienteNombre}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Fecha</span>
                                    <span className="value">{formatDate(selectedVenta.fechaVenta)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Total</span>
                                    <span className="value highlight">${selectedVenta.total?.toFixed(2)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Estado</span>
                                    <span className={`value badge ${selectedVenta.estado?.toLowerCase()}`}>
                                        {selectedVenta.estado}
                                    </span>
                                </div>
                            </div>

                            <h3 className="detail-subtitle">Productos</h3>
                            <div className="detail-products-list">
                                {selectedVenta.detalles && selectedVenta.detalles.length > 0 ? (
                                    selectedVenta.detalles.map((detalle, idx) => (
                                        <div key={idx} className="detail-product-row">
                                            <span className="prod-name">{detalle.productoNombre}</span>
                                            <span className="prod-calc">
                                                {detalle.cantidad} x ${detalle.precioUnitario?.toFixed(2)}
                                            </span>
                                            <span className="prod-subtotal">
                                                ${detalle.subtotal?.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-details">No hay detalles disponibles</div>
                                )}
                            </div>
                        </div>
                        <div className="ventas-modal-footer">
                            <button className="ventas-btn-cancel" onClick={() => setSelectedVenta(null)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Sale Modal */}
            {isModalOpen && (
                <div className="ventas-modal-overlay" onClick={closeModal}>
                    <div className="ventas-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ventas-modal-header">
                            <h2><ShoppingCart size={20} /> Nueva Venta</h2>
                            <button className="ventas-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="ventas-modal-body">
                            {/* Cliente */}
                            <div className="ventas-section">
                                <div className="ventas-section-title">Información de Venta</div>
                                <div className="ventas-form-group">
                                    <label>Cliente *</label>
                                    <SearchableSelect
                                        options={clientes.map(c => ({
                                            value: c.id,
                                            label: `${c.nombre} ${c.apellido} (${c.cedula || 'N/A'})`,
                                            cedula: c.cedula,
                                            nombre: `${c.nombre} ${c.apellido}`
                                        }))}
                                        value={selectedCliente}
                                        onChange={(val) => setSelectedCliente(val)}
                                        placeholder="Buscar cliente por nombre o cédula..."
                                        filterFunction={(option, search) => {
                                            const searchLower = search.toLowerCase();
                                            const nombreMatch = option.nombre.toLowerCase().includes(searchLower);
                                            const cedulaMatch = option.cedula && option.cedula.includes(searchLower);
                                            return nombreMatch || cedulaMatch;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Agregar Productos */}
                            <div className="ventas-section">
                                <div className="ventas-section-title">Productos</div>
                                <div className="product-selector">
                                    <div style={{ flex: 1 }}>
                                        <SearchableSelect
                                            options={productos.filter(p => p.stockActual > 0).map(p => ({
                                                value: p.id,
                                                label: `${p.nombre} - $${p.precioUnitario} (Stock: ${p.stockActual})`,
                                                nombre: p.nombre
                                            }))}
                                            value={selectedProducto}
                                            onChange={(val) => setSelectedProducto(val)}
                                            placeholder="Buscar producto..."
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                                        placeholder="Cant."
                                        className="input-cantidad-dark"
                                    />
                                    <button type="button" onClick={addToCart} className="btn-add-cart-dark">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Cart */}
                                <div className="cart-items">
                                    {cart.length === 0 ? (
                                        <div className="cart-empty">
                                            Agrega productos al carrito
                                        </div>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.productoId} className="cart-item">
                                                <div className="cart-item-info">
                                                    <span className="name">{item.nombre}</span>
                                                    <span className="details">
                                                        {item.cantidad} x ${item.precioUnitario}
                                                    </span>
                                                </div>
                                                <div className="cart-item-actions">
                                                    <span className="cart-item-subtotal">
                                                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                                                    </span>
                                                    <button
                                                        className="cart-item-remove"
                                                        onClick={() => removeFromCart(item.productoId)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Total */}
                                {cart.length > 0 && (
                                    <div className="cart-total">
                                        <span className="cart-total-label">Subtotal Venta</span>
                                        <span className="cart-total-value">${getTotal().toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Section (Split Payment) */}
                            {cart.length > 0 && (
                                <div className="ventas-section">
                                    <div className="ventas-section-title">Pagos</div>

                                    {/* Add Payment Form */}
                                    <div className="payment-adder" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                                        <div className="ventas-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Método</label>
                                            <select
                                                value={currentPagoType}
                                                onChange={(e) => setCurrentPagoType(e.target.value)}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {tiposPago.map(tp => (
                                                    <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="ventas-form-group" style={{ width: '120px', marginBottom: 0 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Monto</label>
                                            <input
                                                type="number"
                                                value={currentPagoMonto}
                                                onChange={(e) => setCurrentPagoMonto(e.target.value)}
                                                step="0.01"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addPago}
                                            className="btn-add-pago"
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

                                    {/* Payments List */}
                                    <div className="pagos-list" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                                        {pagos.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                                No hay pagos registrados
                                            </div>
                                        ) : (
                                            pagos.map((p, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
                                                    <span>{p.nombre}</span>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600 }}>${p.monto.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => removePago(index)}
                                                            style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Payment Totals */}
                                    <div className="payment-summary" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Total a Pagar:</span>
                                            <span style={{ fontWeight: 700, marginLeft: '5px' }}>${getTotal().toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Pagado:</span>
                                            <span style={{ fontWeight: 700, marginLeft: '5px', color: 'var(--color-success)' }}>${getTotalPagado().toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Faltante:</span>
                                            <span style={{ fontWeight: 700, marginLeft: '5px', color: getFaltante() > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                                                ${getFaltante().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="ventas-modal-footer">
                            <button type="button" className="ventas-btn-cancel" onClick={closeModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="ventas-btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0 || getFaltante() > 0.05}
                            >
                                <ShoppingCart size={16} />
                                {submitting ? 'Procesando...' : 'Completar Venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ventas;
