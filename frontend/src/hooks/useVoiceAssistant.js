import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para gestionar el reconocimiento de voz (SpeechRecognition)
 * y la síntesis de voz (SpeechSynthesis).
 */
export const useVoiceAssistant = (onCommandDetected, isVoiceChatSuspended = false) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isTtsSpeakingRef = useRef(false);
  const silenceTimeoutRef = useRef(null);

  // Guardar onCommandDetected en un Ref para evitar recrear la instancia de SpeechRecognition
  // cada vez que el componente padre se renderiza y cambian sus estados/closures.
  const onCommandDetectedRef = useRef(onCommandDetected);
  useEffect(() => {
    onCommandDetectedRef.current = onCommandDetected;
  }, [onCommandDetected]);

  // Síntesis de voz (TTS)
  const speak = useCallback((text, onEndCallback) => {
    if (!window.speechSynthesis) {
      console.warn('La síntesis de voz no está soportada en este navegador.');
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancelar habla previa para evitar bloqueos
    window.speechSynthesis.cancel();
    isTtsSpeakingRef.current = true;

    // Ducking: atenuar volumen de la música si hay activa
    if (window.backgroundAudio) {
      window.backgroundAudio.volume = 0.02;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Intentar buscar voz en español
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const spanishVoice = voices.find(v => v.lang === 'es-CO') || voices.find(v => v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
    }

    const handleSpeechEnd = () => {
      isTtsSpeakingRef.current = false;
      // Restaurar el volumen de fondo
      if (window.backgroundAudio) {
        window.backgroundAudio.volume = 0.25;
      }
      if (onEndCallback) {
        onEndCallback();
      }
    };

    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechEnd;

    // Pequeño timeout antes de reproducir para asegurar el reinicio de la API
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback((speakPrompt = true) => {
    // Si ya hay una instancia activa, limpiarla para forzar una nueva con buffer vacío
    if (recognitionRef.current) {
      try {
        const oldRec = recognitionRef.current;
        oldRec.onstart = null;
        oldRec.onresult = null;
        oldRec.onerror = null;
        oldRec.onend = null;
        oldRec.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    isListeningRef.current = true;
    setIsListening(true);
    setTranscript('');

    const executeStart = () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const rec = new SpeechRecognition();
        rec.continuous = true; // Permite pausas de habla sin cortar la grabación
        rec.interimResults = false;
        rec.lang = 'es-CO';

        rec.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
        };

        rec.onresult = (event) => {
          if (isTtsSpeakingRef.current) {
            return;
          }

          // Concatenar todos los resultados del buffer de la sesión actual
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }

          const cleanTranscript = currentTranscript.trim();
          setTranscript(cleanTranscript);

          // Reiniciar timeout de silencio
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          silenceTimeoutRef.current = setTimeout(() => {
            if (cleanTranscript && onCommandDetectedRef.current) {
              onCommandDetectedRef.current(cleanTranscript);
              // Detener inmediatamente y destruir la instancia para limpiar el buffer
              isListeningRef.current = false;
              setIsListening(false);
              try {
                rec.stop();
              } catch (e) {}
            }
          }, 1800);
        };

        rec.onerror = (event) => {
          console.error('Error de SpeechRecognition:', event.error);
          setIsListening(false);
          isListeningRef.current = false;
        };

        rec.onend = () => {
          if (isListeningRef.current && !isVoiceChatSuspended) {
            setTimeout(() => {
              if (isListeningRef.current && !isVoiceChatSuspended) {
                executeStart();
              }
            }, 100);
          } else {
            setIsListening(false);
            isListeningRef.current = false;
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error('Fallo al iniciar SpeechRecognition:', err);
      }
    };

    if (speakPrompt) {
      speak('Te escucho', executeStart);
    } else {
      executeStart();
    }
  }, [speak, isVoiceChatSuspended]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          const rec = recognitionRef.current;
          rec.onstart = null;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening(true);
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    speak,
    startListening,
    stopListening,
    toggleListening
  };
};
