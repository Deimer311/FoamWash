import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';

const Header = ({ userType = 'admin', userEmail = '' }) => {
  // Estado para controlar la visibilidad del modal de cierre de sesión.
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Función para mostrar el modal de confirmación.
  const handleLogoutClick = (e) => {
    e.preventDefault();
    // Reemplazamos window.confirm con un modal de React.
    setShowLogoutModal(true);
  };

  // Función para confirmar el cierre de sesión y redirigir.
  const confirmLogout = () => {
    console.log("Cerrando sesión...");
    setShowLogoutModal(false); // Ocultar modal
    // Redirección o lógica de limpieza de sesión real
    window.location.href = './login.html'; 
  };

  // Función para cancelar el cierre de sesión.
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Función para renderizar los enlaces de navegación según el tipo de usuario.
  const renderNavLinks = () => {
    if (userType === 'admin') {
      return (
        <>
          <Link to="/" className="nav-link">Hogar</Link>
          <Link to="/ordenes-admin" className="nav-link">Ordenes</Link>
          <Link to="#" className="nav-link">Usuarios</Link>
          <Link to="#" className="nav-link">Servicios</Link>
          <Link to="#" className="nav-link">Reportes</Link>
          {/* Usamos una clase separada para el color del perfil */}
          <Link to="/perfil-admin" className="nav-link nav-profile-link">Perfil</Link>
          <a href="#" className="nav-link btn-salir" onClick={handleLogoutClick}>Cerrar Sesión</a>
        </>
      );
    } else if (userType === 'empleado') {
      return (
        <>
          <Link to="/" className="nav-link">Hogar</Link>
          <Link to="/ordenes-empleado" className="nav-link">Ordenes</Link>
          <Link to="/perfil-trabajador" className="nav-link nav-profile-link">Perfil</Link>
          <a href="#" className="nav-link btn-salir" onClick={handleLogoutClick}>Cerrar Sesión</a>
        </>
      );
    } else if (userType === 'cliente') {
      return (
        <>
          <Link to="#" className="nav-link">Hogar</Link>
          <Link to="./cotizar_cliente.html" className="nav-link">Cotización</Link>
          <Link to="./servicios_cliente.html" className="nav-link">Agendar</Link>
          <Link to="/perfil-cliente" className="nav-link nav-profile-link">Perfil</Link>
          <a href="#" className="nav-link btn-salir" onClick={handleLogoutClick}>Cerrar Sesión</a>
        </>
      );
    }
    return null;
  };

  return (
    <header className="header-banner">
      {/* Fondo de encabezado simulado con un placeholder */}
      <div 
        className="fondo" 
        style={{ backgroundImage: `url('https://placehold.co/1200x200/223BFF/FFFFFF?text=FoamWash+Background')` }} 
        aria-hidden="true"
      ></div>
      <h1 className="logo-header">FoamWash</h1>
      <nav className="nav-bar">
        {renderNavLinks()}
      </nav>

      {/* Información de usuario */}
      <div className="user-info-container">
        <span className="user-email-display">{userEmail || "usuario@foamwash.com"}</span>
      </div>

      {/* Modal de Confirmación de Cierre de Sesión */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <p className="modal-message">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="modal-actions">
              <button onClick={cancelLogout} className="modal-button modal-button-cancel">Cancelar</button>
              <button onClick={confirmLogout} className="modal-button modal-button-confirm">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;