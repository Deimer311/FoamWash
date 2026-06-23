// =============================================================================
// ARCHIVO  : MainContent.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/MainContent.jsx
// REDISEÑO : Overlay + canvas como capas CSS, estructura semántica limpia
// =============================================================================

import React, { useEffect, useRef } from 'react';
import LeftSection from './LeftSection';
import CenterSection from './CenterSection';
import RightSection from './RightSection';
import './Header.css';

const MainContent = ({ onServiciosClick, bgImage }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const setupCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(dpr, dpr);
        };
        setupCanvas();

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            if (mouseRef.current.x > 0) {
                const g = ctx.createRadialGradient(
                    mouseRef.current.x, mouseRef.current.y, 0,
                    mouseRef.current.x, mouseRef.current.y, 80
                );
                g.addColorStop(0, 'rgba(150, 220, 255, 0.25)');
                g.addColorStop(0.5, 'rgba(50, 180, 255, 0.1)');
                g.addColorStop(1, 'rgba(0, 150, 255, 0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mouseRef.current.x, mouseRef.current.y, 80, 0, Math.PI * 2);
                ctx.fill();
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        const handleMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            setupCanvas();
        };

        window.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseleave', handleLeave);
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseleave', handleLeave);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            {/* Imagen de fondo */}
            {bgImage && (
                <img src={bgImage} alt="" className="hero-bg" aria-hidden="true" />
            )}

            {/* Overlay oscuro */}
            <div className="hero-overlay" aria-hidden="true" />

            {/* Canvas efecto mouse */}
            <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />

            {/* Contenido */}
            <div className="main-content-wrapper">
                <div className="main-content-container">
                    <div className="main-content-grid">
                        <div className="left-section">
                            <LeftSection />
                        </div>
                        <div className="center-section">
                            <CenterSection onServiciosClick={onServiciosClick} />
                        </div>
                        <div className="right-section">
                            <RightSection />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainContent;