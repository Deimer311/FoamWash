// =============================================================================
// ARCHIVO  : App.js
// PROYECTO : FoamWash
// RUTA     : src/App.js
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Componente raíz de la aplicación. Maneja el enrutamiento mediante estado currentPage y renderiza el componente correcto según el rol del usuario.
// =============================================================================

import React, { useState, useEffect } from 'react';
//==============================================================================
// Contextos de Autenticación y Carrito
//==============================================================================
import { AuthProvider, useAuth } from './components/autenticacion/AuthContext';
import { CarritoProvider } from './components/modales/CarritoContext';
//==============================================================================
// Páginas y Componentes
//==============================================================================
import LoginPage from './components/autenticacion/LoginPage';
import RecuperarContrasena from './components/autenticacion/Recuperar';
import ServiciosPage from './components/servicios/ServiciosPage';
import ServiciosClientePage from './components/cliente/ServiciosClientePage';
import CotizacionesCliente from './components/cliente/CotizacionesCliente';
import CotizacionPage from './components/cotizacion/CotizacionPage';

// ✅ COMPONENTES DE ADMIN
import PerfilAdmin from './components/admin/PerfilAdmin';
import PerfilAdminEdi from './components/admin/PerfilAdminEdi';
import ReportesAdmin from './components/admin/ReportesAdmin';
import CrudUsuarios from './components/admin/CrudUsuarios';
import CrudServicios from './components/admin/CrudServicios';
import CrudEmpleados from './components/admin/CrudEmpleados';
import QuickActionsApp from './components/admin/acciones-rapidas';
import ConsultasAdmin from './components/admin/ConsultasAdmin';
import AdminDashboard from './components/admin/AdminDashboard';
import EmpleadosAdmin from './components/admin/EmpleadosAdmin';
import HeaderAdmin from './components/admin/HeaderAdmin';
import Agenda from './components/admin/Agenda';

// ✅ COMPONENTES DE TRABAJADOR
import HeaderEmpleado from './components/trabajador/HeaderEmpleado';
import PerfilTrabajador from './components/trabajador/PerfilTrabajador';
import PerfilTrabajadorEdi from './components/trabajador/PerfilTrabajadorEdi';
import AgendaEmpleado from './components/trabajador/AgendaEmpleado';

// ✅ COMPONENTES DE CLIENTE
import PerfilCliente from './components/cliente/PerfilCliente';
import PerfilClienteEdi from './components/cliente/PerfilClienteEdi';

//==============================================================================
// Componentes de la Aplicación
//==============================================================================
import Header from './components/comun/Header';
import MainContent from './components/comun/MainContent';
import Footer from './components/comun/Footer';
import './styles.css'

