    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import './css/Consultas.css';

    const API_URL = 'http://localhost:5000/api';

    function Consultas() {
    const [consultaActiva, setConsultaActiva] = useState(1);
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [empleadoId, setEmpleadoId] = useState('');
    const [empleados, setEmpleados] = useState([]);

    const consultas = [
        {
        numero: 1,
        titulo: "¿Cuántos usuarios están registrados por tipo de rol?",
        endpoint: "1-usuarios-por-rol",
        icon: "👥",
        color: "blue",
        descripcion: "Permite conocer la distribución de usuarios según su rol"
        },
        {
        numero: 2,
        titulo: "¿Cuáles son los servicios disponibles?",
        endpoint: "2-servicios-disponibles",
        icon: "🛠️",
        color: "green",
        descripcion: "Muestra el catálogo completo de servicios con tarifas"
        },
        {
        numero: 3,
        titulo: "¿Cuántos servicios ha solicitado cada cliente?",
        endpoint: "3-servicios-por-cliente",
        icon: "📊",
        color: "purple",
        descripcion: "Identifica a los clientes más activos o frecuentes"
        },
        {
        numero: 4,
        titulo: "¿Cuál es la agenda semanal de un empleado?",
        endpoint: "4-agenda-empleado",
        icon: "📅",
        color: "orange",
        descripcion: "Muestra los servicios asignados durante la semana",
        requiereId: true
        },
        {
        numero: 5,
        titulo: "¿Qué clientes tienen servicios programados esta semana?",
        endpoint: "5-clientes-semana",
        icon: "🗓️",
        color: "teal",
        descripcion: "Permite anticipar la atención y confirmar citas"
        },
        {
        numero: 6,
        titulo: "¿Cuántas reservas se han hecho por servicio?",
        endpoint: "6-reservas-por-servicio",
        icon: "📈",
        color: "indigo",
        descripcion: "Ayuda a identificar qué servicios son más demandados"
        },
        {
        numero: 7,
        titulo: "¿Cuántas reservas tiene cada cliente?",
        endpoint: "7-reservas-por-cliente",
        icon: "👤",
        color: "pink",
        descripcion: "Analiza el historial de uso del sistema por cliente"
        },
        {
        numero: 8,
        titulo: "¿Qué empleados tienen más servicios asignados este mes?",
        endpoint: "8-empleados-servicios-mes",
        icon: "👨‍💼",
        color: "red",
        descripcion: "Evalúa la carga de trabajo del personal operativo"
        },
        {
        numero: 9,
        titulo: "¿Qué empleados no tienen servicios asignados actualmente?",
        endpoint: "9-empleados-sin-servicios",
        icon: "⚠️",
        color: "yellow",
        descripcion: "Identifica personal disponible o subutilizado"
        },
        {
        numero: 10,
        titulo: "¿Cuál es la agenda semanal completa?",
        endpoint: "10-agenda-semanal-completa",
        icon: "📋",
        color: "cyan",
        descripcion: "Vista general de todos los servicios de la semana"
        }
    ];

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        cargarConsulta(consultaActiva);
    }, [consultaActiva, empleadoId]);

    const cargarEmpleados = async () => {
        try {
        const response = await axios.get(`${API_URL}/usuarios`);
        const emps = response.data.data.filter(u => u.Rol === 'Empleado');
        setEmpleados(emps);
        } catch (error) {
        console.error('Error al cargar empleados:', error);
        }
    };

    const cargarConsulta = async (numero) => {
        setLoading(true);
        try {
        const consulta = consultas.find(c => c.numero === numero);
        let url = `${API_URL}/consultas/${consulta.endpoint}`;
        
        if (consulta.requiereId && empleadoId) {
            url += `/${empleadoId}`;
        }
        
        const response = await axios.get(url);
        setDatos(response.data.data || []);
        } catch (error) {
        console.error('Error al cargar consulta:', error);
        setDatos([]);
        } finally {
        setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
        }).format(value || 0);
    };

    const renderTabla = () => {
        if (loading) {
        return <div className="loading">Cargando datos...</div>;
        }

        if (!datos || datos.length === 0) {
        return <div className="no-data">No hay datos disponibles para esta consulta</div>;
        }

        const keys = Object.keys(datos[0]);

        return (
        <div className="tabla-contenedor">
            <table className="tabla-consulta">
            <thead>
                <tr>
                {keys.map(key => (
                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {datos.map((fila, index) => (
                <tr key={index}>
                    {keys.map(key => (
                    <td key={key}>
                        {typeof fila[key] === 'number' && key.toLowerCase().includes('precio')
                        ? formatCurrency(fila[key])
                        : fila[key] !== null ? fila[key] : '-'}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        );
    };

    const consultaActual = consultas.find(c => c.numero === consultaActiva);

    return (
        <div className="consultas-container">
        <div className="consultas-header">
            <div>
            <h2>📊 Las 10 Consultas Principales</h2>
            <p className="consultas-subtitle">Sistema de Gestión FoamWash - Lavados González</p>
            </div>
            <div className="autores-info">
            <small>Por: Deimer González, Cristian Criollo, Carolina Gómez, Michel Quintero, Marlon Eraso</small>
            </div>
        </div>

        {/* Selector de Consultas */}
        <div className="consultas-selector">
            {consultas.map(consulta => (
            <button
                key={consulta.numero}
                className={`consulta-btn consulta-btn-${consulta.color} ${
                consultaActiva === consulta.numero ? 'active' : ''
                }`}
                onClick={() => setConsultaActiva(consulta.numero)}
            >
                <span className="consulta-icon">{consulta.icon}</span>
                <span className="consulta-numero">#{consulta.numero}</span>
            </button>
            ))}
        </div>

        {/* Información de la Consulta Actual */}
        <div className={`consulta-actual consulta-${consultaActual.color}`}>
            <div className="consulta-actual-header">
            <span className="consulta-actual-icon">{consultaActual.icon}</span>
            <div>
                <h3>{consultaActual.titulo}</h3>
                <p>{consultaActual.descripcion}</p>
            </div>
            </div>

            {/* Filtro de Empleado si es necesario */}
            {consultaActual.requiereId && (
            <div className="filtro-empleado">
                <label>Seleccionar Empleado:</label>
                <select
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
                className="select-empleado"
                >
                <option value="">Todos los empleados</option>
                {empleados.map(emp => (
                    <option key={emp.Id_Usuario} value={emp.Id_Usuario}>
                    {emp.Nombre}
                    </option>
                ))}
                </select>
            </div>
            )}
        </div>

        {/* Resultados */}
        <div className="consulta-resultados">
            <div className="resultados-header">
            <h4>Resultados ({datos.length} registros)</h4>
            <button 
                className="btn-recargar" 
                onClick={() => cargarConsulta(consultaActiva)}
            >
                🔄 Recargar
            </button>
            </div>
            {renderTabla()}
        </div>

        {/* Resumen de Consultas */}
        <div className="consultas-resumen">
            <h3>📋 Resumen de Consultas Disponibles</h3>
            <div className="resumen-grid">
            {consultas.map(consulta => (
                <div
                key={consulta.numero}
                className={`resumen-card resumen-${consulta.color} ${
                    consultaActiva === consulta.numero ? 'active' : ''
                }`}
                onClick={() => setConsultaActiva(consulta.numero)}
                >
                <div className="resumen-header">
                    <span className="resumen-icon">{consulta.icon}</span>
                    <span className="resumen-numero">#{consulta.numero}</span>
                </div>
                <h4>{consulta.titulo}</h4>
                <p>{consulta.descripcion}</p>
                </div>
            ))}
            </div>
        </div>

        {/* Información del Proyecto */}
        <div className="proyecto-info">
            <div className="proyecto-card">
            <h4>🏢 Sobre el Proyecto</h4>
            <p><strong>Sistema:</strong> FoamWash - Sistema de Gestión de Servicios</p>
            <p><strong>Empresa:</strong> Lavados González</p>
            <p><strong>Servicios:</strong> Limpieza de muebles, alfombras, colchones, vehículos y cortinas</p>
            </div>
            
            <div className="proyecto-card">
            <h4>👨‍💻 Equipo de Desarrollo</h4>
            <ul>
                <li>Deimer Jesús González Jiménez</li>
                <li>Cristian Andrés Criollo Tovar</li>
                <li>Carolina Gómez Rodríguez</li>
                <li>Michel Alejandra Quintero Aragon</li>
                <li>Marlon Narváes Alexis Eraso</li>
            </ul>
            </div>
        </div>
        </div>
    );
    }

    export default Consultas;