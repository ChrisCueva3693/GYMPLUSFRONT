import React, { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, Wallet, CreditCard, ArrowRightLeft, Eye, X } from 'lucide-react';
import apiClient from '../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import './Reportes.css';
import { useBranch } from '../context/BranchContext';

const Reportes = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [selectedPago, setSelectedPago] = useState(null); // For detail modal
    const [dateRange, setDateRange] = useState({
        desde: new Date().toISOString().split('T')[0],
        hasta: new Date().toISOString().split('T')[0]
    });
    const [activeFilter, setActiveFilter] = useState('today'); // today, yesterday, week, custom

    const { selectedBranchId } = useBranch();

    useEffect(() => {
        if (selectedBranchId) {
            fetchReporte();
        }
    }, [selectedBranchId, dateRange]);

    const fetchReporte = async () => {
        try {
            setLoading(true);
            const { desde, hasta } = dateRange;
            const response = await apiClient.get('/api/reportes/ingresos', {
                params: { desde, hasta }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching reporte:', error);
            toast.error('Error al cargar reporte de ingresos');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        const today = new Date();
        const desdeDate = new Date();
        const hastaDate = new Date();

        if (filter === 'today') {
            // Already set
        } else if (filter === 'yesterday') {
            desdeDate.setDate(today.getDate() - 1);
            hastaDate.setDate(today.getDate() - 1);
        } else if (filter === 'week') {
            desdeDate.setDate(today.getDate() - 7);
        }

        setDateRange({
            desde: desdeDate.toISOString().split('T')[0],
            hasta: hastaDate.toISOString().split('T')[0]
        });
    };

    const handleCustomDateChange = (e) => {
        setActiveFilter('custom');
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const exportToExcel = () => {
        if (!stats || !stats.detallePagos || stats.detallePagos.length === 0) {
            toast('No hay datos para exportar');
            return;
        }

        const dataToExport = stats.detallePagos.map(p => ({
            ID: p.idPago,
            Fecha: new Date(p.fecha).toLocaleString(),
            Concepto: p.concepto,
            'Tipo Pago': p.tipoPago,
            Monto: p.monto,
            Referencia: p.referencia || '-'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Add Totals Row
        XLSX.utils.sheet_add_aoa(ws, [
            ['', '', '', 'TOTAL GENERAL', stats.totalGeneral]
        ], { origin: -1 });

        XLSX.utils.book_append_sheet(wb, ws, "Ingresos");
        XLSX.writeFile(wb, `Reporte_Ingresos_${dateRange.desde}_${dateRange.hasta}.xlsx`);
        toast.success('Reporte exportado exitosamente');
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    return (
        <div className="reportes-page">
            <Toaster position="top-right" />

            <div className="reportes-header">
                <div className="reportes-header-title">
                    <DollarSign size={28} color="var(--color-accent-primary)" />
                    <div>
                        <h1>Reportes Financieros</h1>
                        <p>Análisis de ingresos y recaudaciones</p>
                    </div>
                </div>

                <div className="reportes-actions">
                    <div className="date-filters">
                        <button
                            className={`btn-filter ${activeFilter === 'today' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('today')}>
                            Hoy
                        </button>
                        <button
                            className={`btn-filter ${activeFilter === 'yesterday' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('yesterday')}>
                            Ayer
                        </button>
                        <button
                            className={`btn-filter ${activeFilter === 'week' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('week')}>
                            Semana
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 8px' }}></div>
                        <input
                            type="date"
                            name="desde"
                            className="date-input"
                            value={dateRange.desde}
                            onChange={handleCustomDateChange}
                        />
                        <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
                        <input
                            type="date"
                            name="hasta"
                            className="date-input"
                            value={dateRange.hasta}
                            onChange={handleCustomDateChange}
                        />
                    </div>

                    <button className="btn-export" onClick={exportToExcel}>
                        <Download size={18} />
                        Exportar Excel
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon total"><DollarSign size={24} /></div>
                        <span className="stat-label">Total Ingresos</span>
                    </div>
                    <div className="stat-value">{formatMoney(stats?.totalGeneral)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon efectivo"><Wallet size={24} /></div>
                        <span className="stat-label">Efectivo</span>
                    </div>
                    <div className="stat-value">{formatMoney(stats?.totalEfectivo)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon tarjeta"><CreditCard size={24} /></div>
                        <span className="stat-label">Tarjeta</span>
                    </div>
                    <div className="stat-value">{formatMoney(stats?.totalTarjeta)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon transfer"><ArrowRightLeft size={24} /></div>
                        <span className="stat-label">Transferencia</span>
                    </div>
                    <div className="stat-value">{formatMoney(stats?.totalTransferencia)}</div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="reporte-table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Cargando datos...</div>
                ) : (
                    <table className="reporte-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Concepto</th>
                                <th>Tipo Pago</th>
                                <th>Referencia</th>
                                <th>Monto</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.detallePagos?.length > 0 ? (
                                stats.detallePagos.map((pago) => (
                                    <tr key={pago.idPago}>
                                        <td>{new Date(pago.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(pago.fecha).toLocaleDateString()}</td>
                                        <td>{pago.concepto}</td>
                                        <td>
                                            <span className={`badge-tipo ${pago.tipoPago.toLowerCase().includes('efectivo') || pago.tipoPago === 'E' ? 'efectivo' :
                                                    pago.tipoPago.toLowerCase().includes('tarjeta') || pago.tipoPago === 'C' || pago.tipoPago === 'TC' ? 'tarjeta' : 'transfer'
                                                }`}>
                                                {pago.tipoPago}
                                            </span>
                                        </td>
                                        <td>{pago.referencia || '-'}</td>
                                        <td>{formatMoney(pago.monto)}</td>
                                        <td>
                                            <button
                                                className="icon-btn"
                                                onClick={() => setSelectedPago(pago)}
                                                title="Ver Detalle"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                        No hay transacciones en este rango de fechas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedPago && (
                <div className="reportes-modal-overlay">
                    <div className="reportes-modal">
                        <div className="reportes-modal-header">
                            <h2>Detalles de Transacción</h2>
                            <button className="reportes-modal-close" onClick={() => setSelectedPago(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="reportes-modal-body">
                            <div className="detail-row">
                                <strong>Concepto</strong>
                                <span>{selectedPago.concepto}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Fecha</strong>
                                <span>{new Date(selectedPago.fecha).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Referencia</strong>
                                <span>{selectedPago.referencia || '-'}</span>
                            </div>

                            <div style={{ margin: '20px 0 12px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                Items / Desglose
                            </div>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                margin: 0
                            }}>
                                {selectedPago.detalles && selectedPago.detalles.length > 0 ? (
                                    selectedPago.detalles.map((detalle, index) => (
                                        <li key={index} style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid var(--color-border)',
                                            fontSize: '14px',
                                            color: 'var(--color-text-primary)'
                                        }}>
                                            {detalle}
                                        </li>
                                    ))
                                ) : (
                                    <li style={{ padding: '12px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                        No hay detalles disponibles
                                    </li>
                                )}
                            </ul>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>Total Pagado</span>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-accent-primary)' }}>
                                    {formatMoney(selectedPago.monto)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reportes;
