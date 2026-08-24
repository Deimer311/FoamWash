// =============================================================================
// ARCHIVO  : AudioManager.js
// PROYECTO : FoamWash
// RUTA     : src/components/audio/AudioManager.js
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Componente que maneja la música de fondo de toda la aplicación.
//   Muestra un control flotante (🎵/🔇) para que el usuario pueda
//   activar o silenciar la música.
//
//   ► PARA CAMBIAR LA MÚSICA:
//     Pon tu archivo en public/sounds/background.mp3
//     y actualiza la variable MUSIC_SRC abajo.
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AudioManager.css';

// ── Configuración ─────────────────────────────────────────────────────────────
// 🎵 Cambia esta ruta por tu archivo de música real:
//    Colócalo en:  public/sounds/background.mp3
const MUSIC_SRC    = 'sounds/FoamWash_2.wav';
const VOLUMEN_BASE = 0.25; // 0.0 (silencio) → 1.0 (máximo)
// ─────────────────────────────────────────────────────────────────────────────

const AudioManager = () => {
    const audioRef          = useRef(null);
    const [activo,   setActivo]   = useState(false);  // ¿música sonando?
    const [visible,  setVisible]  = useState(false);  // ¿botón visible? (aparece tras 1ª interacción)
    const [cargado,  setCargado]  = useState(false);  // ¿el audio ya cargó?

    // Inicializa el elemento <audio> una sola vez
    useEffect(() => {
        const audio       = new Audio(MUSIC_SRC);
        audio.loop        = true;
        audio.volume      = VOLUMEN_BASE;
        audio.preload     = 'auto';
        audioRef.current  = audio;

        audio.addEventListener('canplaythrough', () => setCargado(true));
        audio.addEventListener('error', () => {
            // Si no existe el archivo, el botón se oculta silenciosamente
            console.warn('AudioManager: no se encontró', MUSIC_SRC,
                '— Coloca tu música en public/sounds/background.mp3');
        });

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Primera interacción del usuario → habilitar autoplay y mostrar control
    const handlePrimeraInteraccion = useCallback(() => {
        setVisible(true);
        // Intentar reproducir automáticamente la primera vez
        if (audioRef.current && cargado) {
            audioRef.current.play()
                .then(() => setActivo(true))
                .catch(() => {
                    // El navegador bloqueó el autoplay → el usuario usará el botón
                });
        }
        document.removeEventListener('click', handlePrimeraInteraccion);
    }, [cargado]);

    useEffect(() => {
        document.addEventListener('click', handlePrimeraInteraccion);
        return () => document.removeEventListener('click', handlePrimeraInteraccion);
    }, [handlePrimeraInteraccion]);

    // Alternar música con el botón flotante
    const toggleMusica = useCallback((e) => {
        e.stopPropagation(); // Evitar que el click del botón cuente como "primera interacción" doble
        const audio = audioRef.current;
        if (!audio || !cargado) return;

        if (activo) {
            audio.pause();
            setActivo(false);
        } else {
            audio.play().catch(() => {});
            setActivo(true);
        }
    }, [activo, cargado]);

    // No renderizar hasta que el usuario haya interactuado
    if (!visible) return null;

    return (
    <button
        className={`audio-manager-btn ${activo ? 'activo' : 'silenciado'}`}
        onClick={toggleMusica}
        title={activo ? 'Silenciar música' : 'Activar música'}
        aria-label={activo ? 'Silenciar música de fondo' : 'Activar música de fondo'}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            cursor: 'pointer'
        }}
    >
        <span className="audio-icono">
            {activo ? (
                /* Icono de Música Activa (Notas musicales) */
                <svg height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            ) : (
                /* Icono de Música Silenciada (Altavoz con X) */
                <svg height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            )}
        </span>
    </button>
    );
};

export default AudioManager;