const AppContent = () => {
    
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('home');
    
    // ✅ FIX: Solo redirige al autenticarse por primera vez.
    // Si dependiera de [user], cada llamada a refreshUser() (al guardar foto)
    // actualizaría el estado y este effect reenviaría al usuario al dashboard.
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPage = user.redirectPage || getDefaultRedirect(user.role);
            setCurrentPage(redirectPage);
        }
    }, [isAuthenticated]);
    
    const goToHome = () => setCurrentPage('home');
    const goToLogin = () => setCurrentPage('login');
    const goToServicios = () => setCurrentPage('servicios');
    const goToRecuperar = () => setCurrentPage('recuperar');
    
    const goToServiciosCliente = () => {
        if (!isAuthenticated) {
            goToLogin();
        } else {
            setCurrentPage('servicios-cliente');
        }
    };

    // ✅ Navega SIEMPRE a CotizacionPage (flujo público de cotización + agendamiento).
    //    Se usa desde ServiciosPage, donde el usuario no está autenticado y el contexto
    //    es siempre el mismo: cotizar → agendar → pedir login si hace falta.
    const goToCotizacionPublica = () => {
        setCurrentPage('cotizacion-publica');
    };
    
    // Navega a la cotización según el rol del usuario autenticado.
    // Se usa desde páginas que ya requieren login (ServiciosClientePage, PerfilCliente, etc.)
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
            case 'admin': return 'admin-dashboard';
            case 'trabajador': return 'agenda-empleado';
            case 'cliente': return 'servicios-cliente';
            default: return 'home';
        }
    };
    
    const handleLoginSuccess = (result) => {
    const { role } = result;
    
if (role === 'admin') {
        setCurrentPage('admin-dashboard');
    } else if (role === 'trabajador') {
        setCurrentPage('agenda-empleado');
    } else if (role === 'cliente') {
        setCurrentPage('servicios-cliente');
    } else {
        // Fallback por si hay algún otro rol
        const { redirectPage } = result;
        setCurrentPage(redirectPage || getDefaultRedirect(role));
    }
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
                        onRecuperar={goToRecuperar}
                    />
                );
            
            case 'recuperar':
                return (
                    <RecuperarContrasena 
                        onBackToLogin={goToLogin}
                        onBackToHome={goToHome}
                    />
                );
            
            // ✅ ServiciosPage recibe goToCotizacionPublica: desde aquí "Cotización"
            //    siempre va a CotizacionPage, sin importar el estado de autenticación.
            case 'servicios':
                return (
                    <ServiciosPage 
                        onBackToHome={goToHome}
                        onGoToLogin={goToLogin}
                        onCotizacionPublica={goToCotizacionPublica}
                    />
                );
            
            case 'cotizacion-publica':
                return (
                    <CotizacionPage 
                        onBackToHome={goToHome}
                        onGoToLogin={goToLogin}
                        onGoToServicios={goToServicios}
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
                        onServicios={goToServiciosCliente}
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

            // =============================================================================
            // 👤 RUTAS DE CLIENTE
            // =============================================================================
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
                        onEditarPerfil={() => setCurrentPage('editar-perfil-cliente')}
                        onLogout={handleLogout}
                    />
                );

            case 'editar-perfil-cliente':
                if (!isAuthenticated || user?.role !== 'cliente') {
                    goToLogin();
                    return null;
                }
                return (
                    <PerfilClienteEdi
                        onBackToProfile={() => setCurrentPage('perfil')}
                        onBackToHome={goToHome}
                    />
                );

            // =============================================================================
            // 👨‍💼 RUTAS DE ADMIN
            // =============================================================================
            case 'admin-dashboard':
    if (!isAuthenticated || user?.role !== 'admin') {
        goToHome();
        return null;
    }
    return (
        <AdminDashboard 
            onGoAgenda={() => setCurrentPage("agenda-admin")}
            onGoEmpleados={() => setCurrentPage("empleados-admin")}
            onGoReportes={() => setCurrentPage("reportes-admin")}
            onGoPerfil={() => setCurrentPage("perfil-admin")}
            onGoUsuarios={() => setCurrentPage('crud-usuarios')}
            onGoServicios={() => setCurrentPage('crud-servicios')}
            onLogout={handleLogout}
        />
    );
            case 'agenda-admin':
    if (!isAuthenticated || user?.role !== 'admin') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderAdmin
                activeTab="agenda"
                onGoDashboard={() => setCurrentPage('admin-dashboard')}
                onGoAgenda={() => setCurrentPage('agenda-admin')}
                onGoEmpleados={() => setCurrentPage('empleados-admin')}
                onGoReportes={() => setCurrentPage('reportes-admin')}
                onGoPerfil={() => setCurrentPage('perfil-admin')}
                onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                onGoServicios={() => setCurrentPage('crud-servicios')}
                onLogout={handleLogout}
            />
            <Agenda />
        </>
    );
            case 'empleados-admin':
    if (!isAuthenticated || user?.role !== 'admin') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderAdmin
                activeTab="empleados"
                onGoDashboard={() => setCurrentPage('admin-dashboard')}
                onGoAgenda={() => setCurrentPage('agenda-admin')}
                onGoEmpleados={() => setCurrentPage('empleados-admin')}
                onGoReportes={() => setCurrentPage('reportes-admin')}
                onGoPerfil={() => setCurrentPage('perfil-admin')}
                onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                onGoServicios={() => setCurrentPage('crud-servicios')}
                onLogout={handleLogout}
            />
            <EmpleadosAdmin />
        </>
    );
            case 'reportes-admin':
    if (!isAuthenticated || user?.role !== 'admin') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderAdmin
                activeTab="reportes"
                onGoDashboard={() => setCurrentPage('admin-dashboard')}
                onGoAgenda={() => setCurrentPage('agenda-admin')}
                onGoEmpleados={() => setCurrentPage('empleados-admin')}
                onGoReportes={() => setCurrentPage('reportes-admin')}
                onGoPerfil={() => setCurrentPage('perfil-admin')}
                onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                onGoServicios={() => setCurrentPage('crud-servicios')}
                onLogout={handleLogout}
            />
            <ReportesAdmin />
        </>
    );

    case 'perfil-admin':
    if (!isAuthenticated || user?.role !== 'admin') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderAdmin
                activeTab="perfil"
                onGoDashboard={() => setCurrentPage('admin-dashboard')}
                onGoAgenda={() => setCurrentPage('agenda-admin')}
                onGoEmpleados={() => setCurrentPage('empleados-admin')}
                onGoReportes={() => setCurrentPage('reportes-admin')}
                onGoPerfil={() => setCurrentPage('perfil-admin')}
                onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                onGoServicios={() => setCurrentPage('crud-servicios')}
                onLogout={handleLogout}
            />
            <PerfilAdmin
                onBackToHome={goToHome}
                onDashboard={() => setCurrentPage('admin-dashboard')} 
                onCrudUsuarios={() => setCurrentPage('crud-usuarios')}
                onCrudServicios={() => setCurrentPage('crud-servicios')}
                onCrudEmpleados={() => setCurrentPage('crud-empleados')}
                onEditarPerfil={() => setCurrentPage('editar-perfil-admin')}
                onReportesAdmin={() => setCurrentPage('reportes-admin')}
                onConsultas={() => setCurrentPage('consultas-admin')}
                onLogout={handleLogout}
            />
        </>
    );

            case 'editar-perfil-admin':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <PerfilAdminEdi
                        onBackToProfile={() => setCurrentPage('perfil-admin')}
                        onBackToHome={goToHome}
                    />
                );

            case 'crud-usuarios':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <>
                        <HeaderAdmin
                            activeTab="usuarios"
                            onGoDashboard={() => setCurrentPage('admin-dashboard')}
                            onGoAgenda={() => setCurrentPage('agenda-admin')}
                            onGoEmpleados={() => setCurrentPage('empleados-admin')}
                            onGoReportes={() => setCurrentPage('reportes-admin')}
                            onGoPerfil={() => setCurrentPage('perfil-admin')}
                            onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                            onGoServicios={() => setCurrentPage('crud-servicios')}
                            onLogout={handleLogout}
                        />
                        <CrudUsuarios
                            onBackToHome={goToHome}
                            onBackToProfile={() => setCurrentPage('admin-dashboard')}
                        />
                    </>
                );

            case 'crud-servicios':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <>
                        <HeaderAdmin
                            activeTab="servicios"
                            onGoDashboard={() => setCurrentPage('admin-dashboard')}
                            onGoAgenda={() => setCurrentPage('agenda-admin')}
                            onGoEmpleados={() => setCurrentPage('empleados-admin')}
                            onGoReportes={() => setCurrentPage('reportes-admin')}
                            onGoPerfil={() => setCurrentPage('perfil-admin')}
                            onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                            onGoServicios={() => setCurrentPage('crud-servicios')}
                            onLogout={handleLogout}
                        />
                        <CrudServicios
                            onBackToHome={goToHome}
                            onBackToProfile={() => setCurrentPage('admin-dashboard')}
                        />
                    </>
                );

            case 'crud-empleados':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <>
                        <HeaderAdmin
                            activeTab="empleados"
                            onGoDashboard={() => setCurrentPage('admin-dashboard')}
                            onGoAgenda={() => setCurrentPage('agenda-admin')}
                            onGoEmpleados={() => setCurrentPage('empleados-admin')}
                            onGoReportes={() => setCurrentPage('reportes-admin')}
                            onGoPerfil={() => setCurrentPage('perfil-admin')}
                            onGoUsuarios={() => setCurrentPage('crud-usuarios')}
                            onGoServicios={() => setCurrentPage('crud-servicios')}
                            onLogout={handleLogout}
                        />
                        <CrudEmpleados
                            onBackToHome={goToHome}
                            onBackToProfile={() => setCurrentPage('admin-dashboard')}
                        />
                    </>
                );


            // ✅ NUEVO: Ruta para Consultas del Admin
            case 'consultas-admin':
                if (!isAuthenticated || user?.role !== 'admin') {
                    goToHome();
                    return null;
                }
                return (
                    <ConsultasAdmin
                        onBackToHome={goToHome}
                        onBackToProfile={() => setCurrentPage('reportes')}
                    />
                );

                

                
            // =============================================================================
            // 👷 RUTAS DE TRABAJADOR
            // =============================================================================


