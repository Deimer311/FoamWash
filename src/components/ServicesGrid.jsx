import React from 'react';
import ServiceCard from './ServiceCard';

const ServicesGrid = ({ servicios, onSolicitar }) => {
    return (
        <div className="services-grid">
            {servicios.map(servicio => (
                <ServiceCard
                    key={servicio.id}
                    servicio={servicio}
                    onSolicitar={onSolicitar}
                />
            ))}
        </div>
    );
};

export default ServicesGrid;