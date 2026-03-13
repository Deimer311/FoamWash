import { useState, useEffect, useRef } from 'react';
import './components/css/OrdenesAdmin.css';

// Datos de ejemplo simulando las órdenes del administrador
const MOCK_ORDERS = [
  {
    id: 'O001',
    client: 'Juan David Ramírez',
    service: 'Lavado de Sillas y Sofás',
    priority: 'Alta',
    status: 'Pendiente',
    date: '2025-11-23', // Hoy
    address: 'Carrera 10 #5-15, Centro',
    document: '1020456789',
    email: 'juan.ramirez@gmail.com',
    observations: 'Cliente requiere el servicio urgente por accidente con bebida.',
  },
  {
    id: 'O002',
    client: 'William Lozano',
    service: 'Limpieza de Colchón',
    priority: 'Media',
    status: 'En Proceso',
    date: '2025-11-20', // Esta semana
    address: 'Calle 22 #6-30 Compartir',
    document: '3175311324',
    email: 'william.lozano@gmail.com',
    observations: 'Revisión final, todo en orden',
  },
  {
    id: 'O003',
    client: 'Carlos Pérez',
    service: 'Lavado de alfombras',
    priority: 'Baja',
    status: 'Finalizada',
    date: '2025-11-18',
    address: 'Calle 45 #12-20',
    document: '1234567890',
    email: 'carlos.perez@gmail.com',
    observations: 'Cliente muy satisfecho con el servicio',
  },
  {
    id: 'O004',
    client: 'Ana María Giraldo',
    service: 'Limpieza Profunda de Interior de Vehículo',
    priority: 'Alta',
    status: 'Pendiente',
    date: '2025-11-23', // Hoy
    address: 'Avenida Siempre Viva #742',
    document: '9876543210',
    email: 'ana.giraldo@outlook.com',
    observations: 'Solicita cotización previa antes de confirmar el servicio.',
  },
];

