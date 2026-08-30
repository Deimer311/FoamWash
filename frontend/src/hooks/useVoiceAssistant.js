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

  // Inicialización de SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition no está soportado en este navegador.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // Captura de frases individuales para mayor precisión y robustez
    rec.interimResults = false;
    rec.lang = 'es-CO';

    rec.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    rec.onresult = (event) => {
      // Ignorar sonido si la IA está hablando para evitar eco
      if (isTtsSpeakingRef.current) {
        return;
      }

      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      if (onCommandDetected) {
        onCommandDetected(resultText);
      }
    };

    rec.onerror = (event) => {
      console.error('Error de SpeechRecognition:', event.error);
      if (event.error === 'no-speech') {
        // Ignorar para reanudar silenciosamente en el onend
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    rec.onend = () => {
      // Reanudar la escucha si sigue activa la referencia y no está suspendido
      if (isListeningRef.current && !isVoiceChatSuspended) {
        setTimeout(() => {
          try {
            if (isListeningRef.current && !isVoiceChatSuspended) {
              rec.start();
            }
          } catch (e) {
            // Ignorar si ya está iniciado
          }
        }, 100);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  }, [onCommandDetected, speak, isVoiceChatSuspended]);

  const startListening = useCallback((speakPrompt = true) => {
    if (!recognitionRef.current) return;

    isListeningRef.current = true;
    setIsListening(true);

    const executeStart = () => {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('SpeechRecognition ya está activo.');
      }
    };

    if (speakPrompt) {
      speak('Te escucho', executeStart);
    } else {
      executeStart();
    }
  }, [speak]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
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
