import React, { useState, useEffect } from 'react';
import productoService from '../services/productoService';
import { Plus, Edit, Trash2, Search, Package, Save, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './Productos.css';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProducto, setCurrentProducto] = useState({
        nombre: '',
        codigo: '',
        descripcion: '',
        precioUnitario: '',
        stockActual: 0,
        activo: true
    });

    useEffect(() => {
        fetchProductos();
    }, []);

    useEffect(() => {
        const results = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProductos(results);
    }, [searchTerm, productos]);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const data = await productoService.getAll();
            setProductos(data);
            setFilteredProductos(data);
        } catch (error) {
            console.error('Error fetching productos:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (producto = null) => {
        if (producto) {
            setIsEditing(true);
            setCurrentProducto(producto);
        } else {
            setIsEditing(false);
            setCurrentProducto({
                nombre: '',
                codigo: '',
                descripcion: '',
                precioUnitario: '',
                stockActual: 0,
                activo: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await productoService.update(currentProducto.id, currentProducto);
                toast.success('Producto actualizado');
            } else {
                await productoService.create(currentProducto);
                toast.success('Producto creado');
            }
            closeModal();
            fetchProductos();
        } catch (error) {
            console.error('Error saving producto:', error);
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este producto?')) {
            try {
                await productoService.remove(id);
                toast.success('Producto eliminado');
                fetchProductos();
            } catch (error) {
                toast.error('Error al eliminar');
            }
        }
    };

    return (
        <div className="productos-page">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="productos-header">
                <div className="productos-header-title">
                    <Package size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Gestión de Productos</h1>
                        <p>Administra el inventario de tu sucursal</p>
                    </div>
                </div>
                <button className="productos-btn-new" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Nuevo Producto
                </button>
            </div>

            {/* Search Bar */}
            <div className="productos-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="productos-loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="productos-table-container">
                    {filteredProductos.length > 0 ? (
                        <table className="productos-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Código</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProductos.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>
                                            <div className="producto-name-cell">
                                                <div className="producto-icon-small">
                                                    <Package size={18} />
                                                </div>
                                                <div className="producto-info">
                                                    <span className="name">{producto.nombre}</span>
                                                    {producto.descripcion && (
                                                        <span className="description">{producto.descripcion}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {producto.codigo ? (
                                                <span className="producto-code">{producto.codigo}</span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="producto-price">${producto.precioUnitario}</span>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${producto.stockActual > 5 ? 'ok' : 'low'}`}>
                                                {producto.stockActual} unidades
                                            </span>
                                        </td>
                                        <td>
                                            <div className="producto-actions">
                                                <button className="btn-edit" onClick={() => handleOpenModal(producto)} title="Editar">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(producto.id)} title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="productos-empty">
                            <Package size={48} />
                            <p>No se encontraron productos</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="productos-modal-overlay" onClick={closeModal}>
                    <div className="productos-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="productos-modal-header">
                            <div className="productos-modal-header-info">
                                <div className="productos-modal-header-icon">
                                    {isEditing ? <Edit size={20} /> : <Package size={20} />}
                                </div>
                                <div>
                                    <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                    <p>{isEditing ? 'Modifica los detalles' : 'Ingresa la información'}</p>
                                </div>
                            </div>
                            <button className="productos-modal-close" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="productos-modal-body">
                                <div className="productos-form-group">
                                    <label>Nombre del Producto</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Proteína Whey"
                                        value={currentProducto.nombre}
                                        onChange={(e) => setCurrentProducto({ ...currentProducto, nombre: e.target.value })}
                                    />
                                </div>

                                <div className="productos-form-row">
                                    <div className="productos-form-group">
                                        <label>Código / SKU</label>
                                        <input
                                            type="text"
                                            placeholder="PROD-001"
                                            value={currentProducto.codigo}
                                            onChange={(e) => setCurrentProducto({ ...currentProducto, codigo: e.target.value })}
                                        />
                                    </div>
                                    <div className="productos-form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={currentProducto.stockActual}
                                            onChange={(e) => setCurrentProducto({ ...currentProducto, stockActual: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="productos-form-group">
                                    <label>Precio Unitario</label>
                                    <div className="input-price">
                                        <span>$</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={currentProducto.precioUnitario}
                                            onChange={(e) => setCurrentProducto({ ...currentProducto, precioUnitario: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="productos-form-group">
                                    <label>Descripción (opcional)</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Detalles del producto..."
                                        value={currentProducto.descripcion}
                                        onChange={(e) => setCurrentProducto({ ...currentProducto, descripcion: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="productos-modal-footer">
                                <button type="button" className="productos-btn-cancel" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="productos-btn-submit">
                                    <Save size={16} />
                                    {isEditing ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
