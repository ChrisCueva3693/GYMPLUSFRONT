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
            // Clean URL
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
            <div className="login-container animate-scaleIn">
                <div className="login-header">
                    <div className="login-logo">
                        <div className="logo-gradient">GP</div>
                    </div>
                    <h1>GymPlus</h1>
                    <p>Sistema de Gestión de Gimnasio</p>
                </div>

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
                    <p>
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="login-link">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>

            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>
        </div>
    );
};

export default Login;
