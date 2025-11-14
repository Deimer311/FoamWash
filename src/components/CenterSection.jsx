// =============================================================================
// CENTERSECTION.JSX - SECCIÓN CENTRAL CON BOTÓN DE SERVICIOS
// =============================================================================
// Componente que muestra el botón principal para ir a la página de servicios
// =============================================================================

import React from 'react';

/**
 * COMPONENTE: CenterSection
 * 
 * PROPS:
 * - onServiciosClick: Función que se ejecuta cuando el usuario hace clic en "Servicios"
 * 
 * CONCEPTO CLAVE:
 * Este componente ahora es "interactivo" porque maneja navegación
 */
const CenterSection = ({ onServiciosClick }) => {
    return (
        <div className="center-section">
            {/* 
                ANTES (HTML estático):
                <a href="./servicios.html">
                    <button className="service-btn">Servicios</button>
                </a>
                
                AHORA (React dinámico):
                - Eliminamos el <a> porque no queremos navegar a un archivo HTML
                - Agregamos onClick que ejecuta la función del padre
                - El botón ahora cambia el estado en App.js para mostrar ServiciosPage
            */}
            <button 
                className="service-btn"
                onClick={onServiciosClick}
            >
                Servicios
            </button>
            
            <p className="service-text">
                Inicia sesión para agendar un servicio.
            </p>
        </div>
    );
};

export default CenterSection;

// =============================================================================
// FLUJO COMPLETO:
// =============================================================================
//
// 1. Usuario hace clic en el botón "Servicios"
//    ↓
// 2. Se ejecuta onClick en el botón
//    ↓
// 3. onClick ejecuta onServiciosClick() (viene de las props)
//    ↓
// 4. onServiciosClick ejecuta setCurrentPage('servicios') en App.js
//    ↓
// 5. El estado currentPage cambia a 'servicios'
//    ↓
// 6. React detecta el cambio de estado y re-renderiza App.js
//    ↓
// 7. El switch en App.js renderiza <ServiciosPage />
//    ↓
// 8. El usuario ve la página de servicios
//
// =============================================================================