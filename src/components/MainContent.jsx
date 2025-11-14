// =============================================================================
// MAINCONTENT.JSX - CONTENIDO PRINCIPAL DE LA PÁGINA DE INICIO
// =============================================================================
// Componente que organiza las tres secciones principales
// =============================================================================

import React from 'react';
import LeftSection from './LeftSection';
import CenterSection from './CenterSection';
import RightSection from './RightSection';

/**
 * COMPONENTE: MainContent
 * 
 * PROPS:
 * - onServiciosClick: Función para navegar a la página de servicios
 * 
 * CONCEPTO CLAVE - PROPS DRILLING:
 * Este componente recibe onServiciosClick de App.js y lo pasa a CenterSection.
 * Esto se llama "props drilling" (perforar props a través de niveles).
 * 
 * FLUJO DE DATOS:
 * App.js → MainContent → CenterSection → onClick del botón
 */
const MainContent = ({ onServiciosClick }) => {
    return (
        <div className="main-content">
            <LeftSection />
            
            {/* 
                IMPORTANTE:
                Pasar onServiciosClick al CenterSection
                para que el botón "Servicios" funcione
            */}
            <CenterSection onServiciosClick={onServiciosClick} />
            
            <RightSection />
        </div>
    );
};

export default MainContent;

// =============================================================================
// CONCEPTO CLAVE: PROPS DRILLING
// =============================================================================
//
// DEFINICIÓN:
// Pasar props a través de varios niveles de componentes.
//
// EJEMPLO:
// App.js (tiene la función)
//   ↓ pasa como prop
// MainContent (no la usa, solo la pasa)
//   ↓ pasa como prop
// CenterSection (la usa en el onClick)
//
// VENTAJAS:
// - Simple de entender
// - Fácil de debuggear
// - No requiere librerías adicionales
//
// DESVENTAJAS:
// - Si hay muchos niveles, se vuelve tedioso
// - Los componentes intermedios tienen props que no usan
//
// ALTERNATIVAS (para más adelante):
// - Context API (para estado global)
// - Redux (para aplicaciones grandes)
// - Zustand (solución ligera)
//
// =============================================================================