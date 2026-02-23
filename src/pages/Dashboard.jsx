import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertCircle, TrendingUp, X } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import membresiaService from '../services/membresiaService';
import checkinService from '../services/checkinService';
import ventaService from '../services/ventaService';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBranch } from '../context/BranchContext';
import './Dashboard.css';

const Dashboard = () => {
    // Stats count
    const [stats, setStats] = useState({
        checkInsToday: 0,
        activeMembresias: 0,
        salesToday: 0,
        expiringMembresias: 0,
    });

    // Lists for modals
    const [lists, setLists] = useState({
        checkIns: [],
        membresiasActivas: [],
        ventas: [],
        expiring: []
    });

    const [loading, setLoading] = useState(true);
    const [expireDaysFilter, setExpireDaysFilter] = useState(5); // Default 5 days filter for expiring
    const [modalType, setModalType] = useState(null); // 'checkins', 'membresias', 'ventas', 'expiring', or null

    const { selectedBranchId } = useBranch();

    // Re-fetch all data when branch changes
    useEffect(() => {
        loadStats();
    }, [selectedBranchId]);

    // Re-calculate expiring memberships if the expireDaysFilter changes, without refetching from server
    // Actually, to make it simpler, we just refilter the internal state, but since we didn't store ALL memberships,
    // let's just re-fetch to keep logic simple, or better yet, keep a raw list of ALL active memberships.
    const [rawActiveMembresias, setRawActiveMembresias] = useState([]);

    useEffect(() => {
        if (rawActiveMembresias.length > 0) {
            updateExpiringList(rawActiveMembresias, expireDaysFilter);
        }
    }, [expireDaysFilter]);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Load all data
            const [membresias, checkIns, ventas] = await Promise.all([
                membresiaService.getMembresias(),
                checkinService.getCheckIns(),
                ventaService.getVentas(),
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter Check-ins
            const checkInsTodayList = checkIns.filter(c => {
                const checkInDate = new Date(c.fechaEntrada);
                checkInDate.setHours(0, 0, 0, 0);
                const matchesBranch = selectedBranchId ? c.idSucursal === selectedBranchId : true;
                return checkInDate.getTime() === today.getTime() && matchesBranch;
            });

            // Filter Active Memberships
            const activeMembresiasList = membresias.filter(m => m.estado === 'ACTIVA');
            setRawActiveMembresias(activeMembresiasList);

            // Filter Sales
            const salesTodayList = ventas.filter(v => {
                const ventaDate = new Date(v.fechaVenta);
                ventaDate.setHours(0, 0, 0, 0);
                return ventaDate.getTime() === today.getTime();
            });

            // Initial expiring calc
            updateExpiringList(activeMembresiasList, expireDaysFilter);

            setLists(prev => ({
                ...prev,
                checkIns: checkInsTodayList,
                membresiasActivas: activeMembresiasList,
                ventas: salesTodayList
            }));

            setStats(prev => ({
                ...prev,
                checkInsToday: checkInsTodayList.length,
                activeMembresias: activeMembresiasList.length,
                salesToday: salesTodayList.length,
            }));

        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateExpiringList = (activeMembresias, daysWarning) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringList = activeMembresias.filter(m => {
            if (!m.fechaFin) return false;
            const endDate = new Date(m.fechaFin);
            endDate.setHours(0, 0, 0, 0);

            // Difference in days: (endDate - today)
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= 0 && diffDays <= daysWarning;
        });

        // Ensure expiring list is sorted by nearest expiration first
        expiringList.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

        setLists(prev => ({ ...prev, expiring: expiringList }));
        setStats(prev => ({ ...prev, expiringMembresias: expiringList.length }));
    };

    const statCards = [
        {
            id: 'checkins',
            title: 'Check-ins Hoy',
            value: stats.checkInsToday,
            icon: UserCheck,
            gradient: 'var(--gradient-blue)',
            color: '#7c3aed',
        },
        {
            id: 'membresias',
            title: 'Membresías Activas',
            value: stats.activeMembresias,
            icon: Users,
            gradient: 'var(--gradient-success)',
            color: '#10b981',
        },
        {
            id: 'ventas',
            title: 'Ventas Hoy',
            value: stats.salesToday,
            icon: DollarSign,
            gradient: 'var(--gradient-warning)',
            color: '#f59e0b',
        },
        {
            id: 'expiring',
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

    // Modal Content Renderers
    const renderModalContent = () => {
        switch (modalType) {
            case 'checkins':
                return (
                    <div className="dashboard-modal-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Cédula</th>
                                    <th>Hora de Entrada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.checkIns.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay check-ins hoy</td></tr>
                                ) : (
                                    lists.checkIns.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.usuarioNombre}</td>
                                            <td>{c.usuarioCedula}</td>
                                            <td>{format(new Date(c.fechaEntrada), 'HH:mm', { locale: es })}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'membresias':
                return (
                    <div className="dashboard-modal-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Plan</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Días Restantes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.membresiasActivas.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay membresías activas</td></tr>
                                ) : (
                                    lists.membresiasActivas.map(m => {
                                        const diasRestantes = differenceInDays(new Date(m.fechaFin), new Date());
                                        return (
                                            <tr key={m.id}>
                                                <td>{m.clienteNombre}</td>
                                                <td>{m.tipoMembresiaNombre}</td>
                                                <td>{format(new Date(m.fechaInicio), 'dd MMM yyyy', { locale: es })}</td>
                                                <td>{format(new Date(m.fechaFin), 'dd MMM yyyy', { locale: es })}</td>
                                                <td>
                                                    <span style={{
                                                        color: diasRestantes <= 5 ? 'var(--color-accent-danger)' : 'var(--color-text-secondary)',
                                                        fontWeight: diasRestantes <= 5 ? 700 : 400
                                                    }}>
                                                        {diasRestantes} días
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'ventas':
                return (
                    <div className="dashboard-modal-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente / ID Venta</th>
                                    <th>Productos</th>
                                    <th>Registrado Por</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.ventas.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay ventas hoy</td></tr>
                                ) : (
                                    lists.ventas.map(v => (
                                        <tr key={v.id}>
                                            <td>
                                                <strong>{v.clienteNombre}</strong><br />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>#{v.id}</span>
                                            </td>
                                            <td>
                                                <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem' }}>
                                                    {v.detalles?.map(d => (
                                                        <li key={d.id}>{d.cantidad}x {d.productoNombre}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>{v.registradoPorNombre || '-'}</td>
                                            <td><strong>${v.total?.toFixed(2)}</strong></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'expiring':
                return (
                    <div className="dashboard-modal-list">
                        {/* Filter Input inside the modal */}
                        <div className="filter-row">
                            <label>Filtrar próximos a vencer en (días):</label>
                            <input
                                type="number"
                                min="0"
                                max="60"
                                value={expireDaysFilter}
                                onChange={(e) => setExpireDaysFilter(parseInt(e.target.value) || 0)}
                                className="days-filter-input"
                            />
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Plan</th>
                                    <th>Fin</th>
                                    <th>Días Restantes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.expiring.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay membresías por vencer en {expireDaysFilter} días</td></tr>
                                ) : (
                                    lists.expiring.map(m => {
                                        const diasRestantes = differenceInDays(new Date(m.fechaFin), new Date());
                                        return (
                                            <tr key={m.id}>
                                                <td>{m.clienteNombre}</td>
                                                <td>{m.tipoMembresiaNombre}</td>
                                                <td>{format(new Date(m.fechaFin), 'dd MMM yyyy', { locale: es })}</td>
                                                <td>
                                                    <span style={{
                                                        color: diasRestantes <= 2 ? 'var(--color-accent-danger)' : '#f59e0b',
                                                        fontWeight: 700
                                                    }}>
                                                        {diasRestantes === 0 ? '¡Hoy!' : diasRestantes < 0 ? 'Vencida' : `${diasRestantes} días`}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        const card = statCards.find(c => c.id === modalType);
        return card ? `Detalles: ${card.title}` : 'Detalles';
    };

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
                        className="stat-card animate-fadeIn clickable-card"
                        style={{ animationDelay: `${index * 100}ms` }}
                        hover
                        onClick={() => setModalType(stat.id)}
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
                <Card
                    className="alert-card animate-fadeIn clickable-card"
                    style={{ animationDelay: '400ms' }}
                    onClick={() => setModalType('expiring')}
                >
                    <div className="alert-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="alert-content">
                        <h3>Atención</h3>
                        <p>
                            Tienes <strong>{stats.expiringMembresias}</strong> membresías que vencen en los próximos {expireDaysFilter} días. Considera contactar a estos clientes.
                        </p>
                    </div>
                </Card>
            )}

            {/* General Details Modal */}
            {modalType && (
                <div className="dashboard-modal-overlay" onClick={() => setModalType(null)}>
                    <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <h2>{getModalTitle()}</h2>
                            <button className="dashboard-modal-close" onClick={() => setModalType(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="dashboard-modal-body">
                            {renderModalContent()}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
