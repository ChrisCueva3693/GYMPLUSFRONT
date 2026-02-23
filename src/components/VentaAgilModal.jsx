import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Plus, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import ventaService from '../services/ventaService';
import toast from 'react-hot-toast';
import './VentaAgilModal.css';

const VentaAgilModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tiposPago, setTiposPago] = useState([]);

    const [cart, setCart] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedPagoType, setSelectedPagoType] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        } else {
            // Reset state when closed
            setCart([]);
            setBarcodeInput('');
            setSelectedCliente('');
            setSelectedPagoType('');
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [productosRes, clientesRes, tiposPagoRes] = await Promise.all([
                apiClient.get('/api/productos'),
                apiClient.get('/api/usuarios'),
                apiClient.get('/api/tipos-pago')
            ]);

            const loadedProductos = productosRes.data.filter(p => p.activo && p.stockActual > 0);
            setProductos(loadedProductos);
            setTiposPago(tiposPagoRes.data);

            let loadedClientes = clientesRes.data;
            if (user && !user.roles.includes('DEV')) {
                if (user.idGimnasio) {
                    loadedClientes = loadedClientes.filter(c => c.idGimnasio === user.idGimnasio);
                }
                if (user.idSucursalPorDefecto) {
                    loadedClientes = loadedClientes.filter(c => c.idSucursalPorDefecto === user.idSucursalPorDefecto);
                }
            }
            setClientes(loadedClientes);

            // Default Cliente (Consumidor Final or 9999999999)
            const consumidorFinal = loadedClientes.find(c =>
                c.cedula === '9999999999' ||
                (c.nombre && c.nombre.toLowerCase().includes('consumidor'))
            );
            if (consumidorFinal) {
                setSelectedCliente(consumidorFinal.id);
            } else if (loadedClientes.length > 0) {
                // If no consumidor final, don't set a default to force them to pick, or we could pick the first.
            }

            // Default Pago (Efectivo)
            const pagoEfectivo = tiposPagoRes.data.find(tp =>
                tp.descripcion.toLowerCase().includes('efectivo')
            );
            if (pagoEfectivo) {
                setSelectedPagoType(pagoEfectivo.id.toString());
            } else if (tiposPagoRes.data.length > 0) {
                setSelectedPagoType(tiposPagoRes.data[0].id.toString());
            }

        } catch (error) {
            console.error('Error fetching data for venta agil:', error);
            toast.error('Error al cargar datos para venta rápida');
        }
    };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        const productoFound = productos.find(p => p.codigo === code);

        if (productoFound) {
            addToCart(productoFound);
        } else {
            toast.error(`Producto con código ${code} no encontrado o sin stock`);
        }
        setBarcodeInput('');
    };

    const addToCart = (producto) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.productoId === producto.id);
            if (existing) {
                if (existing.cantidad >= producto.stockActual) {
                    toast.error(`Stock máximo alcanzado para ${producto.nombre}`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.productoId === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prevCart, {
                productoId: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precioUnitario: producto.precioUnitario,
                cantidad: 1,
                stockDisponible: producto.stockActual
            }];
        });
    };

    const removeFromCart = (productoId) => {
        setCart(cart.filter(item => item.productoId !== productoId));
    };

    const updateQuantity = (productoId, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.productoId === productoId) {
                    const newQuant = item.cantidad + delta;
                    if (newQuant > 0 && newQuant <= item.stockDisponible) {
                        return { ...item, cantidad: newQuant };
                    }
                }
                return item;
            });
        });
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
    };

    const handleSubmitVenta = async () => {
        if (!selectedCliente) {
            toast.error('Seleccione un cliente (o cree un Consumidor Final)');
            return;
        }
        if (cart.length === 0) {
            toast.error('Agregue al menos un producto escaneando su código');
            return;
        }
        if (!selectedPagoType) {
            toast.error('Seleccione un método de pago');
            return;
        }

        setSubmitting(true);
        const total = getTotal();

        try {
            const request = {
                clienteId: parseInt(selectedCliente),
                pagos: [{ tipoPagoId: parseInt(selectedPagoType), monto: total }],
                items: cart.map(item => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad
                }))
            };

            await ventaService.createVenta(request);
            toast.success('Venta registrada exitosamente');
            onClose();
        } catch (error) {
            console.error('Error procesando venta agil:', error);
            const msg = error.response?.data?.message || 'Error al procesar la venta';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="venta-agil-overlay" onClick={onClose}>
            <div className="venta-agil-modal" onClick={(e) => e.stopPropagation()}>
                <div className="venta-agil-header">
                    <h2>Venta Rápida (Escáner)</h2>
                    <button className="venta-agil-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="venta-agil-body">
                    {/* Scanner Input */}
                    <div className="scanner-section">
                        <form onSubmit={handleBarcodeSubmit} className="scanner-form">
                            <div className="scanner-input-wrapper">
                                <Search className="scanner-icon" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="scanner-input"
                                    placeholder="Escanea o ingresa el código del producto y presiona Enter..."
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    disabled={submitting}
                                />
                            </div>
                            <button type="submit" style={{ display: 'none' }}>Buscar</button>
                        </form>
                    </div>

                    <div className="venta-agil-columns">
                        {/* Cart Items */}
                        <div className="venta-agil-cart">
                            <h3>Carrito de Compras</h3>
                            {cart.length === 0 ? (
                                <div className="cart-empty-state">
                                    <ShoppingCart size={40} />
                                    <p>Esperando código de producto...</p>
                                </div>
                            ) : (
                                <div className="cart-list">
                                    {cart.map((item) => (
                                        <div key={item.productoId} className="cart-item-row">
                                            <div className="item-info">
                                                <span className="item-codigo">[{item.codigo || 'S/C'}]</span>
                                                <span className="item-name">{item.nombre}</span>
                                            </div>
                                            <div className="item-controls">
                                                <div className="qty-control">
                                                    <button onClick={() => updateQuantity(item.productoId, -1)}>-</button>
                                                    <span>{item.cantidad}</span>
                                                    <button onClick={() => updateQuantity(item.productoId, 1)}>+</button>
                                                </div>
                                                <span className="item-price">${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                                                <button className="btn-remove" onClick={() => removeFromCart(item.productoId)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="venta-agil-settings">
                            <div className="settings-group">
                                <label>Cliente</label>
                                <select
                                    value={selectedCliente}
                                    onChange={(e) => setSelectedCliente(e.target.value)}
                                    className="agil-select"
                                >
                                    <option value="">Seleccione Cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} {c.apellido} ({c.cedula || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="settings-group">
                                <label>Método de Pago</label>
                                <select
                                    value={selectedPagoType}
                                    onChange={(e) => setSelectedPagoType(e.target.value)}
                                    className="agil-select"
                                >
                                    {tiposPago.map(tp => (
                                        <option key={tp.id} value={tp.id}>{tp.descripcion}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="agil-total-card">
                                <span>TOTAL A COBRAR</span>
                                <h2>${getTotal().toFixed(2)}</h2>
                            </div>

                            <button
                                className="btn-confirm-agil"
                                onClick={handleSubmitVenta}
                                disabled={submitting || cart.length === 0}
                            >
                                {submitting ? 'Procesando...' : (
                                    <>
                                        <Check size={20} />
                                        Confirmar Venta
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentaAgilModal;
