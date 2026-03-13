// =============================================================================
// CONSULTASADMIN.JSX - VISTA DE LAS 10 CONSULTAS PRINCIPALES
// =============================================================================

import React, { useState, useEffect } from 'react';
import { consultasService } from '../../services/serviciosAPI';
import '../css/PerfilAdmin.css';

const ConsultasAdmin = ({ onBackToHome, onBackToProfile }) => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consultaActiva, setConsultaActiva] = useState(null);

    // Cargar todas las consultas al montar
    useEffect(() => {
        cargarTodasConsultas();
    }, []);

    const cargarTodasConsultas = async () => {
        try {
            setLoading(true);
            const response = await consultasService.todas();
            
            if (response.success) {
                setConsultas(response.consultas);
                console.log('✅ Consultas cargadas:', response.consultas);
            }
        } catch (err) {
            console.error('❌ Error al carga r consultas:', err);
            setError('No se pudieron cargar las consultas del servidor');
        } finally {
            setLoading(false);
        }
    };

    // La función handleCerrarSesion ha sido eliminada ya que no hay header.

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', position: 'relative' }}>
            
            {/* ==================== BOTÓN DE CIERRE (X) ==================== */}
            <button
                onClick={onBackToProfile}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '36px',
                    fontWeight: '300',
                    color: '#0099ff', // Color principal de la marca
                    cursor: 'pointer',
                    padding: '10px',
                    lineHeight: '1',
                    zIndex: 100, // Asegura que esté por encima del contenido
                    transition: 'color 0.2s ease'
                }}
                aria-label="Regresar al Perfil"
                onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#0099ff'}
            >
                &times; 
            </button>

            {/* ==================== CONTENIDO PRINCIPAL ==================== */}
            <div style={{ 
                padding: '40px 20px',
                paddingTop: '60px', // Ajustado para que el botón X no tape el título
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* TÍTULO */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <h1 style={{
                        fontSize: '42px',
                        fontWeight: '900',
                        color: '#0099ff',
                        marginBottom: '10px'
                    }}>
                        📋 Consultas del Sistema
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        color: '#666'
                    }}>
                        Las 10 consultas principales del proyecto FoamWash
                    </p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        fontSize: '24px',
                        color: '#0099ff'
                    }}>
                        ⏳ Cargando consultas...
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '20px',
                        border: '2px solid #ef5350'
                    }}>
                        ❌ {error}
                        <br />
                        <button
                            onClick={cargarTodasConsultas}
                            style={{
                                marginTop: '15px',
                                padding: '10px 20px',
                                background: '#c62828',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                )}

                {/* LISTA DE CONSULTAS */}
                {!loading && !error && (
                    <div style={{
                        display: 'grid',
                        gap: '20px'
                    }}>
                        {consultas.map((consulta, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'white',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #e0e0e0',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setConsultaActiva(
                                    consultaActiva === index ? null : index
                                )}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#0099ff';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                {/* HEADER DE LA CONSULTA */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: consultaActiva === index ? '20px' : '0'
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: '#333',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                background: '#0099ff',
                                                color: 'white',
                                                width: '35px',
                                                height: '35px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                fontWeight: 'bold'
                                            }}>
                                                {consulta.numero}
                                            </span>
                                            {consulta.titulo}
                                        </h3>
                                        <p style={{
                                            color: '#666',
                                            fontSize: '14px',
                                            margin: '0 0 0 45px'
                                        }}>
                                            {consulta.data?.length || 0} resultados encontrados
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: '24px',
                                        transition: 'transform 0.3s ease',
                                        transform: consultaActiva === index ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        ▼
                                    </span>
                                </div>

                                {/* DATOS DE LA CONSULTA (EXPANDIBLE) */}
                                {consultaActiva === index && (
                                    <div style={{
                                        borderTop: '2px solid #f0f0f0',
                                        paddingTop: '20px',
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        {consulta.data && consulta.data.length > 0 ? (
                                            <div style={{
                                                overflowX: 'auto'
                                            }}>
                                                <table style={{
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    fontSize: '14px'
                                                }}>
                                                    <thead>
                                                        <tr style={{
                                                            background: '#f8f9fa',
                                                            borderBottom: '2px solid #0099ff'
                                                        }}>
                                                            {Object.keys(consulta.data[0]).map((key, idx) => (
                                                                <th key={idx} style={{
                                                                    padding: '12px',
                                                                    textAlign: 'left',
                                                                    fontWeight: '700',
                                                                    color: '#333',
                                                                    textTransform: 'capitalize'
                                                                }}>
                                                                    {key.replace(/_/g, ' ')}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {consulta.data.map((row, rowIdx) => (
                                                            <tr key={rowIdx} style={{
                                                                borderBottom: '1px solid #e0e0e0',
                                                                transition: 'background 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#f8f9fa';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                            }}>
                                                                {Object.values(row).map((value, valIdx) => (
                                                                    <td key={valIdx} style={{
                                                                        padding: '12px',
                                                                        color: '#666'
                                                                    }}>
                                                                        {value !== null && value !== undefined 
                                                                            ? value.toString() 
                                                                            : '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p style={{
                                                textAlign: 'center',
                                                color: '#999',
                                                padding: '20px'
                                            }}>
                                                No hay datos disponibles para esta consulta
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* BOTÓN DE REGRESAR */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px'
                }}>
                    <button
                        onClick={onBackToProfile}
                        style={{
                            padding: '15px 40px',
                            background: 'linear-gradient(135deg, #0099ff, #0066cc)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 153, 255, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 255, 0.3)';
                        }}
                    >
                        ← Regresar al Perfil
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ConsultasAdmin;