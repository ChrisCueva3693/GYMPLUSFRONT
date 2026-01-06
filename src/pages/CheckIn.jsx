import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Calendar, User, UserPlus, Maximize2, Minimize2 } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import UserFormModal from '../components/UserFormModal';
import CheckInStatusModal from '../components/CheckInStatusModal';
import LoadingSpinner from '../components/LoadingSpinner';
import userService from '../services/userService';
import membresiaService from '../services/membresiaService';
import checkinService from '../services/checkinService';
import toast, { Toaster } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBranch } from '../context/BranchContext';
import './CheckIn.css';

const CheckIn = () => {
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState(null);
    const [membershipData, setMembershipData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [autoCheckInSuccess, setAutoCheckInSuccess] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const { selectedBranchId } = useBranch();

    // Toggle Full Screen
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullScreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    const resetForm = () => {
        setUserId('');
        setUserData(null);
        setMembershipData(null);
        setMembershipData(null);
        setIsStatusModalOpen(false);
        setAutoCheckInSuccess(false);
    };

    const performCheckIn = async (user, branchId) => {
        setCheckingIn(true);
        try {
            await checkinService.createCheckIn({
                idUsuario: user.id,
                idSucursal: branchId
            });

            setAutoCheckInSuccess(true);
            toast.success('¡Check-in registrado exitosamente!');

            // Auto-close and reset
            setTimeout(() => {
                resetForm();
            }, 2500);
        } catch (error) {
            toast.error(error.message || 'Error al registrar check-in');
            // If auto-checkin fails, keep modal open but maybe show error? 
            // For now, toast is enough, user can try manual button if it wasn't auto
        } finally {
            setCheckingIn(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!userId.trim()) {
            toast('Por favor ingresa un número de cédula', {
                icon: '⚠️',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            return;
        }

        if (!selectedBranchId) {
            toast.error("No hay una sucursal seleccionada");
            return;
        }

        setLoading(true);
        try {
            // 1. Verify User
            const result = await checkinService.verifyUser(parseInt(userId));
            setUserData(result.user);
            setMembershipData(result.membership);

            // 2. Open Modal immediately with info
            setIsStatusModalOpen(true);
            setAutoCheckInSuccess(false); // reset status

            // 3. Auto Check-In if active
            if (result.membership && result.hasActiveMembership) {
                // Short delay to let the modal animation start and user see their data
                setTimeout(() => {
                    performCheckIn(result.user, selectedBranchId);
                }, 500);
            } else {
                // No membership or expired - Warning toast already handled globally or in UI
                if (!result.membership) {
                    toast('Usuario sin membresía activa', {
                        icon: '⚠️',
                        style: { borderRadius: '10px', background: '#333', color: '#fff' },
                    });
                }
            }
        } catch (error) {
            toast.error('Usuario no encontrado. Por favor regístrese si aún no lo está.');
            setUserData(null);
            setMembershipData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleManualCheckIn = () => {
        if (userData && selectedBranchId) {
            performCheckIn(userData, selectedBranchId);
        }
    };

    // Helper removed as logic is now in Modal

    return (
        <div className={`checkin-page ${isFullScreen ? 'fullscreen-mode' : ''}`}>
            <Toaster position="top-right" />
            <div className="checkin-container">
                <div className="checkin-header animate-fadeIn">
                    <User size={48} />

                    <p>Ingresa el código del cliente para verificar su membresía</p>
                </div>

                <button
                    onClick={toggleFullScreen}
                    className="fullscreen-toggle-btn"
                    title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                    {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>

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
                        <div className="checkin-actions">
                            <Button
                                type="submit"
                                variant="success"
                                size="xl"
                                loading={loading}
                                fullWidth
                            >
                                Ingresar
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                fullWidth
                                onClick={() => setIsRegisterModalOpen(true)}
                                icon={<UserPlus size={18} />}
                                className="btn-register-custom"
                            >
                                Regístrate Ahora
                            </Button>
                        </div>
                    </form>
                </Card>



                <CheckInStatusModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    userData={userData}
                    membershipData={membershipData}
                    onConfirm={handleManualCheckIn}
                    isAutoChecking={checkingIn}
                    autoCheckInSuccess={autoCheckInSuccess}
                />

                <UserFormModal
                    isOpen={isRegisterModalOpen}
                    onClose={() => setIsRegisterModalOpen(false)}
                    isEditing={false}
                    forcedRole="CLIENTE"
                    onSuccess={() => {
                        toast.success('Usuario registrado exitosamente');
                    }}
                />
            </div>
        </div>
    );
};

export default CheckIn;
