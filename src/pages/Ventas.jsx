import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Trash2 } from 'lucide-react';
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
    const [selectedTipoPago, setSelectedTipoPago] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [submitting, setSubmitting] = useState(false);

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

            // Filter clientes (only CLIENTE role or all for now)
            setClientes(clientesRes.data);
            setProductos(productosRes);
            setTiposPago(tiposPagoRes.data);

            // Reset form
            setSelectedCliente('');
            setSelectedTipoPago('');
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

    const handleSubmit = async () => {
        if (!selectedCliente || !selectedTipoPago || cart.length === 0) {
            toast.error('Complete todos los campos');
            return;
        }

        setSubmitting(true);
        try {
            const request = {
                clienteId: parseInt(selectedCliente),
                tipoPagoId: parseInt(selectedTipoPago),
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
            const msg = error.response?.data?.message || error.response?.data || 'Error al procesar venta';
            toast.error(typeof msg === 'string' ? msg : 'Error al procesar venta');
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
                                            <span className={`estado-badge ${venta.estado?.toLowerCase()}`}>
                                                {venta.estado}
                                            </span>
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

            {/* Modal */}
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
                            {/* Cliente y Tipo de Pago */}
                            <div className="ventas-section">
                                <div className="ventas-section-title">Información de la Venta</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="ventas-form-group">
                                        <label>Cliente *</label>
                                        <select
                                            value={selectedCliente}
                                            onChange={(e) => setSelectedCliente(e.target.value)}
                                        >
                                            <option value="">Seleccionar cliente...</option>
                                            {clientes.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.nombre} {c.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="ventas-form-group">
                                        <label>Forma de Pago *</label>
                                        <select
                                            value={selectedTipoPago}
                                            onChange={(e) => setSelectedTipoPago(e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {tiposPago.map(tp => (
                                                <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Agregar Productos */}
                            <div className="ventas-section">
                                <div className="ventas-section-title">Agregar Productos</div>
                                <div className="product-selector">
                                    <select
                                        value={selectedProducto}
                                        onChange={(e) => setSelectedProducto(e.target.value)}
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {productos.filter(p => p.stockActual > 0).map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} - ${p.precioUnitario} (Stock: {p.stockActual})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                                        placeholder="Cant."
                                    />
                                    <button type="button" onClick={addToCart}>
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
                                        <span className="cart-total-label">TOTAL A PAGAR</span>
                                        <span className="cart-total-value">${getTotal().toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ventas-modal-footer">
                            <button type="button" className="ventas-btn-cancel" onClick={closeModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="ventas-btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0}
                            >
                                <ShoppingCart size={16} />
                                {submitting ? 'Procesando...' : 'Procesar Venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ventas;
