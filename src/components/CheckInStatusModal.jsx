import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Calendar, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from './Button';
import './CheckInStatusModal.css';

const CheckInStatusModal = ({
    isOpen,
    onClose,
    userData,
    membershipData,
    onConfirm,
    isAutoChecking,
    autoCheckInSuccess
}) => {
    if (!isOpen || !userData) return null;

    const getMembershipStatus = () => {
        if (!membershipData) {
            return {
                status: 'no-membership',
                label: 'Sin Membresía',
                icon: XCircle,
                colorClass: 'status-error'
            };
        }

        const today = new Date();
        const endDate = new Date(membershipData.fechaFin);
        const daysRemaining = differenceInDays(endDate, today);

        if (daysRemaining < 0) {
            return {
                status: 'expired',
                label: 'Vencida',
                icon: XCircle,
                colorClass: 'status-error'
            };
        } else if (daysRemaining <= 7) {
            return {
                status: 'expiring',
                label: 'Próxima a Vencer',
                icon: AlertTriangle,
                colorClass: 'status-warning'
            };
        } else {
            return {
                status: 'active',
                label: 'Activa',
                icon: CheckCircle,
                colorClass: 'status-success'
            };
        }
    };

    const status = getMembershipStatus();
    const StatusIcon = status.icon;

    return (
        <div className="checkin-modal-overlay">
            <div className="checkin-modal-content animate-scaleIn">
                <button className="checkin-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {/* Header with User Info */}
                <div className="checkin-user-header">
                    <div className="checkin-avatar">
                        {userData.nombre.charAt(0)}{userData.apellido.charAt(0)}
                    </div>
                    <div className="checkin-user-details">
                        <h2>{userData.nombre} {userData.apellido}</h2>
                        <div className="checkin-user-meta">
                            <span>{userData.email}</span>
                            {userData.telefono && <span>{userData.telefono}</span>}
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`checkin-status-card ${status.colorClass}`}>
                    <div className="status-row">
                        <StatusIcon size={40} className="status-icon" />
                        <div>
                            <h3>{status.label}</h3>
                            <p>{membershipData?.tipoMembresiaNombre || 'Sin Plan Activo'}</p>
                        </div>
                    </div>

                    {membershipData && (
                        <>
                            <div className="checkin-dates-grid">
                                <div className="date-box">
                                    <div className="date-label"><Calendar size={14} /> Inicio</div>
                                    <div className="date-value">
                                        {format(new Date(membershipData.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                                    </div>
                                </div>
                                <div className="date-box">
                                    <div className="date-label"><Calendar size={14} /> Vencimiento</div>
                                    <div className="date-value">
                                        {format(new Date(membershipData.fechaFin), "d 'de' MMMM, yyyy", { locale: es })}
                                    </div>
                                </div>
                            </div>

                            <div className="days-remaining-badge">
                                {Math.max(0, differenceInDays(new Date(membershipData.fechaFin), new Date()))} días restantes
                            </div>
                        </>
                    )}

                    {status.status === 'no-membership' && (
                        <div className="no-membership-msg">
                            Este usuario no cuenta con una membresía activa registrada.
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="checkin-modal-footer">
                    {autoCheckInSuccess ? (
                        <div className="auto-success-msg">
                            <CheckCircle size={24} />
                            <span>¡Check-In Realizado Exitosamente!</span>
                        </div>
                    ) : (
                        <Button
                            onClick={onConfirm}
                            variant={status.status === 'active' ? 'success' : 'warning'}
                            size="lg"
                            fullWidth
                            loading={isAutoChecking}
                        >
                            {status.status === 'active'
                                ? 'Confirmando Check-In...'
                                : 'Permitir Acceso Manual'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckInStatusModal;
