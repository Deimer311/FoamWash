import React, { useState, useEffect } from 'react';
//==============================================================================
// Contextos de Autenticación y Carrito
//==============================================================================
import { AuthProvider, useAuth } from './components/AuthContext';
import { CarritoProvider } from './components/CarritoContext';
//==============================================================================
// Páginas y Componentes
//==============================================================================
import LoginPage from './components/LoginPage';
import ServiciosPage from './components/ServiciosPage';
import ServiciosClientePage from './components/ServiciosClientePage';
import CotizacionesCliente from './components/CotizacionesCliente'; // ✅ Importar componente de cotizaciones
//==============================================================================
// Componentes de la Aplicación
//==============================================================================
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import './styles.css'

const AppContent = () => {
    
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('home');
    
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPage = user.redirectPage || getDefaultRedirect(user.role);
            setCurrentPage(redirectPage);
        }
    }, []);
    
    const goToHome = () => setCurrentPage('home');
    const goToLogin = () => setCurrentPage('login');
    const goToServicios = () => setCurrentPage('servicios');
    const goToServiciosCliente = () => {
        if (!isAuthenticated) {
            goToLogin();
        } else {
            setCurrentPage('servicios-cliente');
        }
    };
    
    // ✅ FUNCIÓN MEJORADA: Redirige según si está logeado o no
    const goToCotizacion = () => {
        if (isAuthenticated && user?.role === 'cliente') {
            // Si está logeado como cliente, ir a cotizaciones de cliente
            setCurrentPage('cotizacion-cliente');
        } else if (isAuthenticated) {
            // Si está logeado pero no es cliente (admin/trabajador)
            alert('Las cotizaciones están disponibles solo para clientes');
        } else {
            // Si NO está logeado, pedir que inicie sesión
            alert('Por favor inicia sesión para acceder a las cotizaciones');
            goToLogin();
        }
    };
    
    const goToPerfil = () => alert('Página de perfil próximamente');
    
    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
            goToHome();
        }
    };
    
    const getDefaultRedirect = (role) => {
        switch (role) {
            case 'admin': return 'reportes';
            case 'trabajador': return 'tareas';
            case 'cliente': return 'servicios-cliente';
            default: return 'home';
        }
    };
    
    const handleLoginSuccess = (result) => {
        const { role, redirectPage } = result;
        setCurrentPage(redirectPage || getDefaultRedirect(role));
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <>
                        <Header onLoginClick={goToLogin} />
                        <MainContent onServiciosClick={goToServicios} />
                        <Footer />
                        <div className='background-image-container'></div>
                    </>
                );
            
            case 'login':
                return (
                    <LoginPage 
                        onBackToHome={goToHome}
                        onLoginSuccess={handleLoginSuccess}
                    />
                );
            
            case 'servicios':
                return (
                    <ServiciosPage 
                        onBackToHome={goToHome}
                        onGoToLogin={goToLogin}
                        onCotizacion={goToCotizacion}
                    />
                );
            
            // ✅ NUEVO CASE: Cotizaciones para clientes logeados
            case 'cotizacion-cliente':
                if (!isAuthenticated || user?.role !== 'cliente') {
                    goToLogin();
                    return null;
                }
                return (
                    <CotizacionesCliente 
                        onBackToHome={goToHome}
                        onGoToServicios={goToServiciosCliente}
                        onPerfil={goToPerfil}
                    />
                );
            
            case 'servicios-cliente':
                if (!isAuthenticated) {
                    goToLogin();
                    return null;
                }
                return (
                    <ServiciosClientePage 
                        onBackToHome={goToHome}
                        onCotizacion={goToCotizacion}
                        onPerfil={goToPerfil}
                    />
                );
            
            case 'reportes':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '20px',
                        padding: '20px'
                    }}>
                        <h1 style={{ fontSize: '48px' }}>📊 Panel de Reportes</h1>
                        <p style={{ fontSize: '18px', color: '#666' }}>Bienvenido, {user?.name}</p>
                        <p style={{ fontSize: '16px', color: '#999' }}>Página próximamente...</p>
                        <button onClick={goToHome} style={{
                            padding: '12px 30px',
                            background: '#0099ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}>Volver al inicio</button>
                    </div>
                );
            
            case 'tareas':
                if (!isAuthenticated || user?.role !== 'trabajador') {
                    goToHome();
                    return null;
                }
                return (
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '20px',
                        padding: '20px'
                    }}>
                        <h1 style={{ fontSize: '48px' }}>📋 Panel de Tareas</h1>
                        <p style={{ fontSize: '18px', color: '#666' }}>Bienvenido, {user?.name}</p>
                        <p style={{ fontSize: '16px', color: '#999' }}>Página próximamente...</p>
                        <button onClick={goToHome} style={{
                            padding: '12px 30px',
                            background: '#0099ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}>Volver al inicio</button>
                    </div>
                );
            
            default:
                return (
                    <>
                        <Header onLoginClick={goToLogin} />
                        <MainContent onServiciosClick={goToServicios} />
                        <Footer />
                    </>
                );
        }
    };
    
    return (
        <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {renderPage()}
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <CarritoProvider>
                <AppContent />
            </CarritoProvider>
        </AuthProvider>
    );
};

export default App;