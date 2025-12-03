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
    import CotizacionesCliente from './components/CotizacionesCliente';
    import CotizacionPage from './components/CotizacionPage';
    import PerfilAdmin from './components/PerfilAdmin';
    import PerfilTrabajador from './components/PerfilTrabajador';
    import PerfilCliente from './components/PerfilCliente';
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
        }, [isAuthenticated, user]);
        
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
        
        const goToCotizacion = () => {
            if (isAuthenticated && user?.role === 'cliente') {
                setCurrentPage('cotizacion-cliente');
            } else if (isAuthenticated) {
                alert('Las cotizaciones están disponibles solo para clientes');
            } else {
                setCurrentPage('cotizacion-publica');
            }
        };
        
        const goToPerfil = () => {
            if (!isAuthenticated) {
                goToLogin();
            } else {
                setCurrentPage('perfil');
            }
        };
        
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
                        <div className="container">
                            <Header onLoginClick={goToLogin} />
                            <MainContent onServiciosClick={goToServicios} />
                            <Footer />
                            <div className='background-image-container'></div>
                        </div>
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
                
                case 'cotizacion-publica':
                    return (
                        <CotizacionPage 
                            onBackToHome={goToHome}
                            onGoToLogin={goToLogin}
                        />
                    );
                
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

                case 'perfil':
                    if (!isAuthenticated) {
                        goToLogin();
                        return null;
                    }
                    return (
                        <PerfilCliente 
                            onBackToHome={goToHome}
                            onCotizacion={goToCotizacion}
                            onServicios={goToServiciosCliente}
                        />
                    );
                
                case 'reportes':
                    if (!isAuthenticated || user?.role !== 'admin') {
                        goToHome();
                        return null;
                    }
                    return (
                        <PerfilAdmin
                            onBackToHome={goToHome}
                        />
                    );
                
                case 'tareas':
                    if (!isAuthenticated || user?.role !== 'trabajador') {
                        goToHome();
                        return null;
                    }
                    return (
                        <PerfilTrabajador
                            onBackToHome={goToHome}
                            onTareas={() => setCurrentPage('tareas')}
                        />
                    );
                
                default:
                    return (
                        <div className="container">
                            <Header onLoginClick={goToLogin} />
                            <MainContent onServiciosClick={goToServicios} />
                            <Footer />
                            <div className='background-image-container'></div>
                        </div>
                    );
            }
        };
        
        return (
            <div className="app">
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