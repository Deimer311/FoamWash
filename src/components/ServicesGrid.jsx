// ServicesGrid.jsx
import React from 'react';
import ServiceCard from './ServiceCard';

const ServicesGrid = ({ servicios, onSolicitar, onGoToLogin }) => {
    return (
        <div className="services-grid">
            {servicios.map(servicio => (
                <ServiceCard
                    key={servicio.id}
                    servicio={servicio}
                    onSolicitar={onSolicitar}
                    onGoToLogin={onGoToLogin}  // ← AGREGAR ESTA LÍNEA
                />
            ))}
        </div>
    );
};

export default ServicesGrid;