case 'agenda-empleado':
    if (!isAuthenticated || user?.role !== 'trabajador') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderEmpleado
                activeTab="agenda"
                onGoAgendaEmpleado={() => setCurrentPage('agenda-empleado')}
                onGoPerfil={() => setCurrentPage('perfil-trabajador')}
                onLogout={handleLogout}
            />
            {/* Reemplazamos el div anterior por el componente real */}
            <AgendaEmpleado /> 
        </>
    );
case 'perfil-trabajador':
    if (!isAuthenticated || user?.role !== 'trabajador') {
        goToHome();
        return null;
    }
    return (
        <>
            <HeaderEmpleado
                activeTab="perfil"
                onGoAgendaEmpleado={() => setCurrentPage('agenda-empleado')}
                onGoPerfil={() => setCurrentPage('perfil-trabajador')}
                onLogout={handleLogout}
            />
            <PerfilTrabajador
                onBackToHome={goToHome}
                onEditarPerfil={() => setCurrentPage('editar-perfil-trabajador')}
                onLogout={handleLogout}
            />
        </>
    );

            case 'editar-perfil-trabajador':
                if (!isAuthenticated || user?.role !== 'trabajador') {
                    goToHome();
                    return null;
                }
                return (
                    <PerfilTrabajadorEdi
                            onBackToProfile={() => setCurrentPage('perfil-trabajador')}
                        onBackToHome={goToHome}
/>
                );
            
            //==============================================================================
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