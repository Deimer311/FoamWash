import React, { useState } from 'react';
import AuthModal from './AuthModal';
import { checkActiveSession } from '../utils/AuthUtils';

const ServiceCard = ({ servicio, onSolicitar, onGoToLogin }) => {
    const { id, titulo, descripcion, precio, imagen } = servicio;
    
    // Estado para controlar la visibilidad del modal
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSolicitar = () => {
        // Verificar si el usuario está logueado
        const session = checkActiveSession();
        
        if (!session.isActive) {
            // Si NO está logueado, mostrar el modal
            setShowAuthModal(true);
        } else {
            // Si SÍ está logueado, proceder con la solicitud
            onSolicitar(servicio);
        }
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowAuthModal(false);
    };

    // Ir a la página de login
    const handleGoToLogin = () => {
        setShowAuthModal(false);
        if (onGoToLogin) {
            onGoToLogin();
        }
    };

    // Ir a la página de registro (por ahora igual que login)
    const handleGoToRegister = () => {
        setShowAuthModal(false);
        if (onGoToLogin) {
            onGoToLogin(); // Por ahora redirige al login, que tiene toggle a registro
        }
    };

    return (
        <>
            <article className='service-card'>
                <div className='service-image'>
                    <img 
                        src={imagen} 
                        alt={titulo} 
                        onError={(e) => {
                            e.target.src = '/img/placeholder.jpg';
                        }}
                    />
                </div>
                
                <div className="service-content">
                    <h3 className="service-title">{titulo}</h3>
                    
                    <p className="service-desc">{descripcion}</p>
                    
                    <div className="service-meta">
                        <span className="service-price">{precio}</span>
                        
                        <button 
                            type="button" 
                            className="service-btn"
                            onClick={handleSolicitar}
                        >
                            Solicitar
                        </button>
                    </div>
                </div>
            </article>

            {/* MODAL DE AUTENTICACIÓN */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={handleCloseModal}
                onLogin={handleGoToLogin}
                onRegister={handleGoToRegister}
                title="Debes iniciar sesión primero"
                message="Para solicitar un servicio crea una cuenta o inicia sesión."
            />
        </>
    );
};

export default ServiceCard;