// =============================================================================
// ARCHIVO  : useSound.js
// PROYECTO : FoamWash
// RUTA     : src/hooks/useSound.js
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   - playClick  → usa TU archivo de audio real (public/sounds/Boton.wav)
//   - playError  → generado automáticamente con Web Audio API
//   - playExito  → generado automáticamente con Web Audio API
//   - playLogout → generado automáticamente con Web Audio API
// =============================================================================

import { useCallback, useRef } from 'react';

// ── Ruta de TU archivo de botón ───────────────────────────────────────────────
// Cambia el nombre si tu archivo se llama diferente.
// Ejemplos: '/sounds/click.wav'  '/sounds/mi-boton.ogg'
const SONIDO_BOTON = 'public/sounds/Boton.wav';
// ─────────────────────────────────────────────────────────────────────────────

const useSound = () => {
    const audioCtxRef = useRef(null);

    // Inicializa el AudioContext para los sonidos generados
    const getCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    // Función base para generar tonos con Web Audio API
    const playTone = useCallback((frecuencia, duracion, tipo = 'sine', volumen = 0.25) => {
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
            console.warn('useSound: Audio no disponible', e);
        }
    }, [getCtx]);

    // ── Tu archivo de botón ───────────────────────────────────────────────────
    /** Usa TU archivo real de audio */
    const playClick = useCallback(() => {
        try {
            const audio = new Audio(SONIDO_BOTON);
            audio.volume = 0.6;
            audio.play().catch(() => {});
        } catch (e) {
            console.warn('useSound: no se pudo reproducir', SONIDO_BOTON, e);
        }
    }, []);

    // ── Sonidos generados automáticamente ────────────────────────────────────

    /** Error: tono descendente grave — credenciales incorrectas, validación fallida */
    const playError = useCallback(() => {
        try {
            const ctx = getCtx();
            // Dos tonos descendentes = sensación de "algo salió mal"
            [320, 220].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gan = ctx.createGain();
                osc.connect(gan);
                gan.connect(ctx.destination);
                osc.type            = 'sawtooth';
                osc.frequency.value = freq;
                const inicio = ctx.currentTime + i * 0.18;
                gan.gain.setValueAtTime(0.22, inicio);
                gan.gain.exponentialRampToValueAtTime(0.001, inicio + 0.22);
                osc.start(inicio);
                osc.stop(inicio + 0.22);
            });
        } catch (e) {
            console.warn('useSound: Audio no disponible', e);
        }
    }, [getCtx]);

    /** Éxito: acorde Do-Mi-Sol ascendente — login correcto, guardado exitoso */
    const playExito = useCallback(() => {
        try {
            const ctx = getCtx();
            // Acorde ascendente = sensación de "todo bien"
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gan = ctx.createGain();
                osc.connect(gan);
                gan.connect(ctx.destination);
                osc.type            = 'sine';
                osc.frequency.value = freq;
                const inicio = ctx.currentTime + i * 0.13;
                gan.gain.setValueAtTime(0.25, inicio);
                gan.gain.exponentialRampToValueAtTime(0.001, inicio + 0.28);
                osc.start(inicio);
                osc.stop(inicio + 0.28);
            });
        } catch (e) {
            console.warn('useSound: Audio no disponible', e);
        }
    }, [getCtx]);

    /** Logout: tono suave descendente — cierre de sesión */
    const playLogout = useCallback(() => {
        try {
            const ctx = getCtx();
            // Tono que "baja" = sensación de salida
            [440, 370, 310].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gan = ctx.createGain();
                osc.connect(gan);
                gan.connect(ctx.destination);
                osc.type            = 'sine';
                osc.frequency.value = freq;
                const inicio = ctx.currentTime + i * 0.15;
                gan.gain.setValueAtTime(0.18, inicio);
                gan.gain.exponentialRampToValueAtTime(0.001, inicio + 0.2);
                osc.start(inicio);
                osc.stop(inicio + 0.2);
            });
        } catch (e) {
            console.warn('useSound: Audio no disponible', e);
        }
    }, [getCtx]);

    return {
        playClick,   // ← tu archivo real
        playError,   // ← generado automáticamente
        playExito,   // ← generado automáticamente
        playLogout,  // ← generado automáticamente
    };
};

export default useSound;

// =============================================================================
// 💡 CÓMO USAR EN CUALQUIER COMPONENTE:
// =============================================================================
//
//   import useSound from '../../hooks/useSound';
//
//   const LoginPage = () => {
//       const { playClick, playError, playExito } = useSound();
//
//       const handleLogin = async () => {
//           const ok = await login(usuario, password);
//           if (ok) {
//               playExito();          // ← login correcto
//               onLoginSuccess();
//           } else {
//               playError();          // ← credenciales incorrectas
//           }
//       };
//
//       return (
//           <button onClick={() => { playClick(); handleLogin(); }}>
//               Iniciar sesión
//           </button>
//       );
//   };
//
//   // Para el logout en App.js:
//   const handleLogout = () => {
//       if (window.confirm('¿Cerrar sesión?')) {
//           playLogout();
//           logout();
//           goToHome();
//       }
//   };
// =============================================================================