import React from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../hooks/useAuth';
import './Inicio.css';
import { QrCode, User } from 'lucide-react';

const Inicio = () => {
    const { user } = useAuth();

    return (
        <div className="inicio-page">
            <div className="inicio-container">
                <div className="inicio-header">
                    <h1>Bienvenido, {user?.nombre || 'Cliente'}!</h1>
                    <p>Aquí tienes tu código de acceso personal.</p>
                </div>

                <div className="qr-card">
                    <div className="qr-header">
                        <QrCode size={24} color="var(--color-accent-primary)" />
                        <span>Tu Código de Acceso</span>
                    </div>

                    <div className="qr-wrapper">
                        {user?.cedula ? (
                            <div className="qr-code-box">
                                <QRCode
                                    value={user.cedula}
                                    size={200}
                                    fgColor="#000000"
                                    bgColor="#FFFFFF"
                                    level="H"
                                />
                            </div>
                        ) : (
                            <div className="qr-error">
                                <p>No se encontró cédula registrada.</p>
                            </div>
                        )}
                    </div>

                    <div className="user-details-card">
                        <div className="detail-row">
                            <User size={16} />
                            <span>{user?.nombreCompleto || user?.username}</span>
                        </div>
                        <div className="detail-row cedula">
                            <span>ID: {user?.cedula || 'N/A'}</span>
                        </div>
                    </div>

                    <p className="qr-instruction">
                        Presenta este código en la entrada para registrar tu ingreso.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Inicio;
