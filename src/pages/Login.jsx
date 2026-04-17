import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Lock } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loginError, setLoginError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setLoginError(null); // Clear error on edit
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('expired') === 'true') {
            toast.error("Tu sesión ha expirado. Por favor ingresa nuevamente.");
            window.history.replaceState({}, document.title, "/login");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);

        if (!formData.username || !formData.password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setLoading(true);

        try {
            await login(formData.username, formData.password);
            toast.success('¡Bienvenido!');
            navigate('/');
        } catch (error) {
            if (error.message && error.message.includes('GIMNASIO_INACTIVO:')) {
                setLoginError(error.message.replace('GIMNASIO_INACTIVO:', ''));
            } else {
                toast.error(error.message || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* ---- Left: Image Panel ---- */}
            <div className="login-image-panel">
                {/* Decorative circles */}
                <div className="deco-circle dc-1" />
                <div className="deco-circle dc-2" />
                <div className="deco-circle dc-3" />
                <div className="deco-circle dc-4" />

                {/* Energy / swirl lines */}
                <div className="energy-lines" />

                {/* Gym illustration */}
                <img
                    className="login-gym-image"
                    src="https://static.vecteezy.com/system/resources/thumbnails/068/118/665/small/gym-kong-mascot-design-png.png"
                    alt="Bodybuilder illustration"
                />

                {/* Brand watermark */}
                <div className="login-brand">
                    <div className="brand-name">GymPlus</div>
                    <div className="brand-sub">Sistema de Gestión</div>
                </div>
            </div>

            {/* ---- Right: Form Panel ---- */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <h1 className="login-title">Inicio de Sesión</h1>
                    <p className="login-subtitle">
                        Ingresa tus credenciales para continuar
                    </p>

                    <form onSubmit={handleSubmit} className="login-form">
                        {loginError && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-accent-danger)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                marginBottom: 'var(--spacing-md)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <svg style={{ flexShrink: 0, marginTop: '2px' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                <span>{loginError}</span>
                            </div>
                        )}

                        <Input
                            label="Usuario"
                            name="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={formData.username}
                            onChange={handleChange}
                            icon={<User size={18} />}
                            fullWidth
                            autoComplete="username"
                        />

                        <Input
                            label="Contraseña"
                            name="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            icon={<Lock size={18} />}
                            fullWidth
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    <div className="login-footer">

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
