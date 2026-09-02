import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import HeaderCliente from './HeaderCliente';
import Footer from '../comun/Footer1';
import api from '../../services/api';
import { useNotificaciones, NotificacionContainer } from '../comun/Notificacion';
import './estilos_cliente/estilos_cotizar_cliente.css';

const IcDoc = () => (
    <svg height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const IcCalendar = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IcPhone = () => (
    <svg height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IcCheckCircle = () => (
    <svg height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default function MisCotizacionesCliente({ onBackToHome, onCotizacion, onPerfil, onServicios, onAgendamientoSuccess, onMisAgendamientos, onMisCotizaciones }) {
    const { user } = useAuth();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();
    const [cotizaciones, setCotizaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);
    const [bookingCotizacion, setBookingCotizacion] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);

    // Formulario de agendamiento
    const [formData, setFormData] = useState({
        direccion: '',
        ciudad: '',
        telefono: '',
        fecha: '',
        hora: '',
        observaciones: ''
    });

    const cargarCotizaciones = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const res = await api.get(`/cotizaciones/cliente/${user.id}`);
            if (res.data.success) {
                setCotizaciones(res.data.data);
            }
        } catch (err) {
            console.error('Error al cargar cotizaciones:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarCotizaciones();
        if (user) {
            setFormData(prev => ({
                ...prev,
                direccion: user.Direccion || '',
                telefono: user.Telefono || ''
            }));
        }
    }, [user?.id]);

    const formatMoneda = (val) => {
        const num = Number(val);
        return Number.isNaN(num) ? '$0' : `$${num.toLocaleString('es-CO')}`;
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        const d = new Date(f);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const handleOpenBooking = (cot) => {
        setBookingCotizacion(cot);
        setBookingSuccessData(null);
    };

    const handleConfirmarBooking = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            agregarNotificacion('Por favor completa todos los campos obligatorios (*).', 'error');
            return;
        }
        setGuardando(true);
        try {
            const serviceId = bookingCotizacion.Id_servicio ||
                (bookingCotizacion.servicioBase?.Id_Servicio) ||
                (bookingCotizacion.servicios?.[0]?.Id_Servicio);

            if (!serviceId) {
                throw new Error('No se encontró el ID del servicio en la cotización.');
            }

            const serviceName = bookingCotizacion.servicioBase?.Nombre_Servicio ||
                bookingCotizacion.servicios?.[0]?.Nombre_Servicio ||
                'Servicio Personalizado';

            const precioUnitario = bookingCotizacion.Cantidad > 0
                ? Number(bookingCotizacion.Precio_cotizado) / bookingCotizacion.Cantidad
                : Number(bookingCotizacion.Precio_cotizado);

            const serializado = [{
                id: serviceId,
                nombre: serviceName,
                cantidad: bookingCotizacion.Cantidad,
                tamano: bookingCotizacion.Tamaño || 'Estándar',
                precio: precioUnitario
            }];

            const resReserva = await api.post('/reservas', {
                Id_Usuario: user?.id,
                fecha: formData.fecha,
                Hora: formData.hora,
                Informacion_adicional: `Dirección: ${formData.direccion}${formData.ciudad ? ', ' + formData.ciudad : ''}. Tel: ${formData.telefono} ||| ${JSON.stringify(serializado)}`,
                observaciones: formData.observaciones || null,
                servicios: [{
                    Id_Servicio: serviceId,
                    cantidad: bookingCotizacion.Cantidad,
                    tamano: bookingCotizacion.Tamaño
                }]
            });

            if (!resReserva.data.success) {
                throw new Error(resReserva.data.message);
            }

            setBookingSuccessData({
                id: `PED-${resReserva.data.data.ID_Reserva}`,
                fecha: formData.fecha,
                hora: formData.hora,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                empleado: resReserva.data.data.empleado_asignado || 'Sin asignar'
            });

        } catch (err) {
            console.error('Error al agendar desde cotización:', err);
            let msg = 'Hubo un error al agendar tu servicio. Por favor, intenta de nuevo.';
            if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.message) {
                msg = err.message;
            }
            agregarNotificacion(msg, 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="cotizaciones-container">
            <style>{`
                .cotizaciones-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f6f7fb;
                    font-family: 'Kanit', sans-serif;
                }
                .cot-main {
                    flex: 1;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 100px 24px 60px;
                    box-sizing: border-box;
                }
                .cot-header-section {
                    margin-bottom: 32px;
                    text-align: center;
                    width: 100%;
                }
                .cot-header-section h1 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0a1435;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                    display: block;
                }
                .cot-header-section p {
                    color: #6c7a9c;
                    font-size: 15px;
                }

                /* Lista de Cotizaciones */
                .cotizaciones-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                .cotizacion-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #eef0f5;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.01);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .cotizacion-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(10,20,50,0.08);
                    border-color: #cbd5e1;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                }
                .cotizacion-id {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: #7c3aed;
                    background: #f5f0ff;
                    padding: 4px 10px;
                    border-radius: 6px;
                }
                .cotizacion-date {
                    font-size: 12.5px;
                    color: #94a3b8;
                }
                .card-body {
                    margin-bottom: 20px;
                }
                .service-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 8px;
                }
                .detail-badges {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .badge-item {
                    font-size: 12px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    color: #475569;
                }
                .total-amount-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fafafa;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid #f1f5f9;
                }
                .total-amount-box span {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                }
                .total-amount-box strong {
                    font-size: 18px;
                    color: #16a34a;
                    font-weight: 800;
                }
                .card-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: auto;
                }
                .btn-view-det {
                    flex: 1;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-view-det:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    border-color: #cbd5e1;
                }
                .btn-book-now {
                    flex: 1.2;
                    background: linear-gradient(135deg, #1a56ff, #00b8ff);
                    border: none;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(26,86,255,0.15);
                }
                .btn-book-now:hover {
                    filter: brightness(1.08);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(26,86,255,0.25);
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
                }
                .btn-go-quotes {
                    background: linear-gradient(135deg, #7c3aed, #1a56ff);
                    color: #fff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(124,58,237,0.25);
                    transition: transform 0.2s;
                }
                .btn-go-quotes:hover {
                    transform: translateY(-2px);
                }

                /* MODAL DETALLES COTIZACION */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(10, 15, 30, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 10000;
                }
                .detail-modal {
                    background: #ffffff;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    overflow: hidden;
                    animation: slideUp 0.25s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .modal-header-banner {
                    background: linear-gradient(135deg, #7c3aed, #5b21b6);
                    color: #ffffff;
                    padding: 24px;
                    text-align: center;
                }
                .modal-logo-icon {
                    width: 54px; height: 54px;
                    background: rgba(255,255,255,0.12);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 12px;
                    color: #ffffff;
                }
                .modal-header-banner h2 { font-size: 20px; font-weight: 800; }
                .modal-body-content { padding: 24px; }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #64748b; font-weight: 500; }
                .detail-value { color: #0f172a; font-weight: 700; }
                .modal-footer {
                    background: #f8fafc;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 12px;
                }

                /* FORMULARIO AGENDAMIENTO MODAL */
                .form-group {
                    margin-bottom: 14px;
                }
                .form-group label {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 4px;
                    letter-spacing: 0.5px;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1.5px solid #cbd5e1;
                    font-family: inherit;
                    font-size: 14px;
                    outline: none;
                    background: #f8fafc;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    border-color: #1a56ff;
                    background: #fff;
                }
                .form-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .btn-submit-booking {
                    background: #16a34a;
                    color: #fff;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    flex: 1.5;
                    transition: all 0.2s;
                }
                .btn-submit-booking:hover {
                    background: #15803d;
                }
                .btn-cancel-booking {
                    background: #e2e8f0;
                    color: #475569;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                }
                .btn-cancel-booking:hover {
                    background: #cbd5e1;
                }

                .success-booking-box {
                    text-align: center;
                    padding: 10px 0;
                }
                .success-icon {
                    width: 60px; height: 60px;
                    background: #ecfdf5;
                    color: #059669;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    margin: 0 auto 16px;
                }
                .success-booking-box h3 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 8px;
                }
                .success-booking-box p {
                    font-size: 13.5px;
                    color: #475569;
                    margin-bottom: 6px;
                }
            `}</style>

            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={onCotizacion}
                onPerfil={onPerfil}
                onServicios={onServicios}
                onMisAgendamientos={onMisAgendamientos}
                onMisCotizaciones={onMisCotizaciones}
                activeLink="cotizaciones"
            />

            <main className="cot-main">
                <div className="cot-header-section">
                    <h1>Mis Cotizaciones</h1>
                    <p>Revisa tus estimaciones de servicios previas y prográmalas en pocos clics.</p>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#7c3aed', fontSize: '16px', fontWeight: 'bold' }}>
                        ⏳ Cargando tus cotizaciones...
                    </div>
                ) : cotizaciones.length > 0 ? (
                    <div className="cotizaciones-list">
                        {cotizaciones.map((cot) => {
                            const serviceName = cot.servicioBase?.Nombre_Servicio ||
                                (cot.servicios?.[0]?.Nombre_Servicio) ||
                                'Servicio Personalizado';

                            return (
                                <div key={cot.Id_Cotizacion} className="cotizacion-card">
                                    <div className="card-header">
                                        <span className="cotizacion-id">COT-{cot.Id_Cotizacion}</span>
                                        <span className="cotizacion-date">{formatFecha(cot.fecha_cotizacion)}</span>
                                    </div>
                                    <div className="card-body">
                                        <h3 className="service-title">{serviceName}</h3>
                                        <div className="detail-badges">
                                            <span className="badge-item">📏 Tamaño: {cot.Tamaño}</span>
                                            <span className="badge-item">× Cantidad: {cot.Cantidad}</span>
                                        </div>
                                        <div className="total-amount-box">
                                            <span>Precio estimado</span>
                                            <strong>{formatMoneda(Number(cot.Precio_cotizado))}</strong>
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button className="btn-view-det" onClick={() => setSelectedCotizacion(cot)}>
                                            Ver Detalle
                                        </button>
                                        <button className="btn-book-now" onClick={() => handleOpenBooking(cot)}>
                                            Agendar ahora
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No tienes cotizaciones guardadas</h3>
                        <p>¿Necesitas lavar tus muebles, alfombras o vehículo? Cotiza el precio al instante.</p>
                        <button className="btn-go-quotes" onClick={onCotizacion}>
                            Cotizar un Servicio
                        </button>
                    </div>
                )}
            </main>

            {/* MODAL DETALLES COTIZACION */}
            {selectedCotizacion && (
                <div className="modal-overlay show" onClick={() => setSelectedCotizacion(null)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-banner">
                            <div className="modal-logo-icon">
                                <IcDoc />
                            </div>
                            <h2>Cotización Detallada</h2>
                            <p style={{ fontSize: '13px', color: '#e9d5ff', marginTop: '4px' }}>
                                Código: COT-{selectedCotizacion.Id_Cotizacion}
                            </p>
                        </div>
                        <div className="modal-body-content">
                            <div className="detail-row">
                                <span className="detail-label">Servicio</span>
                                <span className="detail-value">
                                    {selectedCotizacion.servicioBase?.Nombre_Servicio ||
                                        selectedCotizacion.servicios?.[0]?.Nombre_Servicio ||
                                        'Servicio'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tamaño Seleccionado</span>
                                <span className="detail-value">{selectedCotizacion.Tamaño}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Cantidad</span>
                                <span className="detail-value">{selectedCotizacion.Cantidad}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Fecha de Cotización</span>
                                <span className="detail-value">{formatFecha(selectedCotizacion.fecha_cotizacion)}</span>
                            </div>
                            <div className="detail-row" style={{ borderBottom: 'none', marginTop: '10px' }}>
                                <span className="detail-label" style={{ fontSize: '15px' }}>Total Estimado</span>
                                <span className="detail-value" style={{ fontSize: '20px', color: '#16a34a' }}>
                                    {formatMoneda(Number(selectedCotizacion.Precio_cotizado))}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-book-now"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    handleOpenBooking(selectedCotizacion);
                                    setSelectedCotizacion(null);
                                }}
                            >
                                Agendar este Servicio
                            </button>
                            <button
                                className="btn-cancel-booking"
                                style={{ flex: 0.8 }}
                                onClick={() => setSelectedCotizacion(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PROGRAMAR SERVICIO (AGENDAR DESDE COTIZACIÓN) */}
            {bookingCotizacion && (
                <div className="modal-overlay show" onClick={() => !guardando && setBookingCotizacion(null)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="modal-header-banner" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
                            <div className="modal-logo-icon" style={{ color: '#60a5fa' }}>
                                <IcCalendar />
                            </div>
                            <h2>Programar Agendamiento</h2>
                            <p style={{ fontSize: '13px', color: '#93c5fd', marginTop: '4px' }}>
                                Basado en la cotización COT-{bookingCotizacion.Id_Cotizacion}
                            </p>
                        </div>

                        <div className="modal-body-content">
                            {bookingSuccessData ? (
                                <div className="success-booking-box">
                                    <div className="success-icon"><IcCheckCircle /></div>
                                    <h3>¡Servicio Agendado con Éxito!</h3>
                                    <p>Tu agendamiento ha sido creado bajo el código <strong>{bookingSuccessData.id}</strong></p>
                                    <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px', margin: '16px 0', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                        <p style={{ margin: '4px 0' }}>📅 <strong>Fecha:</strong> {formatFecha(bookingSuccessData.fecha)}</p>
                                        <p style={{ margin: '4px 0' }}>⏰ <strong>Hora:</strong> {bookingSuccessData.hora}</p>
                                        <p style={{ margin: '4px 0' }}>📍 <strong>Dirección:</strong> {bookingSuccessData.direccion} {bookingSuccessData.ciudad ? `, ${bookingSuccessData.ciudad}` : ''}</p>
                                        <p style={{ margin: '4px 0' }}>👷 <strong>Técnico:</strong> {bookingSuccessData.empleado}</p>
                                    </div>
                                    <p style={{ fontSize: '12.5px', color: '#64748b' }}>Se ha enviado un correo de confirmación con los detalles.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="form-group">
                                        <label>Dirección del Servicio *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Calle 45 #12-34"
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Ciudad *</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Bogotá"
                                                value={formData.ciudad}
                                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Teléfono de Contacto *</label>
                                            <input
                                                type="tel"
                                                placeholder="Ej: 3101234567"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Fecha *</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.fecha}
                                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hora Preferida *</label>
                                            <select
                                                value={formData.hora}
                                                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                                required
                                            >
                                                <option value="">Selecciona hora</option>
                                                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(h => (
                                                    <option key={h} value={h}>{h} {parseInt(h) < 12 ? 'AM' : 'PM'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Observaciones o Indicaciones Especiales</label>
                                        <textarea
                                            placeholder="Detalles sobre mascotas, parqueadero o cómo ingresar..."
                                            rows="2"
                                            value={formData.observaciones}
                                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '12px 16px', borderRadius: '10px', marginTop: '10px' }}>
                                        <span style={{ fontSize: '13.5px', color: '#1e3a8a', fontWeight: 'bold' }}>Total a Pagar:</span>
                                        <span style={{ fontSize: '18px', color: '#1e3a8a', fontWeight: '800' }}>
                                            {formatMoneda(Number(bookingCotizacion.Precio_cotizado))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {bookingSuccessData ? (
                                <button
                                    className="btn-submit-booking"
                                    style={{ width: '100%', flex: 'none' }}
                                    onClick={() => {
                                        setBookingCotizacion(null);
                                        if (onAgendamientoSuccess) onAgendamientoSuccess();
                                    }}
                                >
                                    Ir a Mis Agendamientos ✓
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn-submit-booking"
                                        onClick={handleConfirmarBooking}
                                        disabled={guardando}
                                    >
                                        {guardando ? 'Programando...' : 'Confirmar Reserva ✓'}
                                    </button>
                                    <button
                                        className="btn-cancel-booking"
                                        onClick={() => setBookingCotizacion(null)}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <NotificacionContainer notificaciones={notificaciones} removerNotificacion={removerNotificacion} />
            <Footer />
        </div>
    );
}