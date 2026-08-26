import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import HeaderCliente from './HeaderCliente';
import Footer from '../comun/Footer1';
import api from '../../services/api';

const IcCalendar = () => (
    <svg height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IcClock = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const IcMapPin = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IcDollar = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const IcUser = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IcSearch = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IcInfo = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export default function MisAgendamientosCliente({ onBackToHome, onCotizacion, onPerfil, onServicios, onMisAgendamientos, onMisCotizaciones }) {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const cargarReservas = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const res = await api.get(`/reservas/cliente/${user.id}`);
            if (res.data.success) {
                setReservas(res.data.data);
            }
        } catch (err) {
            console.error('Error al cargar agendamientos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarReservas();
    }, [user?.id]);

    const formatMoneda = (val) => {
        const num = Number(val);
        return Number.isNaN(num) ? '$0' : `$${num.toLocaleString('es-CO')}`;
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        const d = new Date(f);
        // Evitar desajuste de zona horaria al usar fecha pura
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatHora = (h) => {
        if (!h) return '—';
        try {
            const date = new Date(h);
            if (!Number.isNaN(date.getTime())) {
                const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                return localDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
            return h;
        } catch {
            return h;
        }
    };

    const getStatusClass = (estado) => {
        switch (estado) {
            case 'Completado': return 'status-badge completado';
            case 'Confirmado': return 'status-badge confirmado';
            case 'Pendiente': return 'status-badge pendiente';
            case 'Cancelado': return 'status-badge cancelado';
            default: return 'status-badge';
        }
    };

    const obtenerServiciosDetallados = (reserva) => {
        if (!reserva) return [];
        const info = reserva.Informacion_adicional || '';
        if (info.includes('|||')) {
            try {
                const jsonStr = info.split('|||')[1].trim();
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (err) {
                console.error('Error al deserializar servicios de la reserva:', err);
            }
        }
        return (reserva.servicios || []).map(s => ({
            id: s.Id_Servicio,
            nombre: s.Nombre_Servicio,
            cantidad: 1,
            tamano: 'Estándar',
            precio: Number(s.Precio || 0)
        }));
    };

    const calcularTotalReserva = (reserva) => {
        const det = obtenerServiciosDetallados(reserva);
        return det.reduce((sum, s) => sum + (s.precio * s.cantidad), 0);
    };

    const filteredReservas = reservas.filter(r => {
        // 1. Ocultar completados o cancelados después de 2 días de la fecha de reserva
        if (r.Estado === 'Completado' || r.Estado === 'Cancelado') {
            const d = new Date(r.fecha);
            const fechaReserva = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
            fechaReserva.setHours(0, 0, 0, 0);

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const fechaLimite = new Date(fechaReserva);
            fechaLimite.setDate(fechaLimite.getDate() + 2); // 2 días más

            if (hoy > fechaLimite) {
                return false;
            }
        }

        // 2. Filtros normales de estado y búsqueda
        const matchesEstado = filterEstado === 'Todos' || r.Estado === filterEstado;
        const serviceNames = (r.servicios || []).map(s => s.Nombre_Servicio.toLowerCase()).join(' ');
        const matchesSearch = serviceNames.includes(searchTerm.toLowerCase()) ||
            (r.ID_Reserva && `PED-${r.ID_Reserva}`.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesEstado && matchesSearch;
    });

    return (
        <div className="agendamientos-container">
            <style>{`
                .agendamientos-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f6f7fb;
                    font-family: 'Kanit', sans-serif;
                }
                .ag-main {
                    flex: 1;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 100px 24px 60px;
                    box-sizing: border-box;
                }
                .ag-header-section {
                    margin-bottom: 32px;
                    text-align: center;
                    width: 100%;
                }
                .ag-header-section h1 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0a1435;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                .ag-header-section p {
                    color: #6c7a9c;
                    font-size: 15px;
                }
                
                /* Filtros y Buscador */
                .controls-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    align-items: center;
                    justify-content: space-between;
                    background: #ffffff;
                    padding: 16px 24px;
                    border-radius: 16px;
                    border: 1px solid #eef0f5;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }
                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }
                .filter-btn {
                    padding: 8px 16px;
                    border-radius: 30px;
                    border: 1px solid #e0e4ef;
                    background: #fff;
                    color: #5a6686;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .filter-btn:hover {
                    border-color: #1a56ff;
                    color: #1a56ff;
                    background: #f0f4ff;
                }
                .filter-btn.active {
                    background: #1a56ff;
                    border-color: #1a56ff;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(26,86,255,0.2);
                }
                .search-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 320px;
                }
                .search-wrapper input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border-radius: 30px;
                    border: 1.5px solid #e0e4ef;
                    outline: none;
                    font-family: inherit;
                    font-size: 14px;
                    background: #f8f9ff;
                    transition: all 0.2s ease;
                }
                .search-wrapper input:focus {
                    border-color: #1a56ff;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(26,86,255,0.08);
                }
                .search-icon-inside {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #a0aec0;
                    display: flex;
                    align-items: center;
                }

                /* Lista de Agendamientos */
                .agendamientos-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                .reserva-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #eef0f5;
                    padding: 20px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.01);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .reserva-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(10,20,50,0.08);
                    border-color: #cbd5e1;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .card-id-badge {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1a56ff;
                    background: #eef2ff;
                    padding: 4px 10px;
                    border-radius: 6px;
                }
                .status-badge {
                    font-size: 12px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 30px;
                    text-transform: uppercase;
                }
                .status-badge.pendiente { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
                .status-badge.confirmado { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
                .status-badge.completado { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
                .status-badge.cancelado { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                
                .card-body {
                    margin-bottom: 16px;
                }
                .service-names {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0d1b3e;
                    margin-bottom: 8px;
                    line-height: 1.3;
                }
                .datetime-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13.5px;
                    color: #64748b;
                }
                .datetime-info svg {
                    color: #94a3b8;
                }
                
                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 14px;
                    margin-top: auto;
                }
                .price-box {
                    display: flex;
                    flex-direction: column;
                }
                .price-label {
                    font-size: 11px;
                    color: #94a3b8;
                    text-transform: uppercase;
                }
                .price-val {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .view-detail-link {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #1a56ff;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                /* Estado Vacío */
                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid #eef0f5;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.01);
                }
                .empty-icon {
                    font-size: 56px;
                    margin-bottom: 16px;
                }
                .empty-state h3 {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 8px;
                }
                .empty-state p {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 24px;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .btn-go-booking {
                    background: linear-gradient(135deg, #1a56ff, #00b8ff);
                    color: #fff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(26,86,255,0.25);
                    transition: transform 0.2s;
                }
                .btn-go-booking:hover {
                    transform: translateY(-2px);
                }

                /* MODAL DETALLES VOUCHER */
                .detail-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(10, 15, 30, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 10000;
                    animation: fadeIn 0.25s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .detail-modal {
                    background: #ffffff;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 520px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes slideUp {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .modal-header-banner {
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    color: #ffffff;
                    padding: 24px;
                    text-align: center;
                    position: relative;
                }
                .modal-logo-icon {
                    width: 54px;
                    height: 54px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 12px;
                    color: #00b8ff;
                }
                .modal-header-banner h2 {
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.3px;
                }
                .modal-body-content {
                    padding: 24px;
                }
                .detail-section {
                    margin-bottom: 20px;
                }
                .detail-section-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #94a3b8;
                    letter-spacing: 0.8px;
                    margin-bottom: 8px;
                }
                .services-list-detail {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .service-item-detail {
                    display: flex;
                    justify-content: space-between;
                    background: #f8f9ff;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #1e293b;
                    border: 1px solid #eef2ff;
                }
                .service-price {
                    color: #059669;
                    font-weight: 700;
                }
                .info-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    color: #334155;
                    margin-bottom: 10px;
                }
                .info-row svg {
                    color: #64748b;
                }
                .modal-footer-detail {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    padding: 18px 24px;
                    border-top: 1px solid #e2e8f0;
                }
                .modal-total-box {
                    display: flex;
                    flex-direction: column;
                }
                .modal-total-box span {
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .modal-total-box strong {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .btn-close-modal {
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-close-modal:hover {
                    background: #1e293b;
                }
                
                @media (max-width: 768px) {
                    .main-content { padding-top: 90px; }
                    .agendamientos-list { grid-template-columns: 1fr; }
                    .controls-bar { flex-direction: column; align-items: stretch; }
                    .search-wrapper { max-width: 100%; }
                }
            `}</style>

            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={onCotizacion}
                onPerfil={onPerfil}
                onServicios={onServicios}
                onMisAgendamientos={onMisAgendamientos}
                onMisCotizaciones={onMisCotizaciones}
                activeLink="agendamientos"
            />

            <main className="ag-main">
                <div className="ag-header-section">
                    <h1>Mis Agendamientos</h1>
                    <p>Consulta el historial y estado actual de tus servicios reservados.</p>
                </div>

                {/* Barra de Filtros y Búsqueda */}
                <div className="controls-bar">
                    <div className="filter-tabs">
                        {['Todos', 'Pendiente', 'Confirmado', 'Completado', 'Cancelado'].map(state => (
                            <button
                                key={state}
                                className={`filter-btn ${filterEstado === state ? 'active' : ''}`}
                                onClick={() => setFilterEstado(state)}
                            >
                                {state}
                            </button>
                        ))}
                    </div>
                    <div className="search-wrapper">
                        <div className="search-icon-inside"><IcSearch /></div>
                        <input
                            type="text"
                            placeholder="Buscar por servicio o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cargando o Lista */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#1a56ff', fontSize: '16px', fontWeight: 'bold' }}>
                        ⏳ Cargando tus reservas...
                    </div>
                ) : filteredReservas.length > 0 ? (
                    <div className="agendamientos-list">
                        {filteredReservas.map(reserva => {
                            const total = calcularTotalReserva(reserva);
                            const serviceNames = (reserva.servicios || []).map(s => s.Nombre_Servicio).join(' + ');

                            return (
                                <div
                                    key={reserva.ID_Reserva}
                                    className="reserva-card"
                                    onClick={() => setSelectedReserva(reserva)}
                                >
                                    <div className="card-header">
                                        <span className="card-id-badge">PED-{reserva.ID_Reserva}</span>
                                        <span className={getStatusClass(reserva.Estado)}>{reserva.Estado}</span>
                                    </div>
                                    <div className="card-body">
                                        <h3 className="service-names">{serviceNames || 'Servicio'}</h3>
                                        <div className="datetime-info">
                                            <IcCalendar />
                                            <span>{formatFecha(reserva.fecha)}</span>
                                        </div>
                                        <div className="datetime-info" style={{ marginTop: '6px' }}>
                                            <IcClock />
                                            <span>Hora: {formatHora(reserva.Hora)}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <div className="price-box">
                                            <span className="price-label">Total</span>
                                            <span className="price-val">{formatMoneda(total)}</span>
                                        </div>
                                        <span className="view-detail-link">
                                            Ver detalle →
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No se encontraron agendamientos</h3>
                        <p>
                            {searchTerm || filterEstado !== 'Todos'
                                ? 'Prueba cambiando los filtros o tu término de búsqueda.'
                                : 'Aún no tienes ningún servicio programado. ¡Cotiza y agenda hoy mismo!'}
                        </p>
                        {!searchTerm && filterEstado === 'Todos' && (
                            <button className="btn-go-booking" onClick={onCotizacion}>
                                Reservar un Servicio
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL DE DETALLE DE RESERVA */}
            {selectedReserva && (
                <div className="detail-modal-overlay" onClick={() => setSelectedReserva(null)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-banner">
                            <div className="modal-logo-icon">
                                <IcCalendar />
                            </div>
                            <h2>Detalle de Reserva</h2>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                                Código del Pedido: PED-{selectedReserva.ID_Reserva}
                            </p>
                        </div>
                        <div className="modal-body-content">

                            <div className="detail-section">
                                <div className="detail-section-title">Servicios Contratados</div>
                                <div className="services-list-detail">
                                    {obtenerServiciosDetallados(selectedReserva).map((s, idx) => (
                                        <div key={idx} className="service-item-detail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#0a1435' }}>{s.nombre}</span>
                                                <span className="service-price" style={{ fontWeight: '800', color: '#16a34a' }}>
                                                    {formatMoneda(s.precio * s.cantidad)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', fontSize: '12.5px', color: '#6c7a9c' }}>
                                                <span>📏 Tamaño: {s.tamano || 'Estándar'}</span>
                                                <span>× Cantidad: {s.cantidad || 1}</span>
                                                <span>💵 Unitario: {formatMoneda(s.precio)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Datos del Agendamiento</div>
                                <div className="info-row">
                                    <IcCalendar />
                                    <span><strong>Fecha:</strong> {formatFecha(selectedReserva.fecha)}</span>
                                </div>
                                <div className="info-row">
                                    <IcClock />
                                    <span><strong>Hora:</strong> {formatHora(selectedReserva.Hora)}</span>
                                </div>
                                <div className="info-row">
                                    <IcMapPin />
                                    <span>
                                        <strong>Dirección:</strong> {(() => {
                                            const info = selectedReserva.Informacion_adicional || '';
                                            if (info.startsWith('Dirección:')) {
                                                let addr = info.substring(10);
                                                if (addr.includes('. Tel:')) {
                                                    addr = addr.split('. Tel:')[0];
                                                } else if (addr.includes('Tel:')) {
                                                    addr = addr.split('Tel:')[0];
                                                }
                                                return addr.trim();
                                            }
                                            return info || user?.Direccion || 'Dirección no registrada';
                                        })()}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Información Adicional</div>
                                <div className="info-row">
                                    <IcInfo />
                                    <span>
                                        <strong>Estado:</strong>
                                        <span className={getStatusClass(selectedReserva.Estado)} style={{ marginLeft: '8px', display: 'inline-block' }}>
                                            {selectedReserva.Estado}
                                        </span>
                                    </span>
                                </div>
                                {selectedReserva.observacion?.Observaciones &&
                                    selectedReserva.observacion.Observaciones !== selectedReserva.Informacion_adicional && (
                                        <div className="info-row" style={{ alignItems: 'flex-start' }}>
                                            <div style={{ marginTop: '2px', display: 'flex' }}><IcInfo /></div>
                                            <span><strong>Notas:</strong> {selectedReserva.observacion.Observaciones}</span>
                                        </div>
                                    )}
                                <div className="info-row">
                                    <IcUser />
                                    <span><strong>Empleado Asignado:</strong> {selectedReserva.empleado?.Nombre || 'Por asignar'}</span>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer-detail">
                            <div className="modal-total-box">
                                <span>Total Pagado</span>
                                <strong>{formatMoneda(calcularTotalReserva(selectedReserva))}</strong>
                            </div>
                            <button className="btn-close-modal" onClick={() => setSelectedReserva(null)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
