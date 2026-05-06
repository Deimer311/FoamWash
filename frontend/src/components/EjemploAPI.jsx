// =============================================================================
// EJEMPLO DE USO DE LA API EN UN COMPONENTE REACT
// =============================================================================

import React, { useState, useEffect } from 'react';
import { serviciosService, usuariosService, consultasService } from '../services/serviciosAPI';

const EjemploUsoAPI = () => {
    
    // Estados
    const [servicios, setServicios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // =========================================================================
    // EJEMPLO 1: Cargar servicios al montar el componente
    // =========================================================================
    useEffect(() => {
        cargarServicios();
    }, []);
    
    const cargarServicios = async () => {
        try {
            setLoading(true);
            const response = await serviciosService.getAll();
            
            if (response.success) {
                setServicios(response.data);
                console.log('✅ Servicios cargados:', response.data);
            }
        } catch (err) {
            console.error('❌ Error al cargar servicios:', err);
            setError('No se pudieron cargar los servicios');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // EJEMPLO 2: Cargar usuarios por rol
    // =========================================================================
    const cargarUsuariosPorRol = async () => {
        try {
            setLoading(true);
            const response = await usuariosService.getPorRol();
            
            if (response.success) {
                console.log('✅ Usuarios por rol:', response.data);
                setEstadisticas(response.data);
            }
        } catch (err) {
            console.error('❌ Error:', err);
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // EJEMPLO 3: Crear un nuevo servicio
    // =========================================================================
    const crearNuevoServicio = async () => {
        try {
            setLoading(true);
            
            const nuevoServicio = {
                Nombre_Servicio: 'Lavado Premium',
                Precio: 150000,
                descripcion: 'Servicio de lavado completo',
                duracion_estimada: '2 horas',
                estado: 'activo'
            };
            
            const response = await serviciosService.create(nuevoServicio);
            
            if (response.success) {
                console.log('✅ Servicio creado:', response.data);
                // Recargar lista de servicios
                cargarServicios();
            }
        } catch (err) {
            console.error('❌ Error al crear servicio:', err);
            setError('No se pudo crear el servicio');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // EJEMPLO 4: Actualizar un servicio
    // =========================================================================
    const actualizarServicio = async (id) => {
        try {
            const datosActualizados = {
                Nombre_Servicio: 'Lavado Premium Actualizado',
                Precio: 180000,
                descripcion: 'Servicio premium con encerado',
                duracion_estimada: '2.5 horas',
                estado: 'activo'
            };
            
            const response = await serviciosService.update(id, datosActualizados);
            
            if (response.success) {
                console.log('✅ Servicio actualizado');
                cargarServicios();
            }
        } catch (err) {
            console.error('❌ Error al actualizar:', err);
            setError('No se pudo actualizar el servicio');
        }
    };
    
    // =========================================================================
    // EJEMPLO 5: Eliminar un servicio
    // =========================================================================
    const eliminarServicio = async (id) => {
        try {
            if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
                const response = await serviciosService.delete(id);
                
                if (response.success) {
                    console.log('✅ Servicio eliminado');
                    cargarServicios();
                }
            }
        } catch (err) {
            console.error('❌ Error al eliminar:', err);
            setError('No se pudo eliminar el servicio');
        }
    };
    
    // =========================================================================
    // EJEMPLO 6: Obtener consultas complejas
    // =========================================================================
    const cargarConsultas = async () => {
        try {
            setLoading(true);
            
            // Obtener todas las consultas
            const todasConsultas = await consultasService.todas();
            console.log('📊 Todas las consultas:', todasConsultas);
            
            // O una consulta específica
            const usuariosPorRol = await consultasService.usuariosPorRol();
            console.log('👥 Usuarios por rol:', usuariosPorRol);
            
            const serviciosMasSolicitados = await serviciosService.getMasSolicitados();
            console.log('⭐ Servicios más solicitados:', serviciosMasSolicitados);
            
        } catch (err) {
            console.error('❌ Error en consultas:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div style={{ padding: '20px' }}>
            <h1>Ejemplo de Uso de la API</h1>
            
            {/* Indicador de carga */}
            {loading && <p>⏳ Cargando...</p>}
            
            {/* Mensajes de error */}
            {error && (
                <div style={{ 
                    background: '#ffebee', 
                    color: '#c62828', 
                    padding: '10px', 
                    borderRadius: '5px' 
                }}>
                    ❌ {error}
                </div>
            )}
            
            {/* Botones de ejemplo */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={cargarServicios}>
                    🔄 Cargar Servicios
                </button>
                <button onClick={cargarUsuariosPorRol}>
                    👥 Usuarios por Rol
                </button>
                <button onClick={crearNuevoServicio}>
                    ➕ Crear Servicio
                </button>
                <button onClick={cargarConsultas}>
                    📊 Ver Consultas
                </button>
            </div>
            
            {/* Lista de servicios */}
            <div>
                <h2>Servicios ({servicios.length})</h2>
                {servicios.length > 0 ? (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '15px'
                    }}>
                        {servicios.map(servicio => (
                            <div 
                                key={servicio.Id_Servicio}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    background: 'white'
                                }}
                            >
                                <h3>{servicio.Nombre_Servicio}</h3>
                                <p><strong>Precio:</strong> ${servicio.Precio.toLocaleString()}</p>
                                <p>{servicio.descripcion}</p>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                    <button 
                                        onClick={() => actualizarServicio(servicio.Id_Servicio)}
                                        style={{
                                            padding: '5px 10px',
                                            background: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        onClick={() => eliminarServicio(servicio.Id_Servicio)}
                                        style={{
                                            padding: '5px 10px',
                                            background: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay servicios para mostrar</p>
                )}
            </div>
            
            {/* Estadísticas */}
            {estadisticas && (
                <div style={{ marginTop: '30px' }}>
                    <h2>Estadísticas de Usuarios por Rol</h2>
                    {estadisticas.map((stat, index) => (
                        <div key={index} style={{
                            padding: '10px',
                            background: '#f5f5f5',
                            margin: '5px 0',
                            borderRadius: '5px'
                        }}>
                            <strong>{stat.Rol}:</strong> {stat.Total_Usuarios} usuarios ({stat.Porcentaje}%)
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EjemploUsoAPI;