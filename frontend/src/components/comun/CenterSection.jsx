// =============================================================================
// ARCHIVO  : CenterSection.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/CenterSection.jsx
// REDISEÑO : Se eliminó el texto de fricción "Inicia sesión para agendar"
//            El CTA es directo y limpio.
// =============================================================================

import React from 'react';

const CenterSection = ({ onServiciosClick }) => {
    return (
        <div className="center-section">
            <button
                className="service-btn"
                onClick={onServiciosClick}
            >
                Ver servicios
            </button>
        </div>
    );
};

export default CenterSection;