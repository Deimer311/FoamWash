import React, { useState, useEffect } from 'react';
// Asumimos que los estilos están en esta ruta relativa (o en App.jsx)
import '../styles/estilos_cotizar.css'; 

// =======================================================
// DATOS DE SERVICIOS (Extraídos del HTML original)
// =======================================================
const serviceData = [
  { id: 1, img: "/img/imag1.jpg", title: "Lavado de muebles", desc: "Lavado profundo de sofás y sillas, eliminación de manchas y olores.", price: "$90.000" },
  { id: 2, img: "/img/imag4.jpg", title: "Lavado de alfombras", desc: "Limpieza profunda para alfombras pequeñas y medianas.", price: "$50.000" },
  { id: 3, img: "/img/imag5.jpg", title: "Tapicería de carros", desc: "Limpieza interior del vehículo: asientos, alfombras y paneles.", price: "$140.000" },
  { id: 4, img: "/img/imag7.jpg", title: "Lavado de cortinas", desc: "Lavado y planchado ligero para cortinas y visillos.", price: "$80.000" },
  { id: 5, img: "/img/imag6.jpg", title: "Lavado de colchones", desc: "Eliminación de ácaros y manchas, desodorización y secado rápido.", price: "$90.000" },
  { id: 6, img: "/img/imag8.jpg", title: "Mantenimiento y pulido de pisos", desc: "Recuperar brillo, proteger la superficie y mejorar su apariencia.", price: "$100.000" },
  { id: 7, img: "/img/imag2.jpg", title: "Limpieza sillas de comedor", desc: "Elimina manchas, suciedad y malos olores.", price: "$7.000 por silla" },
  { id: 8, img: "/img/imag3.jpg", title: "Limpieza de tapetes decorativos", desc: "Remueve suciedad, polvo y manchas, devolviendo frescura y color..", price: "$60.000" },
];

// =======================================================
// UTILIDADES (Adaptadas del JS original para React)
// =======================================================
const LS_USER_KEY = 'fw_user';
const LS_AGENDAS_KEY = 'fw_agendas';
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY));
  } catch (e) {
    return null;
  }
};
const clearUser = () => localStorage.removeItem(LS_USER_KEY);
const saveAgenda = (agenda) => {
    const arr = JSON.parse(localStorage.getItem(LS_AGENDAS_KEY) || '[]');
    arr.push(agenda);
    localStorage.setItem(LS_AGENDAS_KEY, JSON.stringify(arr));
};

// =======================================================
// SUBCOMPONENTE: Tarjeta de Servicio (ServiceCard)
// =======================================================
const ServiceCard = ({ service, onCotizar }) => (
  <article className="service-card">
    <div className="service-image">
      {/* Ruta absoluta para recursos en public/ */}
      <img src={service.img} alt={service.title} />
    </div>
    <div className="service-content">
      <h3 className="service-title">{service.title}</h3>
      <p className="service-desc">{service.desc}</p>
      <div className="service-meta">
        <span className="service-price">{service.price}</span>
        <button 
          type="button" 
          className="service-btn" 
          onClick={onCotizar} // Llama a la función del componente padre
        >
          cotizar
        </button>
      </div>
    </div>
  </article>
);


