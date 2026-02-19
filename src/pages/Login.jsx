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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
            toast.error(error.message || 'Error al iniciar sesión');
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
