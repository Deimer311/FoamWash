// =============================================================================
// ARCHIVO  : LeftSection.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/LeftSection.jsx
// REDISEÑO : Dots de navegación, tipografía mejorada, sin clicks accidentales
// =============================================================================

import React, { useState, useEffect } from 'react';

const viewsData = [
    {
        title: "Lavados González",
        content: "Lavados y Limpieza profunda... Ofrecemos servicios de limpieza profunda, cuidando cada material con profesionalismo y delicadeza."
    },
    {
        title: "Visión",
        content: "Queremos a corto plazo convertirnos en la empresa con mayor clientela en el ámbito de la limpieza, para el año 2026 aumentar nuestra clientela al doble de la que tenemos actualmente."
    },
    {
        title: "Misión",
        content: "Nuestra misión es ser líderes en soluciones de limpieza para el hogar y la industria, con un enfoque en la calidad y la sostenibilidad."
    }
];

const INTERVAL_MS = 7000;

const LeftSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const autoRotate = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % viewsData.length);
        }, INTERVAL_MS);
        return () => clearInterval(autoRotate);
    }, []);

    return (
        <div className="left-section-inner">
            {/* Slides de texto */}
            <div className="left-text-block">
                {viewsData.map((view, index) => (
                    <div
                        key={index}
                        className="left-slide-item"
                        style={{
                            opacity: currentIndex === index ? 1 : 0,
                            transform: currentIndex === index ? 'translateY(0)' : 'translateY(20px)',
                            pointerEvents: currentIndex === index ? 'auto' : 'none'
                        }}
                    >
                        <h2 className="left-slide-title">{view.title}</h2>
                        {view.subtitle && (
                            <p className="left-slide-subtitle">{view.subtitle}</p>
                        )}
                        <p className="left-slide-body">{view.content}</p>
                    </div>
                ))}
            </div>

            {/* Dots de navegación */}
            <div className="left-indicators">
                {viewsData.map((_, index) => (
                    <button
                        key={index}
                        className={`left-dot${currentIndex === index ? ' active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Ir a slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default LeftSection;