// =======================================================
// SUBCOMPONENTE: Modal de Autenticación (AuthPromptModal)
// =======================================================
const AuthPromptModal = ({ onClose, onLogin, onRegister }) => (
  <div className="fw-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
    <div className="fw-modal" style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: 'min(520px,96%)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
      <button type="button" onClick={onClose} style={{ position: 'absolute', right: '18px', top: '16px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#666' }}>✕</button>
      
      <div style={{ textAlign: 'center', padding: '6px 6px 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(#223BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '24px' }}>FW</div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0', fontSize: '18px' }}>Debes iniciar sesión primero</h3>
            <p style={{ margin: '6px 0 0', color: '#555' }}>Para cotizar un servicio crea una cuenta o inicia sesión.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
          <button 
            className="fw-register-btn" 
            onClick={onRegister}
            style={{ flex: '1', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
          >
            Registrarse
          </button>
          <button 
            className="fw-login-btn" 
            onClick={onLogin}
            style={{ flex: '1', padding: '10px 12px', borderRadius: '10px', border: 'none', background: '#0b74ff', color: '#fff', cursor: 'pointer' }}
          >
            Iniciar sesión
          </button>
        </div>
        <div style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>No compartiremos tu información en este demo.</div>
      </div>
    </div>
  </div>
);

// =======================================================
// SUBCOMPONENTE: Modal de Agendamiento (ScheduleModal)
// =======================================================
const ScheduleModal = ({ service, user, onClose }) => {
    const [formData, setFormData] = useState({ date: '', time: '', address: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.date || !formData.time || !formData.address) {
            return alert('Complete todos los campos.');
        }
        
        const agenda = {
            serviceTitle: service.title,
            servicePrice: service.price,
            ...formData,
            user: user.username,
            createdAt: new Date().toISOString()
        };

        saveAgenda(agenda);
        onClose();
        alert('Agendamiento confirmado.\nRevisa la sección "Mis agendamientos" (demo almacenado localmente).');
    };

    return (
        <div className="fw-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
            <div className="fw-modal" style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: 'min(520px,96%)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
                <button type="button" onClick={onClose} style={{ position: 'absolute', right: '18px', top: '16px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#666' }}>✕</button>
                <form onSubmit={handleSubmit}>
                    <h3>Agendar: {service.title}</h3>
                    <p>Precio: <strong>{service.price}</strong></p>
                    <label style={{ display: 'block', margin: '8px 0' }}>
                        Fecha
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required style={{ padding: '8px', width: '100%', marginTop: '4px', borderRadius: '8px', border: '1px solid #e6e6e6' }} />
                    </label>
                    <label style={{ display: 'block', margin: '8px 0' }}>
                        Hora
                        <input type="time" name="time" value={formData.time} onChange={handleChange} required style={{ padding: '8px', width: '100%', marginTop: '4px', borderRadius: '8px', border: '1px solid #e6e6e6' }} />
                    </label>
                    <label style={{ display: 'block', margin: '8px 0' }}>
                        Dirección
                        <input name="address" value={formData.address} onChange={handleChange} required style={{ padding: '8px', width: '100%', marginTop: '4px', borderRadius: '8px', border: '1px solid #e6e6e6' }} placeholder="Dirección donde se realizará el servicio" />
                    </label>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ background: '#0b74ff', color: '#fff', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Confirmar agendamiento</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// =======================================================
// COMPONENTE PRINCIPAL: Cotizaciones
// =======================================================
export default function Cotizaciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(getUser()); // Estado de usuario
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // LOGICA: Filtro de servicios
  const filteredServices = serviceData.filter(service => {
    const query = searchTerm.toLowerCase();
    return service.title.toLowerCase().includes(query) ||
           service.desc.toLowerCase().includes(query) ||
           service.price.toLowerCase().includes(query);
  });

  // LOGICA: Handler para el botón 'Cotizar'
  const handleCotizar = (service) => {
    setSelectedService(service);
    if (!user) {
      setShowAuthModal(true); // Mostrar modal de autenticación si no hay usuario
    } else {
      setShowScheduleModal(true); // Mostrar modal de agendamiento si hay usuario
    }
  };

  // LOGICA: Manejo de autenticación/redirección
  const handleLoginRedirect = () => {
      // En React, usarías el enrutador. Aquí simulamos la redirección externa.
      window.location.href = '/login.html'; 
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    const ok = window.confirm('¿Cerrar sesión?');
    if (!ok) return;
    clearUser();
    setUser(null); // Actualiza el estado
  };
  
  const handleAuthAction = (action) => {
    setShowAuthModal(false); 
    if (action === 'login' || action === 'register') {
        handleLoginRedirect();
    } 
    // NOTA: Si el registro se hiciera AQUÍ y fuera exitoso, llamaríamos a setShowScheduleModal(true)
    // para reanudar el flujo de agendamiento.
  };

  // Lógica para que el modal de agendamiento se muestre inmediatamente después de un login
  // En un entorno real, esto se manejaría al volver de la página de login. 
  // Aquí, lo omitiremos para simplificar el flujo en un solo componente.


  return (
    <>
      {/* ==================== HEADER CON BANNER ==================== */}
      <header className="header-banner">
        <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
        <h1 className="logo-header">FoamWash</h1>
        <nav className="nav-bar">
          <a href="/index.html" className="nav-link">Hogar</a>
          <a 
            href="#" 
            className="nav-link" 
            style={{ color: 'rgb(133, 198, 255)' }}
          >
            Cotización
          </a>
          <a href="/servicios.html" className="nav-link">Agendar</a>
          <a 
            href={user ? '#' : '/login.html'} // Enlace dinámico
            className="nav-link"
            onClick={user ? handleLogoutClick : handleLoginRedirect} // Evento dinámico
          >
            {user ? `Hola, ${user.username} (Cerrar)` : 'Iniciar Sesión'} 
          </a>
        </nav>
      </header>

      {/* ==================== BARRA DE BÚSQUEDA ==================== */}
      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
            aria-label="Buscar servicios"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Manejo de estado
          />
          <button className="search-button" aria-label="buscar">🔍</button>
        </div>
      </section>

      {/* ==================== LISTADO DE SERVICIOS ==================== */}
      <section className="services-section">
        <h2 className="section-title">Nuestros servicios</h2>
        <div className="services-grid">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id}
              service={service} 
              onCotizar={() => handleCotizar(service)} // Pasa el servicio al handler
            />
          ))}
        </div>
      </section>

      {/* ==================== MODALES (RENDERIZADO CONDICIONAL) ==================== */}
      
      {/* Modal de Autenticación */}
      {showAuthModal && (
        <AuthPromptModal
          onClose={() => setShowAuthModal(false)}
          onLogin={() => handleAuthAction('login')}
          onRegister={() => handleAuthAction('register')}
        />
      )}

      {/* Modal de Agendamiento */}
      {showScheduleModal && selectedService && user && (
        <ScheduleModal
          service={selectedService}
          user={user}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </>
  );
}