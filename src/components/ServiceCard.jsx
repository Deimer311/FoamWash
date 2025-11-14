import React from 'react';

const ServiceCard = ({ servicio, onSolicitar }) => {
    const { id, titulo, descripcion, precio, imagen } = servicio;

    const handleSolicitar = () => {
        onSolicitar(servicio);
    };

    return (
        <article className='service-card'>
            <div className='service-image'>
                <img src={imagen} alt={titulo} onError={(e)=> {
                    e.target.src = './img/placeholder.png';
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
    );
};
export default ServiceCard;