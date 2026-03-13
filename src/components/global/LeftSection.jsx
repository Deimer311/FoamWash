   import React, { useState, useEffect } from 'react';

const viewsData = [
    { 
        title: "Lavados González",
        content: "Lavados y Limpieza profunda... Ofrecemos servicios de limpieza profunda, cuidando cada material con profesionalismo y delicadeza."
    },
    { 
        title: "Visión",
        content: "Queremos a corto plazo convertirnos en la empresa con mayor clientela en el ámbito de la limpieza, para el año 2025 aumentar nuestra clientela al doble de la que tenemos actualmente."
    },
    { 
        title: "Misión",
        content: "Nuestra misión es ser líderes en soluciones de limpieza para el hogar y la industria, con un enfoque en la calidad y la sostenibilidad."
    }
];

const intervalTime = 30000; 

const LeftSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const autoRotate = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % viewsData.length);
        }, intervalTime);

        return () => clearInterval(autoRotate);
    }, []);

    const handleNextView = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % viewsData.length);
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0',  // ← CAMBIO: Eliminado padding: '60px'
            color: 'white',
            position: 'relative'
        }}>
            
            
            {/* Contenedor de texto dinámico */}
            <div 
                onClick={handleNextView}
                style={{
                    position: 'relative',
                    minHeight: '250px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                {viewsData.map((view, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            opacity: currentIndex === index ? 1 : 0,
                            transform: currentIndex === index ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'opacity 0.8s ease, transform 0.8s ease',
                            pointerEvents: currentIndex === index ? 'auto' : 'none'
                        }}
                    >
                        {/* Subtítulo o Título */}
                        {view.subtitle ? (
                            <p style={{
                                fontSize: '22px',
                                marginBottom: '20px',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                                lineHeight: '1.4'
                            }}>
                                {view.subtitle}
                            </p>
                        ) : (
                            <h2 style={{
                                fontSize: '42px',
                                fontWeight: '800',
                                marginBottom: '25px',
                                background: '#ffffffff',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: 'none',
                                lineHeight: '1.2'
                            }}>
                                {view.title}
                            </h2>
                        )}

                        {/* Contenido */}
                        <p style={{
                            fontSize: '20px',
                            lineHeight: '1.7',
                            fontWeight: '400',
                            opacity: 0.95,
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                            margin: 0
                        }}>
                            {view.content}
                        </p>
                    </div>
                ))}
            </div>

           
            {/* Animaciones CSS */}
            <style>{`
                @keyframes fadeInOut {
                    0%, 100% {
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
};

export default LeftSection;