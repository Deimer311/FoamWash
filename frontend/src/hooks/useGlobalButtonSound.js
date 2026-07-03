// =============================================================================
// ARCHIVO  : useGlobalButtonSound.js
// PROYECTO : FoamWash
// RUTA     : src/hooks/useGlobalButtonSound.js
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Hook que escucha TODOS los clicks del documento y reproduce un sonido
//   automáticamente cuando el elemento clickeado es un <button>, un <a>,
//   o cualquier elemento con clase que contenga "btn".
//   Solo hay que llamarlo UNA VEZ en App.js — afecta toda la aplicación.
// =============================================================================

import { useEffect, useRef } from 'react';

const useGlobalButtonSound = () => {
    const audioCtxRef = useRef(null);

    const getCtx = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtxRef.current;
    };

    const playTone = (frecuencia, duracion, tipo = 'sine', volumen = 0.18) => {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gan = ctx.createGain();
            osc.connect(gan);
            gan.connect(ctx.destination);
            osc.type            = tipo;
            osc.frequency.value = frecuencia;
            gan.gain.setValueAtTime(volumen, ctx.currentTime);
            gan.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);
            osc.start();
            osc.stop(ctx.currentTime + duracion);
        } catch (e) {
            console.warn('Audio no disponible:', e);
        }
    };

    useEffect(() => {
        const handleClick = (e) => {
            const el = e.target;

            // Sube hasta 3 niveles en el DOM buscando el elemento clickeable
            // (por si el click fue en un <span> dentro de un <button>)
            const esBoton = (nodo) => {
                if (!nodo || nodo === document.body) return false;
                const tag       = nodo.tagName?.toLowerCase();
                const clases    = nodo.className || '';
                const role      = nodo.getAttribute?.('role');

                return (
                    tag === 'button' ||
                    tag === 'a' ||
                    role === 'button' ||
                    (typeof clases === 'string' && (
                        clases.includes('btn') ||
                        clases.includes('-btn') ||
                        clases.includes('button')
                    ))
                );
            };

            // Recorre el árbol hacia arriba buscando el botón real
            let objetivo = el;
            for (let i = 0; i < 4; i++) {
                if (esBoton(objetivo)) {
                    playTone(750, 0.09, 'sine', 0.18);
                    break;
                }
                objetivo = objetivo?.parentElement;
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);
};

export default useGlobalButtonSound;