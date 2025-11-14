import React, { useState, useEffect } from 'react';

// Define el contenido de las vistas (replicando el HTML original)
const viewsData = [
    { 
        content: (
            <>
                <p className="subtitle">Lavados y Limpieza profunda...</p>
                <h2 className="title-shine">Encuentra Tu Servicio Ideal</h2>
                <p className="description">Ofrecemos servicios de limpieza profunda, cuidando cada material con profesionalismo y delicadeza.</p>
            </>
        ), 
        className: "welcome-text" 
    },
    { 
        content: (
            <>
                <h2>Visión</h2>
                <p>Queremos a corto plazo convertirnos en la empresa con mayor clientela en el ámbito de la limpieza, para el año 2025 aumentar nuestra clientela al doble de la que tenemos actualmente.</p>
            </>
        ), 
        className: "mision-vision-view" 
    },
    { 
        content: (
            // NOTA: Se asume este texto para la tercera vista (Misión) ya que el JS original gestiona 3 estados.
            <> 
                <h2>Misión</h2>
                <p>Nuestra misión es ser líderes en soluciones de limpieza para el hogar y la industria, con un enfoque en la calidad y la sostenibilidad.</p>
            </>
        ), 
        className: "mision-vision-view" 
    }
];

const intervalTime = 30000; // 30 segundos

const LeftSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Lógica de ROTACIÓN AUTOMÁTICA
    useEffect(() => {
        const autoRotate = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % viewsData.length);
        }, intervalTime);

        // Limpieza: detiene el intervalo
        return () => clearInterval(autoRotate);
    }, []); 

    // Lógica de CAMBIO MANUAL (reemplaza el addEventListener('click') de index.js)
    const handleNextView = () => {
        // Mueve a la siguiente vista
        setCurrentIndex(prevIndex => (prevIndex + 1) % viewsData.length);
        // NOTA: Al cambiar el estado, el useEffect se "reinicia" automáticamente, logrando el mismo efecto de tu JS original.
    };

    return (
        <div className="left-section">
            <h1>
                FoamWash
                <span style={{ fontSize: '0.75em' }}>LG</span>
            </h1>
            
            {/* El área clickeable para el cambio manual */}
            <div 
                className="dynamic-text-wrapper" 
                id="dynamic-text-area"
                onClick={handleNextView} 
            >
                {/* Renderizado de las vistas con la clase 'active' aplicada dinámicamente */}
                {viewsData.map((view, index) => (
                    <div 
                        key={index}
                        className={`dynamic-view ${view.className} ${index === currentIndex ? 'active' : ''}`}
                    >
                        {view.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeftSection;