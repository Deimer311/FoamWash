// =============================================================================
// ARCHIVO  : MainContent.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/MainContent.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Contenido principal de la página de inicio con animaciones y secciones.
// =============================================================================

import React, { useEffect, useRef } from 'react';
import LeftSection from './LeftSection';
import CenterSection from './CenterSection';
import RightSection from './RightSection';
import './MainContent.css';

const MainContent = ({ onServiciosClick }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
    const blobsRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Configurar canvas
        const setupCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(dpr, dpr);
        };

        setupCanvas();

        // Clase para las gotas de agua
        class Blob {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.radius = Math.random() * 30 + 20;
                this.targetRadius = this.radius;
            }

            update(mouse) {
                // Atracción suave hacia el mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    const force = (200 - dist) / 200 * 0.3;
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                    this.targetRadius = this.radius * 1.3;
                } else {
                    this.targetRadius = this.radius * 0.8;
                }

                // Movimiento suave
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.x += this.vx;
                this.y += this.vy;

                // Rebote en bordes
                if (this.x < this.radius) {
                    this.x = this.radius;
                    this.vx *= -0.8;
                }
                if (this.x > width - this.radius) {
                    this.x = width - this.radius;
                    this.vx *= -0.8;
                }
                if (this.y < this.radius) {
                    this.y = this.radius;
                    this.vy *= -0.8;
                }
                if (this.y > height - this.radius) {
                    this.y = height - this.radius;
                    this.vy *= -0.8;
                }

                // Interacción entre blobs
                blobsRef.current.forEach(other => {
                    if (other !== this) {
                        const dx = other.x - this.x;
                        const dy = other.y - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const minDist = this.radius + other.radius;

                        if (dist < minDist) {
                            const force = (minDist - dist) / minDist * 0.5;
                            this.vx -= (dx / dist) * force;
                            this.vy -= (dy / dist) * force;
                        }
                    }
                });
            }
        }

        // Inicializar blobs
        const initBlobs = () => {
            const blobCount = Math.min(12, Math.floor((width * height) / 150000));
            blobsRef.current = [];
            
            for (let i = 0; i < blobCount; i++) {
                blobsRef.current.push(
                    new Blob(
                        Math.random() * width,
                        Math.random() * height
                    )
                );
            }
            console.log('✓ Blobs de agua creados:', blobCount);
        };

        initBlobs();

        // Dibujar blobs con efecto de agua
        const drawBlobs = () => {
            blobsRef.current.forEach(blob => {
                // Sombra/brillo exterior
                const gradient = ctx.createRadialGradient(
                    blob.x, blob.y, 0,
                    blob.x, blob.y, blob.targetRadius * 1.5
                );
                gradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
                gradient.addColorStop(0.4, 'rgba(0, 180, 255, 0.4)');
                gradient.addColorStop(0.7, 'rgba(0, 150, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.targetRadius * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Núcleo brillante
                const coreGradient = ctx.createRadialGradient(
                    blob.x - blob.targetRadius * 0.3, 
                    blob.y - blob.targetRadius * 0.3, 
                    0,
                    blob.x, blob.y, 
                    blob.targetRadius
                );
                coreGradient.addColorStop(0, 'rgba(150, 220, 255, 0.9)');
                coreGradient.addColorStop(0.5, 'rgba(50, 180, 255, 0.7)');
                coreGradient.addColorStop(1, 'rgba(0, 150, 255, 0.5)');

                ctx.fillStyle = coreGradient;
                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.targetRadius, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Dibujar conexiones líquidas
        const drawConnections = () => {
            blobsRef.current.forEach((blob, i) => {
                blobsRef.current.forEach((other, j) => {
                    if (i < j) {
                        const dx = other.x - blob.x;
                        const dy = other.y - blob.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const maxDist = blob.targetRadius + other.targetRadius + 100;

                        if (dist < maxDist) {
                            const opacity = (1 - dist / maxDist) * 0.3;
                            
                            const gradient = ctx.createLinearGradient(
                                blob.x, blob.y, other.x, other.y
                            );
                            gradient.addColorStop(0, `rgba(0, 180, 255, ${opacity})`);
                            gradient.addColorStop(0.5, `rgba(50, 200, 255, ${opacity * 1.5})`);
                            gradient.addColorStop(1, `rgba(0, 180, 255, ${opacity})`);

                            ctx.strokeStyle = gradient;
                            ctx.lineWidth = (1 - dist / maxDist) * 20;
                            ctx.beginPath();
                            ctx.moveTo(blob.x, blob.y);
                            ctx.lineTo(other.x, other.y);
                            ctx.stroke();
                        }
                    }
                });
            });
        };

        // Animación principal
        const animate = () => {
            // Limpiar canvas
            ctx.clearRect(0, 0, width, height);

            // Actualizar blobs (mantener física pero no dibujar)
            blobsRef.current.forEach(blob => {
                blob.update(mouseRef.current);
            });

            // NO dibujar conexiones ni blobs
            // drawConnections();
            // drawBlobs();

            // Efecto de onda desde el mouse (SOLO ESTO SE VE)
            if (mouseRef.current.x > 0) {
                const mouseGradient = ctx.createRadialGradient(
                    mouseRef.current.x, mouseRef.current.y, 0,
                    mouseRef.current.x, mouseRef.current.y, 80
                );
                mouseGradient.addColorStop(0, 'rgba(150, 220, 255, 0.3)');
                mouseGradient.addColorStop(0.5, 'rgba(50, 180, 255, 0.15)');
                mouseGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
                
                ctx.fillStyle = mouseGradient;
                ctx.beginPath();
                ctx.arc(mouseRef.current.x, mouseRef.current.y, 80, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Event listeners
        let lastX = 0, lastY = 0;
        let logCount = 0;

        const handleMouseMove = (e) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
                vx: e.clientX - lastX,
                vy: e.clientY - lastY
            };

            // Debug: solo loggear cada 60 frames
            if (logCount++ % 60 === 0) {
                console.log('Mouse:', e.clientX, e.clientY);
            }

            lastX = e.clientX;
            lastY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000, vx: 0, vy: 0 };
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            setupCanvas();
            initBlobs();
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            {/* Canvas de agua */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />

            {/* Contenido principal */}
            <div className="main-content-container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="main-content-grid">
                    <div className="grid-section left-section">
                        <LeftSection />
                    </div>
                    
                    <div className="grid-section center-section">
                        <CenterSection onServiciosClick={onServiciosClick} />
                    </div>
                    
                    <div className="grid-section right-section">
                        <RightSection />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;