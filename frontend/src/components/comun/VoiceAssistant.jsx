import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import api from '../../services/api';
import './VoiceAssistant.css';

/**
 * Componente visual y accesible del Asistente de Voz.
 */
const VoiceAssistant = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [statusText, setStatusText] = useState('Asistente activo');
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Historial del chat en burbujas
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Estados persistidos en localStorage (Retentiva)
  const [isReadingPage, setIsReadingPage] = useState(() => {
    const saved = localStorage.getItem('foamwash_isReadingPage');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isVoiceChatSuspended, setIsVoiceChatSuspended] = useState(() => {
    const saved = localStorage.getItem('foamwash_isVoiceChatSuspended');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [bookingData, setBookingData] = useState(() => {
    const saved = localStorage.getItem('foamwash_bookingData');
    return saved !== null ? JSON.parse(saved) : {
      servicio: 'Lavado de sofás',
      direccion: 'calle 91 63',
      fecha: '29 de agosto',
      hora: '3:00 PM'
    };
  });

  // Estados del Flujo de Configuración y Agendamiento
  const [assistantState, setAssistantState] = useState('welcome_read_page');
  const welcomeGreetedRef = useRef(false);
  const [modifyingField, setModifyingField] = useState('');

  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fuera de enrutador
  }

  // Hook de Voz Reutilizable
  const { isListening, transcript, speak, startListening, stopListening, toggleListening } = useVoiceAssistant(
    (detectedText) => {
      handleCommandResponse(detectedText);
    },
    isVoiceChatSuspended
  );

  // Guardar configuraciones en LocalStorage
  useEffect(() => {
    localStorage.setItem('foamwash_isReadingPage', JSON.stringify(isReadingPage));
  }, [isReadingPage]);

  useEffect(() => {
    localStorage.setItem('foamwash_isVoiceChatSuspended', JSON.stringify(isVoiceChatSuspended));
  }, [isVoiceChatSuspended]);

  useEffect(() => {
    localStorage.setItem('foamwash_bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const speakText = (text, callback) => {
    if (isVoiceChatSuspended) {
      if (callback) callback();
      return;
    }
    speak(text, callback);
  };

  const pushAssistantMsg = (text, isError = false) => {
    setChatHistory((prev) => [...prev, { role: 'assistant', text, error: isError }]);
  };

  const pushUserMsg = (text) => {
    setChatHistory((prev) => [...prev, { role: 'user', text }]);
  };

  const executeNavigation = (targetPath) => {
    if (onNavigate) {
      const cleanPath = targetPath.replace(/^\//, '');
      if (cleanPath === '' || cleanPath === 'inicio') {
        onNavigate('home');
      } else if (cleanPath === 'agendamiento' || cleanPath === 'pasarela-pago') {
        onNavigate('cotizacion-publica');
      } else {
        onNavigate(cleanPath);
      }
    }
    if (navigate) {
      navigate(targetPath);
    }
  };

  // Función para leer la página actual (Accesibilidad)
  const readCurrentPage = () => {
    const mainTitle = document.querySelector('h1')?.innerText || document.title || 'Página de Foam Wash';
    
    const contentText = Array.from(document.querySelectorAll('p, h2, h3, h4, span.service-title, div.service-desc'))
      .map(el => el.innerText)
      .filter(text => text.trim().length > 10 && text.length < 300)
      .slice(0, 4)
      .join('. ');

    const buttonTexts = Array.from(document.querySelectorAll('button, a.btn, .nav-link, .login-btn'))
      .map(el => el.innerText || el.getAttribute('aria-label') || '')
      .filter(text => text.trim().length > 1 && text.length < 40)
      .slice(0, 6)
      .join(', ');

    let summary = `Estás en la pantalla: ${mainTitle}. `;
    if (contentText) {
      summary += `El contenido dice: ${contentText}. `;
    }
    if (buttonTexts) {
      summary += `Las opciones disponibles son: ${buttonTexts}.`;
    }

    setAriaLiveMessage(summary);
    speakText(summary);
  };

  // Leer la página automáticamente al cambiar de pantalla
  useEffect(() => {
    if (isReadingPage && assistantState === 'idle') {
      const timer = setTimeout(() => {
        readCurrentPage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, isReadingPage, assistantState]);

  // Manejar entrada de texto/voz
  const handleCommandResponse = async (messageText) => {
    if (!messageText.trim()) return;

    const cleanMsg = messageText.toLowerCase().trim();

    // Detener micrófono temporalmente mientras habla para evitar ecos
    const wasListeningBefore = isListening;
    if (isListening) {
      stopListening();
    }

    // ==========================================
    // 1. COMANDOS DE CONTROL LOCAL (TOGGLES DE ESTADO)
    // ==========================================

    // Desactivar Lectura de Página
    if (
      cleanMsg.includes('suspender lectura de página') ||
      cleanMsg.includes('desactivar lectura') ||
      cleanMsg.includes('suspender lectura') ||
      cleanMsg.includes('desactivar lectura de pagina')
    ) {
      setIsReadingPage(false);
      const msg = 'Lectura de página desactivada.';
      setAriaLiveMessage(msg);
      pushAssistantMsg(msg);
      speakText(msg, () => {
        if (wasListeningBefore && !isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Activar Lectura de Página
    if (
      cleanMsg.includes('activar lectura de página') ||
      cleanMsg.includes('activar lectura de la página') ||
      cleanMsg.includes('activar lectura') ||
      cleanMsg.includes('prender lectura') ||
      cleanMsg.includes('habilitar lectura')
    ) {
      setIsReadingPage(true);
      const msg = 'Lectura de página activada.';
      setAriaLiveMessage(msg);
      pushAssistantMsg(msg);
      speakText(msg, () => {
        if (wasListeningBefore && !isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Suspender/Apagar Comandos de Voz
    if (
      cleanMsg.includes('suspender chat por voz') ||
      cleanMsg.includes('desactivar chat por voz') ||
      cleanMsg.includes('apagar chat por voz') ||
      cleanMsg.includes('suspender chat') ||
      cleanMsg.includes('desactivar comandos de voz')
    ) {
      setIsVoiceChatSuspended(true);
      const msg = 'Chat por voz suspendido. Para reactivarlo, haz clic en el botón Reanudar voz.';
      setAriaLiveMessage(msg);
      pushAssistantMsg(msg);
      speak(msg);
      return;
    }

    // Activar Comandos de Voz (Desde texto)
    if (
      cleanMsg.includes('activar comandos de voz') ||
      cleanMsg.includes('activar chat por voz') ||
      cleanMsg.includes('activar voz') ||
      cleanMsg.includes('prender voz') ||
      cleanMsg.includes('habilitar comandos de voz')
    ) {
      setIsVoiceChatSuspended(false);
      const msg = 'Comandos de voz activados.';
      setAriaLiveMessage(msg);
      pushAssistantMsg(msg);
      speak(msg, () => {
        startListening(false);
      });
      return;
    }

    // ==========================================
    // 2. COMANDOS DE AUTOMATIZACIÓN LOCAL (LOGOUT, LOGIN, VOUCHER, AGENDAMIENTO)
    // ==========================================

    // Cerrar sesión
    if (cleanMsg.includes('cierra') || cleanMsg.includes('cerrar sesión') || cleanMsg.includes('cerrar sesion') || cleanMsg.includes('salir')) {
      const isSetupPhase = assistantState === 'welcome_read_page' || assistantState === 'welcome_voice_active';
      if (!isSetupPhase) pushUserMsg(messageText);

      const logoutMsg = 'Cerrando sesión de manera segura.';
      pushAssistantMsg(logoutMsg);
      speakText(logoutMsg, () => {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) { logoutBtn.click(); } else { executeNavigation('/'); }
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Iniciar Sesión con credenciales de prueba
    if (
      cleanMsg.includes('inicia sesión') ||
      cleanMsg.includes('iniciar sesión') ||
      cleanMsg.includes('inicia sesion') ||
      cleanMsg.includes('iniciar sesion') ||
      cleanMsg.includes('inicio de sesión') ||
      cleanMsg.includes('inicio de sesion') ||
      cleanMsg.includes('login') ||
      cleanMsg.includes('ve a iniciar')
    ) {
      const isSetupPhase = assistantState === 'welcome_read_page' || assistantState === 'welcome_voice_active';
      if (!isSetupPhase) pushUserMsg(messageText);

      let email = 'cliente@gmail.com';
      let password = '123456';
      const emailMatch = cleanMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) email = emailMatch[0];
      const passMatch = cleanMsg.match(/\b\d{4,8}\b/);
      if (passMatch) password = passMatch[0];

      setStatusText('Iniciando sesión...');
      setAriaLiveMessage(`Iniciando sesión con el correo ${email}.`);
      const loginMsg = 'Redirigiendo a inicio de sesión e ingresando credenciales.';
      pushAssistantMsg(loginMsg);
      speakText(loginMsg, () => {
        executeNavigation('/login');
        setTimeout(() => {
          const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="correo" i]');
          const passInput = document.querySelector('input[type="password"]') || document.querySelector('input[placeholder*="contraseña" i]');
          const loginBtn = document.querySelector('button[type="submit"]') || document.querySelector('.login-btn');
          if (emailInput) { emailInput.value = email; emailInput.dispatchEvent(new Event('input', { bubbles: true })); }
          if (passInput) { passInput.value = password; passInput.dispatchEvent(new Event('input', { bubbles: true })); }
          setTimeout(() => { if (loginBtn) loginBtn.click(); }, 300);
        }, 800);
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Ir a mis agendamientos
    if (cleanMsg.includes('mis agendamientos') || cleanMsg.includes('mis reservas') || cleanMsg.includes('agendamientos')) {
      const isSetupPhase = assistantState === 'welcome_read_page' || assistantState === 'welcome_voice_active';
      if (!isSetupPhase) pushUserMsg(messageText);

      const navMsg = 'Abriendo tu panel de reservas y agendamientos.';
      pushAssistantMsg(navMsg);
      speakText(navMsg, () => {
        executeNavigation('/agendamiento');
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Abrir último voucher
    if (cleanMsg.includes('abre') || cleanMsg.includes('último voucher') || cleanMsg.includes('ultimo voucher') || cleanMsg.includes('selecciona')) {
      const isSetupPhase = assistantState === 'welcome_read_page' || assistantState === 'welcome_voice_active';
      if (!isSetupPhase) pushUserMsg(messageText);

      const voucherMsg = 'Buscando y abriendo tu último voucher registrado.';
      pushAssistantMsg(voucherMsg);
      speakText(voucherMsg, () => {
        const voucherEl = document.querySelector('.voucher-card') || document.querySelector('.agenda-card') || document.querySelector('button[aria-label*="Detalle" i]');
        if (voucherEl) voucherEl.click();
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Buscar o iniciar flujo de agendamiento
    if (cleanMsg.includes('busca') || cleanMsg.includes('buscar') || cleanMsg.includes('servicio sobre')) {
      const isSetupPhase = assistantState === 'welcome_read_page' || assistantState === 'welcome_voice_active';
      if (!isSetupPhase) pushUserMsg(messageText);

      let servicioBuscado = 'lavado de sofás';
      if (cleanMsg.includes('muebles')) servicioBuscado = 'lavado de muebles';
      else if (cleanMsg.includes('colchones')) servicioBuscado = 'lavado de colchones';

      setBookingData(prev => ({ ...prev, servicio: servicioBuscado }));
      setAssistantState('service_found_waiting');

      const foundMsg = `Encontré el servicio de ${servicioBuscado}. ¿Quieres cotizar o agendar?`;
      setAriaLiveMessage(foundMsg);
      pushAssistantMsg(foundMsg);
      speakText(foundMsg, () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // ==========================================
    // 3. MÁQUINA DE ESTADOS: CONFIGURACIÓN INICIAL (SÍ / NO)
    // ==========================================

    // 1. Confirmar lectura de página
    if (assistantState === 'welcome_read_page') {
      const isAffirmative = ['sí', 'si', 'aceptar', 'activar', 'proceder', 'ok', 'afirmativo'].some(w => cleanMsg.includes(w));
      const isNegative = ['no', 'desactivar', 'cancelar', 'apagar', 'negativo'].some(w => cleanMsg.includes(w));

      if (isAffirmative) {
        setIsReadingPage(true);
        setAssistantState('welcome_voice_active');
        const askVoiceMsg = 'Lectura de página activada. ¿Quieres mantener los comandos de voz activos?';
        pushAssistantMsg(askVoiceMsg);
        speakText(askVoiceMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else if (isNegative) {
        setIsReadingPage(false);
        setAssistantState('welcome_voice_active');
        const askVoiceMsg = 'Lectura de página desactivada. ¿Quieres mantener los comandos de voz activos?';
        pushAssistantMsg(askVoiceMsg);
        speakText(askVoiceMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else {
        const repeatMsg = 'No logré entender tu respuesta. ¿Quieres activar la lectura de la página? Di sí o no.';
        speakText(repeatMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      }
      return;
    }

    // 2. Confirmar comandos de voz activos
    if (assistantState === 'welcome_voice_active') {
      const isAffirmative = ['sí', 'si', 'aceptar', 'activar', 'proceder', 'ok', 'afirmativo'].some(w => cleanMsg.includes(w));
      const isNegative = ['no', 'desactivar', 'cancelar', 'apagar', 'negativo'].some(w => cleanMsg.includes(w));

      if (isAffirmative) {
        setIsVoiceChatSuspended(false);
        setAssistantState('idle');
        const activeMsg = 'Comandos de voz activos. ¿Cuál es tu petición?';
        pushAssistantMsg(activeMsg);
        speakText(activeMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else if (isNegative) {
        setIsVoiceChatSuspended(true);
        setAssistantState('idle');
        const inactiveMsg = 'Entendido. Comandos de voz desactivados. Puedes reactivarlos en el panel.';
        pushAssistantMsg(inactiveMsg);
        speak(inactiveMsg);
      } else {
        const repeatMsg = 'No logré entender tu respuesta. ¿Quieres mantener los comandos de voz activos? Di sí o no.';
        speakText(repeatMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      }
      return;
    }

    // ==========================================
    // 4. MÁQUINA DE ESTADOS: PROCESAMIENTO DE RESERVA / AGENDAMIENTO
    // ==========================================

    // Agendar servicio
    if (assistantState === 'service_found_waiting' && (cleanMsg.includes('agendar') || cleanMsg.includes('agendarlo'))) {
      pushUserMsg(messageText);
      setAssistantState('booking_waiting_direction');
      const askDirMsg = `Para agendar tu ${bookingData.servicio}, dime tu dirección de entrega.`;
      setAriaLiveMessage(askDirMsg);
      pushAssistantMsg(askDirMsg);
      speakText(askDirMsg, () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Guardar dirección
    if (assistantState === 'booking_waiting_direction') {
      pushUserMsg(messageText);
      setBookingData(prev => ({ ...prev, direccion: messageText }));
      setAssistantState('booking_waiting_datetime');
      const askDateMsg = 'Dirección guardada. Ahora, dime la fecha y hora deseada. Por ejemplo: 29 de agosto a las 3 de la tarde.';
      setAriaLiveMessage(askDateMsg);
      pushAssistantMsg(askDateMsg);
      speakText(askDateMsg, () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Guardar fecha y hora (100% dinámico)
    if (assistantState === 'booking_waiting_datetime') {
      pushUserMsg(messageText);
      const dateText = messageText;
      setBookingData(prev => ({ ...prev, fecha: dateText, hora: '' }));
      setAssistantState('booking_confirm_review');
      const reviewMsg = `Revisemos: Servicio ${bookingData.servicio}, dirección ${bookingData.direccion}, para el día ${dateText}. ¿Son correctos los datos?`;
      setAriaLiveMessage(reviewMsg);
      pushAssistantMsg(reviewMsg);
      speakText(reviewMsg, () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Confirmación de revisión
    if (assistantState === 'booking_confirm_review') {
      pushUserMsg(messageText);
      const isAffirmative = ['sí', 'si', 'correcto', 'están bien'].some(w => cleanMsg.includes(w));
      const isNegative = ['no', 'modificar', 'cambiar'].some(w => cleanMsg.includes(w));

      if (isAffirmative) {
        setAssistantState('booking_confirm_final');
        const askFinalMsg = '¿Deseas confirmar la reserva definitivamente?';
        setAriaLiveMessage(askFinalMsg);
        pushAssistantMsg(askFinalMsg);
        speakText(askFinalMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else if (isNegative) {
        setAssistantState('booking_modifying');
        const askModMsg = '¿Qué deseas modificar? ¿La dirección o el horario?';
        setAriaLiveMessage(askModMsg);
        pushAssistantMsg(askModMsg);
        speakText(askModMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      }
      return;
    }

    // Modificando campo
    if (assistantState === 'booking_modifying') {
      pushUserMsg(messageText);
      if (cleanMsg.includes('dirección') || cleanMsg.includes('direccion')) {
        setModifyingField('direccion');
        setAssistantState('booking_waiting_modification');
        const msg = 'Por favor dime la nueva dirección.';
        pushAssistantMsg(msg);
        speakText(msg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else {
        setModifyingField('datetime');
        setAssistantState('booking_waiting_modification');
        const msg = 'Por favor dime la nueva fecha y hora.';
        pushAssistantMsg(msg);
        speakText(msg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      }
      return;
    }

    // Guardar modificación
    if (assistantState === 'booking_waiting_modification') {
      pushUserMsg(messageText);
      const val = messageText;
      let newDir = bookingData.direccion;
      let newFecha = bookingData.fecha;
      if (modifyingField === 'direccion') {
        newDir = val;
        setBookingData(prev => ({ ...prev, direccion: val }));
      } else {
        newFecha = val;
        setBookingData(prev => ({ ...prev, fecha: val }));
      }
      setAssistantState('booking_confirm_review');
      const reviewMsg = `Dato modificado. Revisemos: Servicio ${bookingData.servicio}, dirección ${newDir}, para el día ${newFecha}. ¿Están bien los datos?`;
      setAriaLiveMessage(reviewMsg);
      pushAssistantMsg(reviewMsg);
      speakText(reviewMsg, () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Confirmar definitivo
    if (assistantState === 'booking_confirm_final') {
      pushUserMsg(messageText);
      const isAffirmative = ['sí', 'si', 'confirmar', 'proceder'].some(w => cleanMsg.includes(w));
      if (isAffirmative) {
        setAssistantState('idle');
        const successMsg = `Servicio confirmado con éxito. Tu reserva para ${bookingData.servicio} en la dirección ${bookingData.direccion} quedó registrada para el día ${bookingData.fecha}. El valor total de la orden es de 90.000 pesos colombianos.`;
        setAriaLiveMessage(successMsg);
        pushAssistantMsg(successMsg);
        speakText(successMsg, () => {
          executeNavigation('/agendamiento');
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else {
        setAssistantState('idle');
        const cancelMsg = 'Reserva cancelada. Volviendo al estado de espera.';
        pushAssistantMsg(cancelMsg);
        speakText(cancelMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      }
      return;
    }

    // ==========================================
    // 5. LLAMADA DE CONSULTA GENERAL AL BACKEND (LLM)
    // ==========================================
    pushUserMsg(messageText);
    setIsProcessing(true);
    setStatusText('Procesando...');
    setAriaLiveMessage('Procesando tu solicitud.');

    try {
      const response = await api.post('/assistant/command', { message: messageText });
      const { action, targetPath, spokenMessage, screenSummary } = response.data;

      setIsProcessing(false);
      setStatusText('Listo');

      const fullMessage = isReadingPage && screenSummary ? `${spokenMessage}. ${screenSummary}` : spokenMessage;
      setAriaLiveMessage(fullMessage);
      pushAssistantMsg(fullMessage);

      speakText(fullMessage, () => {
        if (action === 'NAVIGATE' && targetPath) {
          executeNavigation(targetPath);
        }
        if (!isVoiceChatSuspended) startListening(false);
      });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setStatusText('Error');
      const errorMsg = 'Tanto el proveedor principal como el respaldo (Groq) fallaron al procesar la respuesta.';
      setAriaLiveMessage(errorMsg);
      pushAssistantMsg(errorMsg, true);
      speakText('Hubo un error de conexión con el servidor.', () => {
        if (!isVoiceChatSuspended) startListening(false);
      });
    }
  };

  // Bienvenida inicial disparada por primer gesto del usuario
  useEffect(() => {
    const triggerWelcome = () => {
      if (welcomeGreetedRef.current) return;
      welcomeGreetedRef.current = true;
      const welcomeText = 'Estás en Foam Wash, una plataforma para agendar lavados de mobiliario en Bogotá y alrededores. ¿Quieres activar la lectura de la página?';
      speak(welcomeText, () => {
        if (!isVoiceChatSuspended) {
          startListening(false);
        }
      });
    };

    triggerWelcome();

    window.addEventListener('click', triggerWelcome);
    window.addEventListener('keydown', triggerWelcome);
    return () => {
      window.removeEventListener('click', triggerWelcome);
      window.removeEventListener('keydown', triggerWelcome);
    };
  }, [speak, isVoiceChatSuspended, startListening]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleCommandResponse(inputValue);
    setInputValue('');
  };

  const handleReactivateVoice = (e) => {
    e.stopPropagation();
    setIsVoiceChatSuspended(false);
    speak('Reactivando chat por voz.', () => {
      startListening(false);
    });
  };

  return (
    <div className="voice-assistant-container">
      {/* Lector de pantalla */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {ariaLiveMessage}
      </div>

      {isOpen && (
        <div className="voice-assistant-panel" role="dialog" aria-label="Asistente de Voz">
          {/* Header */}
          <div className="voice-assistant-header">
            <div className="voice-assistant-header-left">
              <div className="voice-assistant-avatar">🤖</div>
              <div className="voice-assistant-header-info">
                <span className="voice-assistant-title">Asistente FoamWash</span>
                <span className="voice-assistant-subtitle">Especialista de Hogar</span>
              </div>
            </div>
            <div className="voice-assistant-header-right">
              <span className={`voice-assistant-status ${isListening ? 'listening' : isProcessing ? 'processing' : ''}`}>
                {isListening ? '🎙' : isProcessing ? '⏳' : '●'}
              </span>
              <button className="voice-assistant-header-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {/* Estado badges */}
          <div className="voice-assistant-indicators">
            <span className="voice-assistant-badge">Lectura: {isReadingPage ? '✅' : '❌'}</span>
            <span className="voice-assistant-badge">Voz: {isVoiceChatSuspended ? '🔇' : '🔊'}</span>
            <span className="voice-assistant-badge">{isListening ? 'Escuchando' : 'En línea'}</span>
          </div>

          {/* Historial de chat */}
          <div className="voice-assistant-chat-history">
            {chatHistory.length === 0 && (
              <div className="voice-assistant-bubble assistant">
                Hola, soy el asistente de FoamWash. Puedes hablarme o escribirme lo que necesitas.
              </div>
            )}
            {chatHistory.map((msg, i) =>
              msg.role === 'user' ? (
                <div key={i} className="voice-assistant-bubble user">{msg.text}</div>
              ) : msg.error ? (
                <div key={i} className="voice-assistant-bubble error">
                  <span className="voice-assistant-error-icon">⚠</span>
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div key={i} className="voice-assistant-bubble assistant">{msg.text}</div>
              )
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Interim transcript en vivo */}
          {transcript && isListening && (
            <div className="voice-assistant-transcript">
              🎤 {transcript}
            </div>
          )}

          {/* Input text */}
          <form onSubmit={handleTextSubmit} className="voice-assistant-input-group">
            <input
              type="text"
              className="voice-assistant-input"
              placeholder="Escribe tu consulta aquí..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="voice-assistant-send-btn">➤</button>
          </form>

          {/* Controles */}
          <div className="voice-assistant-control-row">
            <button
              type="button"
              className={`voice-assistant-action-btn ${isListening ? 'active-mic' : ''}`}
              onClick={toggleListening}
              disabled={isVoiceChatSuspended || isProcessing}
            >
              {isListening ? '🎙️ Detener mic' : '🎤 Hablar'}
            </button>
            {isVoiceChatSuspended && (
              <button
                type="button"
                className="voice-assistant-action-btn"
                onClick={handleReactivateVoice}
                style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              >
                🔊 Reactivar Voz
              </button>
            )}
          </div>

          <div className="voice-assistant-shortcut">
            Alt + V para activar el micrófono en cualquier pantalla.
          </div>
        </div>
      )}

      {/* Trigger floating button */}
      <button
        className={`voice-assistant-trigger ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="pulse-ring"></span>
        {isListening ? '🎙️' : isProcessing ? '⏳' : '💬'}
      </button>

      {/* Reactivate Floating Button */}
      {isVoiceChatSuspended && (
        <button className="voice-assistant-reactivate-btn" onClick={handleReactivateVoice}>
          🎙️ Reanudar voz
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;
