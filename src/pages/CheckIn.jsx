import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import userService from '../services/userService';
import membresiaService from '../services/membresiaService';
import checkinService from '../services/checkinService';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './CheckIn.css';

const CheckIn = () => {
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState(null);
    const [membershipData, setMembershipData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const resetForm = () => {
        setUserId('');
        setUserData(null);
        setMembershipData(null);
        setShowSuccess(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!userId.trim()) {
            toast.error('Por favor ingresa un ID de usuario');
            return;
        }

        setLoading(true);
        try {
            const result = await checkinService.verifyUser(parseInt(userId));
            setUserData(result.user);
            setMembershipData(result.membership);
        } catch (error) {
            toast.error(error.message || 'Usuario no encontrado');
            resetForm();
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!userData) return;

        setCheckingIn(true);
        try {
            await checkinService.createCheckIn({
                usuarioId: userData.id,
            });

            setShowSuccess(true);
            toast.success('¡Check-in registrado exitosamente!');

            // Auto-reset after 3 seconds
            setTimeout(() => {
                resetForm();
            }, 3000);
        } catch (error) {
            toast.error(error.message || 'Error al registrar check-in');
        } finally {
            setCheckingIn(false);
        }
    };

    const getMembershipStatus = () => {
        if (!membershipData) return null;

        const today = new Date();
        const endDate = new Date(membershipData.fechaFin);
        const daysRemaining = differenceInDays(endDate, today);

        if (daysRemaining < 0) {
            return {
                status: 'expired',
                label: 'Vencida',
                icon: XCircle,
                color: 'var(--color-accent-danger)',
            };
        } else if (daysRemaining <= 7) {
            return {
                status: 'expiring',
                label: 'Próxima a Vencer',
                icon: AlertTriangle,
                color: 'var(--color-accent-warning)',
            };
        } else {
            return {
                status: 'active',
                label: 'Activa',
                icon: CheckCircle,
                color: 'var(--color-accent-success)',
            };
        }
    };

    const membershipStatus = membershipData ? getMembershipStatus() : null;

    if (showSuccess) {
        return (
            <div className="checkin-success animate-scaleIn">
                <Card className="success-card glass">
                    <div className="success-icon">
                        <CheckCircle size={80} />
                    </div>
                    <h1>¡Check-In Exitoso!</h1>
                    <p>Bienvenido {userData?.nombre} {userData?.apellido}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="checkin-page">
            <div className="checkin-container">
                <div className="checkin-header animate-fadeIn">
                    <User size={48} />
                    <h1>Check-In Rápido</h1>
                    <p>Ingresa el código del cliente para verificar su membresía</p>
                </div>

                <Card className="checkin-search-card animate-fadeIn" style={{ animationDelay: '150ms' }}>
                    <form onSubmit={handleSearch} className="checkin-search-form">
                        <Input
                            label="Número de Cédula"
                            type="text"
                            placeholder="Ej: 1234567890"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            icon={<Search size={20} />}
                            fullWidth
                            disabled={loading || checkingIn}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            disabled={!userId.trim()}
                            fullWidth
                        >
                            Buscar Usuario
                        </Button>
                    </form>
                </Card>

                {userData && (
                    <div className="checkin-result animate-scaleIn">
                        <Card className="user-info-card">
                            <div className="user-header">
                                <div className="user-avatar-large">
                                    {userData.nombre.charAt(0)}{userData.apellido.charAt(0)}
                                </div>
                                <div className="user-info">
                                    <h2>{userData.nombre} {userData.apellido}</h2>
                                    <p className="text-secondary">{userData.email}</p>
                                    {userData.telefono && (
                                        <p className="text-tertiary">{userData.telefono}</p>
                                    )}
                                </div>
                            </div>

                            {membershipData ? (
                                <div className={`membership-status status-${membershipStatus.status}`}>
                                    <div className="status-header">
                                        <membershipStatus.icon size={32} />
                                        <div>
                                            <h3>{membershipStatus.label}</h3>
                                            <p>{membershipData.tipoMembresiaNombre || 'Membresía'}</p>
                                        </div>
                                    </div>

                                    <div className="membership-dates">
                                        <div className="date-info">
                                            <Calendar size={18} />
                                            <div>
                                                <p className="date-label">Inicio</p>
                                                <p className="date-value">
                                                    {format(new Date(membershipData.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="date-info">
                                            <Calendar size={18} />
                                            <div>
                                                <p className="date-label">Vencimiento</p>
                                                <p className="date-value">
                                                    {format(new Date(membershipData.fechaFin), "d 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="days-remaining">
                                        {differenceInDays(new Date(membershipData.fechaFin), new Date())} días restantes
                                    </div>
                                </div>
                            ) : (
                                <div className="no-membership">
                                    <XCircle size={48} />
                                    <h3>Sin Membresía Activa</h3>
                                    <p>Este usuario no tiene una membresía activa</p>
                                </div>
                            )}

                            <Button
                                onClick={handleCheckIn}
                                variant={membershipStatus?.status === 'active' ? 'success' : 'warning'}
                                size="xl"
                                fullWidth
                                loading={checkingIn}
                            >
                                {membershipStatus?.status === 'active'
                                    ? 'Confirmar Check-In'
                                    : 'Permitir Acceso Manual'}
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckIn;
