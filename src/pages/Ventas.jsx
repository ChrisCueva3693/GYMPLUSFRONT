import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, DollarSign, Package } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ventaService from '../services/ventaService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import './Membresias.css';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVentas();
    }, []);

    const loadVentas = async () => {
        setLoading(true);
        try {
            const data = await ventaService.getVentas();
            setVentas(data);
        } catch (error) {
            toast.error('Error al cargar ventas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="membresias-page">
            <div className="page-header">
                <div>
                    <h1>Control de Ventas</h1>
                    <p className="text-secondary">
                        Total: {ventas.length} ventas registradas
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => toast.info('Función en desarrollo')}
                >
                    <Plus size={20} />
                    Nueva Venta
                </Button>
            </div>

            <div className="membresias-grid">
                {ventas.length === 0 ? (
                    <Card className="empty-state">
                        <ShoppingCart size={64} />
                        <h3>No hay ventas registradas</h3>
                        <p>Comienza a agregar ventas de productos</p>
                    </Card>
                ) : (
                    ventas.map((venta, index) => (
                        <Card
                            key={venta.id}
                            className="membresia-card animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                            hover
                        >
                            <div className="membresia-header">
                                <div className="user-avatar-sm">
                                    <Package size={20} />
                                </div>
                                <div className="membresia-user">
                                    <h3>Venta #{venta.id}</h3>
                                    <p className="text-tertiary">
                                        {format(new Date(venta.fechaVenta), "d 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            <div className="status-badge badge-success">
                                <DollarSign size={16} />
                                <span>${venta.montoTotal || '0.00'}</span>
                            </div>

                            <div className="membresia-dates">
                                {venta.usuarioId && (
                                    <div className="date-row">
                                        <span className="date-label">Cliente:</span>
                                        <span className="date-value">Usuario #{venta.usuarioId}</span>
                                    </div>
                                )}
                                <div className="date-row">
                                    <span className="date-label">Método:</span>
                                    <span className="date-value">{venta.metodoPago || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Ventas;