const OrdenesAdmin = () => {
  const [orders] = useState(MOCK_ORDERS);
  const [animatedStats, setAnimatedStats] = useState({
    hoy: 0,
    semana: 0,
    completados: 0,
    pendientes: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  
  // Refs para evitar múltiples animaciones
  const animationTimers = useRef([]);

  // Calcular estadísticas reales
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().slice(0, 10);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const statsData = orders.reduce((acc, order) => {
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);

      // Órdenes de hoy
      if (order.date === todayStr) {
        acc.hoy += 1;
      }
      
      // Órdenes de la última semana
      if (orderDate >= oneWeekAgo) {
        acc.semana += 1;
      }
      
      // Órdenes completadas
      if (order.status === 'Finalizada') {
        acc.completados += 1;
      }
      
      // Órdenes pendientes (Pendiente + En Proceso)
      if (order.status === 'Pendiente' || order.status === 'En Proceso') {
        acc.pendientes += 1;
      }
      
      return acc;
    }, { hoy: 0, semana: 0, completados: 0, pendientes: 0 });

    return statsData;
  };

  // Animar contadores usando React state
  useEffect(() => {
    // Limpiar timers anteriores
    animationTimers.current.forEach(timer => clearInterval(timer));
    animationTimers.current = [];

    const realStats = calculateStats();

    // Animar cada estadística
    Object.keys(realStats).forEach((key, index) => {
      const targetValue = realStats[key];
      const duration = 800 + (index * 200);
      
      let currentValue = 0;
      const increment = targetValue > 0 ? Math.ceil(targetValue / 20) : 0;
      const stepTime = duration / 20;

      const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }

        setAnimatedStats(prev => ({
          ...prev,
          [key]: currentValue
        }));
      }, stepTime);

      animationTimers.current.push(timer);
    });

    // Cleanup
    return () => {
      animationTimers.current.forEach(timer => clearInterval(timer));
    };
  }, [orders]);

  // Maneja el clic en los botones de filtro
  const handleFilterClick = (filterStatus) => {
    setActiveFilter(activeFilter === filterStatus ? null : filterStatus);
  };

  // Lógica de filtrado y ordenamiento de órdenes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter ? order.status === activeFilter : true;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Ordenamiento personalizado: Prioridad Alta primero
    if (a.priority === 'Alta' && b.priority !== 'Alta') return -1;
    if (a.priority !== 'Alta' && b.priority === 'Alta') return 1;
    // Segundo ordenamiento: Pendientes primero
    if (a.status === 'Pendiente' && b.status !== 'Pendiente') return -1;
    if (a.status !== 'Pendiente' && b.status === 'Pendiente') return 1;
    // Tercer ordenamiento: Fecha más reciente primero
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <>
      <div className="header">
        <div className="logo">FoamWash</div>
        <div className="nav-tabs">
          <button className="nav-tab">Hogar</button>
          <button className="nav-tab active">Órdenes</button>
          <button className="nav-tab">Usuarios</button>
          <button className="nav-tab">Servicios</button>
          <button className="nav-tab">Reportes</button>
          <button className="nav-tab">Perfil</button>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Gestión de Órdenes</h1>

        {/* Contadores / Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{animatedStats.hoy}</div>
            <div className="stat-label">Órdenes Hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{animatedStats.semana}</div>
            <div className="stat-label">Última Semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{animatedStats.completados}</div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{animatedStats.pendientes}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container">
          <input
            type="text"
            className="search-box"
            placeholder="🔍 Buscar por Cliente, Servicio o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeFilter === 'Pendiente' ? '#5B4E99' : '#f0f0f0',
              color: activeFilter === 'Pendiente' ? 'white' : '#666',
              transition: 'all 0.3s'
            }}
            onClick={() => handleFilterClick('Pendiente')}
          >
            Pendientes
          </button>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeFilter === 'En Proceso' ? '#5B4E99' : '#f0f0f0',
              color: activeFilter === 'En Proceso' ? 'white' : '#666',
              transition: 'all 0.3s'
            }}
            onClick={() => handleFilterClick('En Proceso')}
          >
            En Proceso
          </button>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeFilter === 'Finalizada' ? '#5B4E99' : '#f0f0f0',
              color: activeFilter === 'Finalizada' ? 'white' : '#666',
              transition: 'all 0.3s'
            }}
            onClick={() => handleFilterClick('Finalizada')}
          >
            Finalizadas
          </button>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeFilter === null ? '#5B4E99' : '#f0f0f0',
              color: activeFilter === null ? 'white' : '#666',
              transition: 'all 0.3s'
            }}
            onClick={() => setActiveFilter(null)}
          >
            Todas
          </button>
        </div>

        {/* Contenedor de Órdenes */}
        <div>
          <h2 className="section-title">Órdenes Activas ({filteredOrders.length})</h2>
          <div className="orders-grid">
            {filteredOrders.map((order, index) => (
              <div 
                className="order-card" 
                key={order.id} 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="order-header">
                  <div className="client-name">{order.client}</div>
                  <div className={`priority-badge priority-${order.priority.toLowerCase()}`}>
                    {order.priority}
                  </div>
                </div>
                <div className="service-name">{order.service}</div>
                <div className={`status-bar status-${order.status.toLowerCase().replace(' ', '')}`}>
                  {order.status}
                </div>
                <div className="order-details">
                  <div><strong>ID Orden:</strong> {order.id}</div>
                  <div><strong>Fecha:</strong> {order.date}</div>
                  <div><strong>Dirección:</strong> {order.address}</div>
                  <div><strong>Documento:</strong> {order.document}</div>
                  <div><strong>Email:</strong> {order.email}</div>
                </div>
                <div className="observations">
                  <strong>Observaciones:</strong> {order.observations}
                </div>
              </div>
            ))}

            {/* Mensaje cuando no hay órdenes */}
            {filteredOrders.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No se encontraron órdenes</h4>
                <p>No hay órdenes que coincidan con los criterios de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdenesAdmin;