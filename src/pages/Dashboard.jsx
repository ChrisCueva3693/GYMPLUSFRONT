import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import membresiaService from '../services/membresiaService';
import checkinService from '../services/checkinService';
import ventaService from '../services/ventaService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        checkInsToday: 0,
        activeMembresias: 0,
        salesToday: 0,
        expiringMembresias: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Load all data
            const [membresias, checkIns, ventas] = await Promise.all([
                membresiaService.getMembresias(),
                checkinService.getCheckIns(),
                ventaService.getVentas(),
            ]);

            // Calculate stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkInsToday = checkIns.filter(c => {
                const checkInDate = new Date(c.fechaHora);
                checkInDate.setHours(0, 0, 0, 0);
                return checkInDate.getTime() === today.getTime();
            }).length;

            const activeMembresias = membresias.filter(m => m.estado === 'ACTIVA').length;

            const salesToday = ventas.filter(v => {
                const ventaDate = new Date(v.fechaVenta);
                ventaDate.setHours(0, 0, 0, 0);
                return ventaDate.getTime() === today.getTime();
            }).length;

            // Memberships expiring in next 7 days
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const expiringMembresias = membresias.filter(m => {
                if (!m.fechaFin) return false;
                const endDate = new Date(m.fechaFin);
                return endDate >= today && endDate <= nextWeek && m.estado === 'ACTIVA';
            }).length;

            setStats({
                checkInsToday,
                activeMembresias,
                salesToday,
                expiringMembresias,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Check-ins Hoy',
            value: stats.checkInsToday,
            icon: UserCheck,
            gradient: 'var(--gradient-blue)',
            color: '#3b82f6',
        },
        {
            title: 'Membresías Activas',
            value: stats.activeMembresias,
            icon: Users,
            gradient: 'var(--gradient-success)',
            color: '#10b981',
        },
        {
            title: 'Ventas Hoy',
            value: stats.salesToday,
            icon: DollarSign,
            gradient: 'var(--gradient-warning)',
            color: '#f59e0b',
        },
        {
            title: 'Próximas a Vencer',
            value: stats.expiringMembresias,
            icon: AlertCircle,
            gradient: 'var(--gradient-danger)',
            color: '#ef4444',
        },
    ];

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome animate-fadeIn">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">
                        Bienvenido al panel de control de GymPlus
                    </p>
                </div>
                <div className="dashboard-date">
                    <TrendingUp size={20} />
                    <span>{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</span>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <Card
                        key={stat.title}
                        className="stat-card animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                        hover
                    >
                        <div className="stat-icon" style={{ background: stat.gradient }}>
                            <stat.icon size={28} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.title}</p>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                    </Card>
                ))}
            </div>

            {stats.expiringMembresias > 0 && (
                <Card className="alert-card animate-fadeIn" style={{ animationDelay: '400ms' }}>
                    <div className="alert-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="alert-content">
                        <h3>Atención</h3>
                        <p>
                            Tienes <strong>{stats.expiringMembresias}</strong> membresías que vencen en los
                            próximos 7 días. Considera contactar a estos clientes.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Dashboard;
