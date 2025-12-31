import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import membresiaService from '../services/membresiaService';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import './Membresias.css';

const Membresias = () => {
    const [membresias, setMembresias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, expired, expiring

    useEffect(() => {
        loadMembresias();
    }, []);

    const loadMembresias = async () => {
        setLoading(true);
        try {
            const data = await membresiaService.getMembresias();
            setMembresias(data);
        } catch (error) {
            toast.error('Error al cargar membresías');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredMembresias = () => {
        const today = new Date();

        return membresias.filter(m => {
            if (filter === 'active') {
                return m.estado === 'ACTIVA';
            } else if (filter === 'expired') {
                if (!m.fechaFin) return false;
                return new Date(m.fechaFin) < today;
            } else if (filter === 'expiring') {
                if (!m.fechaFin || m.estado !== 'ACTIVA') return false;
                const daysRemaining = differenceInDays(new Date(m.fechaFin), today);
                return daysRemaining >= 0 && daysRemaining <= 7;
            }
            return true;
        });
    };

    const getMembershipStatusInfo = (membresia) => {
        if (!membresia.fechaFin) {
            return { label: 'Sin Fecha', color: 'gray', icon: Calendar };
        }

        const today = new Date();
        const endDate = new Date(membresia.fechaFin);
        const daysRemaining = differenceInDays(endDate, today);

        if (daysRemaining < 0) {
            return { label: 'Vencida', color: 'danger', icon: XCircle };
        } else if (daysRemaining <= 7) {
            return { label: `Vence en ${daysRemaining} días`, color: 'warning', icon: Calendar };
        } else {
            return { label: `${daysRemaining} días restantes`, color: 'success', icon: CheckCircle };
        }
    };

    const filteredMembresias = getFilteredMembresias();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="membresias-page">
            <div className="page-header">
                <div>
                    <h1>Gestión de Membresías</h1>
                    <p className="text-secondary">
                        Total: {filteredMembresias.length} membresías
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => toast.info('Función en desarrollo')}
                >
                    <Plus size={20} />
                    Nueva Membresía
                </Button>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas
                </button>
                <button
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Activas
                </button>
                <button
                    className={`filter-tab ${filter === 'expiring' ? 'active' : ''}`}
                    onClick={() => setFilter('expiring')}
                >
                    Por vencer
                </button>
                <button
                    className={`filter-tab ${filter === 'expired' ? 'active' : ''}`}
                    onClick={() => setFilter('expired')}
                >
                    Vencidas
                </button>
            </div>

            <div className="membresias-grid">
                {filteredMembresias.length === 0 ? (
                    <Card className="empty-state">
                        <Calendar size={64} />
                        <h3>No hay membresías</h3>
                        <p>No se encontraron membresías con los filtros seleccionados</p>
                    </Card>
                ) : (
                    filteredMembresias.map((membresia, index) => {
                        const statusInfo = getMembershipStatusInfo(membresia);
                        return (
                            <Card
                                key={membresia.id}
                                className="membresia-card animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                                hover
                            >
                                <div className="membresia-header">
                                    <div className="user-avatar-sm">
                                        <User size={20} />
                                    </div>
                                    <div className="membresia-user">
                                        <h3>Usuario #{membresia.usuarioId}</h3>
                                        <p className="text-tertiary">{membresia.tipoMembresiaNombre || 'Membresía'}</p>
                                    </div>
                                </div>

                                <div className={`status-badge badge-${statusInfo.color}`}>
                                    <statusInfo.icon size={16} />
                                    <span>{statusInfo.label}</span>
                                </div>

                                <div className="membresia-dates">
                                    <div className="date-row">
                                        <span className="date-label">Inicio:</span>
                                        <span className="date-value">
                                            {format(new Date(membresia.fechaInicio), "d MMM yyyy", { locale: es })}
                                        </span>
                                    </div>
                                    {membresia.fechaFin && (
                                        <div className="date-row">
                                            <span className="date-label">Fin:</span>
                                            <span className="date-value">
                                                {format(new Date(membresia.fechaFin), "d MMM yyyy", { locale: es })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Membresias;
