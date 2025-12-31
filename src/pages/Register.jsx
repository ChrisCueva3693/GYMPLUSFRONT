import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, Building2 } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.nombre || !formData.apellido || !formData.email ||
            !formData.username || !formData.password) {
            toast.error('Por favor completa todos los campos obligatorios');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return false;
        }

        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await authService.register(registerData);
            toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container animate-scaleIn" style={{ maxWidth: '550px' }}>
                <div className="login-header">
                    <div className="login-logo">
                        <div className="logo-gradient">GP</div>
                    </div>
                    <h1>Crear Cuenta</h1>
                    <p>Únete a GymPlus</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <Input
                            label="Nombre *"
                            name="nombre"
                            type="text"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            icon={<User size={18} />}
                        />

                        <Input
                            label="Apellido *"
                            name="apellido"
                            type="text"
                            placeholder="Apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            icon={<User size={18} />}
                        />
                    </div>

                    <Input
                        label="Email *"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={<Mail size={18} />}
                        fullWidth
                    />

                    <Input
                        label="Teléfono"
                        name="telefono"
                        type="tel"
                        placeholder="(opcional)"
                        value={formData.telefono}
                        onChange={handleChange}
                        icon={<Phone size={18} />}
                        fullWidth
                    />

                    <Input
                        label="Usuario *"
                        name="username"
                        type="text"
                        placeholder="Nombre de usuario"
                        value={formData.username}
                        onChange={handleChange}
                        icon={<User size={18} />}
                        fullWidth
                        autoComplete="username"
                    />

                    <Input
                        label="Contraseña *"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                        icon={<Lock size={18} />}
                        fullWidth
                        autoComplete="new-password"
                    />

                    <Input
                        label="Confirmar Contraseña *"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={<Lock size={18} />}
                        fullWidth
                        autoComplete="new-password"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                    >
                        Registrarse
                    </Button>
                </form>

                <div className="login-footer">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="login-link">
                            Inicia sesión aquí
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

export default Register;
