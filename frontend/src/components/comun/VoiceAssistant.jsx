import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useAuth } from '../autenticacion/AuthContext';
import { useCarrito } from '../modales/CarritoContext';
import api from '../../services/api';
import './VoiceAssistant.css';

/**
 * Componente visual y accesible del Asistente de Voz de FoamWash.
 */
const VoiceAssistant = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [statusText, setStatusText] = useState('Asistente activo');
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviciosList, setServiciosList] = useState([]);

  // Historial del chat en burbujas
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Auth & Carrito Context
  const { isAuthenticated } = useAuth();
  const { carrito, agregarAlCarrito } = useCarrito();

  // Comandos de voz siempre activos por defecto
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
      hora: '3:00 PM',
      servicioObj: null
    };
  });

  // Estados del Flujo (Empieza en 'idle' directamente)
  const [assistantState, setAssistantState] = useState('idle');
  const welcomeGreetedRef = useRef(false);
  const [modifyingField, setModifyingField] = useState('');

  // Estados para Llenado de Formularios Dinámico (Accesibilidad)
  const [formInputs, setFormInputs] = useState([]);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [formFillingState, setFormFillingState] = useState('idle'); // 'idle' | 'ask_field' | 'confirm_field' | 'submit_confirm'
  const [tempValue, setTempValue] = useState('');

  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fuera de enrutador
  }

  // Cargar lista de servicios desde la base de datos
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await api.get('/cotizaciones/servicios');
        if (res.data.success) {
          setServiciosList(res.data.data);
        }
      } catch (err) {
        console.error('Error al cargar servicios en VoiceAssistant:', err);
      }
    };
    fetchServicios();
  }, []);

  // Hook de Voz Reutilizable
  const { isListening, transcript, speak, startListening, stopListening, toggleListening } = useVoiceAssistant(
    (detectedText) => {
      handleCommandResponse(detectedText);
    },
    isVoiceChatSuspended
  );

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
        if (isAuthenticated) {
          onNavigate('cotizacion-cliente');
        } else {
          onNavigate('cotizacion-publica');
        }
      } else {
        onNavigate(cleanPath);
      }
    }
    if (navigate) {
      navigate(targetPath);
    }
  };

  const getVisibleInputs = () => {
    return Array.from(document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"]), select, textarea'))
      .filter(el => {
        if (el.classList.contains('voice-assistant-input') || el.closest('.voice-assistant-panel') || el.closest('.voice-assistant-container')) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && !el.disabled && !el.readOnly;
      });
  };

  const getLabelOrPlaceholder = (el) => {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    if (el.getAttribute('placeholder')) return el.getAttribute('placeholder');
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label && label.innerText) return label.innerText.replace(':', '').trim();
    }
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.innerText) {
      return parentLabel.innerText.replace(':', '').trim();
    }
    return el.name || el.type || 'campo';
  };

  const normalizeEmailValue = (val) => {
    let clean = val.toLowerCase().trim();
    clean = clean.replace(/\barroba\b/g, '@');
    clean = clean.replace(/\s*arroba\s*/g, '@');
    clean = clean.replace(/\s*punto\s*/g, '.');
    clean = clean.replace(/\bpunto\b/g, '.');
    clean = clean.replace(/\s+/g, '');
    return clean;
  };

  const askField = (index, inputsList = formInputs) => {
    const el = inputsList[index];
    if (!el) return;
    const fieldName = getLabelOrPlaceholder(el);
    const msg = `¿Qué valor deseas ingresar en el campo ${fieldName}?`;
    pushAssistantMsg(msg);
    speakText(msg, () => {
      startListening(false);
    });
  };

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
    // 0. MÁQUINA DE ESTADOS DE FORMULARIO DINÁMICO (Prioritaria)
    // ==========================================
    if (formFillingState === 'ask_field') {
      pushUserMsg(messageText);
      const el = formInputs[currentInputIndex];
      const fieldName = getLabelOrPlaceholder(el);
      const isEmail = el.type === 'email' || fieldName.toLowerCase().includes('correo') || fieldName.toLowerCase().includes('email');
      
      let processedVal = messageText;
      if (isEmail) {
        processedVal = normalizeEmailValue(messageText);
      }

      setTempValue(processedVal);
      setFormFillingState('confirm_field');
      const msg = `El valor que quieres ingresar en ${fieldName} es: ${processedVal}. ¿Es correcto?`;
      pushAssistantMsg(msg);
      speakText(msg, () => {
        startListening(false);
      });
      return;
    }

    if (formFillingState === 'confirm_field') {
      pushUserMsg(messageText);
      const isAffirmative = ['sí', 'si', 'correcto', 'está bien', 'aceptar', 'afirmativo'].some(w => cleanMsg.includes(w));
      const isNegative = ['no', 'incorrecto', 'negativo', 'cancelar'].some(w => cleanMsg.includes(w));

      if (isAffirmative) {
        const el = formInputs[currentInputIndex];
        let val = tempValue;
        if (el.type === 'password' || el.type === 'number' || el.type === 'tel') {
          val = tempValue.replace(/\s+/g, '');
        }
        
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        const nextIndex = currentInputIndex + 1;
        setCurrentInputIndex(nextIndex);
        if (nextIndex < formInputs.length) {
          setFormFillingState('ask_field');
          askField(nextIndex);
        } else {
          setFormFillingState('submit_confirm');
          const msg = 'Formulario completado. ¿Deseas enviar o guardar el formulario?';
          pushAssistantMsg(msg);
          speakText(msg, () => {
            startListening(false);
          });
        }
      } else if (isNegative) {
        const correctionMatch = cleanMsg.match(/(?:no era|no es|era|es|cambia a)\s+(.+)/i);
        if (correctionMatch && correctionMatch[1]) {
          let correctedVal = correctionMatch[1].trim();
          const el = formInputs[currentInputIndex];
          const fieldName = getLabelOrPlaceholder(el);
          const isEmail = el.type === 'email' || fieldName.toLowerCase().includes('correo') || fieldName.toLowerCase().includes('email');
          if (isEmail) {
            correctedVal = normalizeEmailValue(correctedVal);
          }
          setTempValue(correctedVal);
          const msg = `Corregido. El nuevo valor para ${fieldName} es: ${correctedVal}. ¿Es correcto?`;
          pushAssistantMsg(msg);
          speakText(msg, () => {
            startListening(false);
          });
        } else {
          setFormFillingState('ask_field');
          askField(currentInputIndex);
        }
      } else {
        const isCorrection = cleanMsg.includes('correo') || cleanMsg.includes('@') || cleanMsg.match(/\d+/) || cleanMsg.length > 5;
        if (isCorrection) {
          let processedVal = messageText;
          const el = formInputs[currentInputIndex];
          const fieldName = getLabelOrPlaceholder(el);
          const isEmail = el.type === 'email' || fieldName.toLowerCase().includes('correo') || fieldName.toLowerCase().includes('email');
          if (isEmail) {
            processedVal = normalizeEmailValue(messageText);
          }
          setTempValue(processedVal);
          const msg = `Entendido. El nuevo valor para ${fieldName} es: ${processedVal}. ¿Es correcto?`;
          pushAssistantMsg(msg);
          speakText(msg, () => {
            startListening(false);
          });
        } else {
          const msg = 'No logré entender. Por favor responde sí o no, o dime el nuevo valor empezando con "cambiar a".';
          pushAssistantMsg(msg);
          speakText(msg, () => {
            startListening(false);
          });
        }
      }
      return;
    }

    if (formFillingState === 'submit_confirm') {
      pushUserMsg(messageText);
      const isAffirmative = ['sí', 'si', 'enviar', 'guardar', 'confirmar', 'proceder', 'formulario'].some(w => cleanMsg.includes(w));
      const isNegative = ['no', 'cancelar', 'incorrecto', 'negativo'].some(w => cleanMsg.includes(w));

      if (isAffirmative) {
        const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('.submit-btn') || document.querySelector('.login-btn') || document.querySelector('.fwm-btn-success');
        if (submitBtn) {
          submitBtn.click();
          const msg = 'Formulario enviado.';
          pushAssistantMsg(msg);
          speakText(msg);
        } else {
          const msg = 'No se encontró un botón de envío.';
          pushAssistantMsg(msg);
          speakText(msg);
        }
        setFormFillingState('idle');
      } else if (isNegative) {
        const msg = 'Envío cancelado.';
        pushAssistantMsg(msg);
        speakText(msg);
        setFormFillingState('idle');
      } else {
        const msg = 'No logré entender. ¿Deseas enviar o guardar el formulario? Di sí o no.';
        pushAssistantMsg(msg);
        speakText(msg, () => {
          startListening(false);
        });
      }
      return;
    }

    // ==========================================
    // 1. COMANDOS DE CONTROL LOCAL (TOGGLES DE ESTADO)
    // ==========================================

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

    // Iniciar llenado de formulario manualmente
    if (cleanMsg.includes('completar formulario') || cleanMsg.includes('llenar formulario') || cleanMsg.includes('iniciar llenado')) {
      const inputs = getVisibleInputs();
      if (inputs.length === 0) {
        const msg = 'No se encontraron campos editables en esta página.';
        pushAssistantMsg(msg);
        speakText(msg, () => {
          if (wasListeningBefore && !isVoiceChatSuspended) startListening(false);
        });
        return;
      }
      setFormInputs(inputs);
      setCurrentInputIndex(0);
      setFormFillingState('ask_field');
      askField(0, inputs);
      return;
    }

    // ==========================================
    // 2. COMANDOS DE AUTOMATIZACIÓN LOCAL (LOGOUT, LOGIN, VOUCHER, AGENDAMIENTO)
    // ==========================================

    // Cerrar sesión
    if (cleanMsg.includes('cierra') || cleanMsg.includes('cerrar sesión') || cleanMsg.includes('cerrar sesion') || cleanMsg.includes('salir')) {
      pushUserMsg(messageText);
      const logoutMsg = 'Cerrando sesión de manera segura.';
      pushAssistantMsg(logoutMsg);
      speakText(logoutMsg, () => {
        const logoutBtn = document.querySelector('.logout-btn') || document.querySelector('button[onClick*="handleLogout" i]');
        if (logoutBtn) { logoutBtn.click(); } else { executeNavigation('/'); }
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Iniciar Sesión con credenciales o guiado
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
      pushUserMsg(messageText);
      const loginMsg = 'Redirigiendo a inicio de sesión.';
      pushAssistantMsg(loginMsg);

      // DETENER EL MICRÓFONO PARA EVITAR COLA DE AUDIO EN LA TRANSICIÓN
      stopListening();

      speakText(loginMsg, () => {
        executeNavigation('/login');
        setTimeout(() => {
          const inputs = getVisibleInputs();
          if (inputs.length > 0) {
            setFormInputs(inputs);
            setCurrentInputIndex(0);
            setFormFillingState('ask_field');
            askField(0, inputs);
          } else {
            if (!isVoiceChatSuspended) startListening(false);
          }
        }, 1500);
      });
      return;
    }

    // Ir a mis agendamientos
    if (cleanMsg.includes('mis agendamientos') || cleanMsg.includes('mis reservas') || cleanMsg.includes('agendamientos')) {
      pushUserMsg(messageText);
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
      pushUserMsg(messageText);
      const voucherMsg = 'Buscando y abriendo tu último voucher registrado.';
      pushAssistantMsg(voucherMsg);
      speakText(voucherMsg, () => {
        const voucherEl = document.querySelector('.voucher-card') || document.querySelector('.agenda-card') || document.querySelector('button[aria-label*="Detalle" i]');
        if (voucherEl) voucherEl.click();
        if (!isVoiceChatSuspended) startListening(false);
      });
      return;
    }

    // Finalizar agendamiento / Ir a programar
    if (
      cleanMsg.includes('finalizar agendamiento') ||
      cleanMsg.includes('finalizar') ||
      cleanMsg.includes('programar') ||
      cleanMsg.includes('ir a programar') ||
      cleanMsg.includes('finalizar el agendamiento') ||
      cleanMsg.includes('damiento')
    ) {
      pushUserMsg(messageText);
      const msg = 'Entendido. Vamos a finalizar el agendamiento redirigiendo a la pantalla de programación.';
      pushAssistantMsg(msg);

      stopListening();

      speakText(msg, () => {
        const targetPage = isAuthenticated ? '/cotizacion-cliente' : '/cotizacion-publica';
        executeNavigation(targetPage);
        
        // Esperar la carga de la página, luego abrir el modal del carrito
        setTimeout(() => {
          const cartBtn = document.querySelector('.btn-carrito-flotante');
          if (cartBtn) {
            cartBtn.click();
            setAssistantState('cart_modal_open');
            setTimeout(() => {
              const openMsg = 'He abierto tu carrito de servicios. Para continuar con tu compra, di "ver cotización" o "continuar".';
              pushAssistantMsg(openMsg);
              speakText(openMsg, () => {
                if (!isVoiceChatSuspended) startListening(false);
              });
            }, 600);
          } else {
            if (!isVoiceChatSuspended) startListening(false);
          }
        }, 1500);
      });
      return;
    }

    // Buscar o iniciar flujo de agendamiento (Búsqueda super flexible)
    const mentionsService = cleanMsg.includes('alfombra') || cleanMsg.includes('colchón') || cleanMsg.includes('colchon') ||
                            cleanMsg.includes('mueble') || cleanMsg.includes('sofá') || cleanMsg.includes('sofa') ||
                            cleanMsg.includes('silla') || cleanMsg.includes('cortina') || cleanMsg.includes('tapete');

    if (mentionsService && (cleanMsg.includes('busca') || cleanMsg.includes('buscar') || cleanMsg.includes('servicio') ||
                            cleanMsg.includes('necesito') || cleanMsg.includes('lave') || cleanMsg.includes('limpie') ||
                            cleanMsg.includes('quiero') || cleanMsg.includes('agenda') || assistantState === 'idle')) {
      
      let matchedService = null;
      
      if (cleanMsg.includes('mueble') || cleanMsg.includes('sofá') || cleanMsg.includes('sofa') || cleanMsg.includes('silla')) {
        matchedService = serviciosList.find(s => {
          const name = (s.Nombre_Servicio || s.nombre || '').toLowerCase();
          return name.includes('mueble') || name.includes('sofá') || name.includes('sofa') || name.includes('silla');
        });
      } else if (cleanMsg.includes('colchón') || cleanMsg.includes('colchon') || cleanMsg.includes('colchones')) {
        matchedService = serviciosList.find(s => {
          const name = (s.Nombre_Servicio || s.nombre || '').toLowerCase();
          return name.includes('colchón') || name.includes('colchon') || name.includes('colchones');
        });
      } else if (cleanMsg.includes('alfombra') || cleanMsg.includes('alfombras') || cleanMsg.includes('tapete') || cleanMsg.includes('tapetes')) {
        matchedService = serviciosList.find(s => {
          const name = (s.Nombre_Servicio || s.nombre || '').toLowerCase();
          return name.includes('alfombra') || name.includes('alfombras') || name.includes('tapete') || name.includes('tapetes');
        });
      } else if (cleanMsg.includes('cortina') || cleanMsg.includes('cortinas')) {
        matchedService = serviciosList.find(s => {
          const name = (s.Nombre_Servicio || s.nombre || '').toLowerCase();
          return name.includes('cortina') || name.includes('cortinas');
        });
      }

      if (matchedService) {
        pushUserMsg(messageText);
        
        const mappedService = {
          ...matchedService,
          id: matchedService.Id_Servicio || matchedService.id,
          nombre: matchedService.Nombre_Servicio || matchedService.nombre || 'Sin nombre',
          descripcion: matchedService.Descripcion || matchedService.descripcion || '',
          precio: Number(matchedService.Precio || matchedService.precio || 0),
          tamanos: ['Estándar']
        };

        setBookingData(prev => ({ ...prev, servicio: mappedService.nombre, servicioObj: mappedService }));
        setAssistantState('service_found_waiting');

        const foundMsg = `Encontré el servicio de ${mappedService.nombre}. ¿Qué deseas hacer? Puedes decir "agéndamelo al carrito" o "finalizar agendamiento".`;
        setAriaLiveMessage(foundMsg);
        pushAssistantMsg(foundMsg);
        speakText(foundMsg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
        return;
      }
    }

    // ==========================================
    // 3. PASOS DE NAVEGACIÓN Y CONFIGURACIÓN DEL CARRITO / CONFIRMACIÓN
    // ==========================================
    if (assistantState === 'cart_modal_open') {
      if (cleanMsg.includes('ver cotización') || cleanMsg.includes('ver cotizacion') || cleanMsg.includes('continuar') ||
          cleanMsg.includes('generar cotización') || cleanMsg.includes('generar cotizacion') || cleanMsg.includes('agendar')) {
        pushUserMsg(messageText);
        const primaryBtn = document.querySelector('.fwm-footer .fwm-btn-primary');
        if (primaryBtn) {
          primaryBtn.click();
          setAssistantState('stage0_details_open');
          setTimeout(() => {
            const nextMsg = 'Detalles de servicio abiertos. Por favor, di "generar cotización" para avanzar a la visualización de costos.';
            pushAssistantMsg(nextMsg);
            speakText(nextMsg, () => {
              if (!isVoiceChatSuspended) startListening(false);
            });
          }, 600);
        } else {
          if (!isVoiceChatSuspended) startListening(false);
        }
        return;
      }
    }

    if (assistantState === 'stage0_details_open') {
      if (cleanMsg.includes('generar cotización') || cleanMsg.includes('generar cotizacion') || cleanMsg.includes('continuar') || cleanMsg.includes('aceptar')) {
        pushUserMsg(messageText);
        const primaryBtn = document.querySelector('.fwm-footer .fwm-btn-primary');
        if (primaryBtn) {
          primaryBtn.click();
          setAssistantState('stage1_quote_ready');
          setTimeout(() => {
            const nextMsg = 'Cotización generada con éxito. Di "agendar servicio" o "continuar" para pasar al ingreso de datos.';
            pushAssistantMsg(nextMsg);
            speakText(nextMsg, () => {
              if (!isVoiceChatSuspended) startListening(false);
            });
          }, 800);
        } else {
          if (!isVoiceChatSuspended) startListening(false);
        }
        return;
      }
    }

    if (assistantState === 'stage1_quote_ready') {
      if (cleanMsg.includes('agendar servicio') || cleanMsg.includes('agendar') || cleanMsg.includes('continuar') ||
          cleanMsg.includes('aceptar') || cleanMsg.includes('sí') || cleanMsg.includes('si')) {
        pushUserMsg(messageText);
        const primaryBtn = document.querySelector('.fwm-footer .fwm-btn-primary');
        if (primaryBtn) {
          primaryBtn.click();
          setAssistantState('stage2_form_open');
          setTimeout(() => {
            const inputs = getVisibleInputs();
            if (inputs.length > 0) {
              setFormInputs(inputs);
              setCurrentInputIndex(0);
              setFormFillingState('ask_field');
              askField(0, inputs);
            } else {
              if (!isVoiceChatSuspended) startListening(false);
            }
          }, 800);
        } else {
          if (!isVoiceChatSuspended) startListening(false);
        }
        return;
      }
    }

    // ==========================================
    // 4. MÁQUINA DE ESTADOS: PROCESAMIENTO DE RESERVA / AGENDAMIENTO (Agregar al carrito real)
    // ==========================================

    // Agendar servicio (Agregar al carrito)
    if (assistantState === 'service_found_waiting' && (cleanMsg.includes('carrito') || cleanMsg.includes('agendar') || cleanMsg.includes('agendarlo') || cleanMsg.includes('dámelo') || cleanMsg.includes('damelo'))) {
      pushUserMsg(messageText);
      if (bookingData.servicioObj) {
        agregarAlCarrito(bookingData.servicioObj);
        const msg = `${bookingData.servicio} ha sido agregado al carrito con éxito. ¿Deseas buscar otro servicio o deseas finalizar el agendamiento?`;
        pushAssistantMsg(msg);
        speakText(msg, () => {
          if (!isVoiceChatSuspended) startListening(false);
        });
      } else {
        const msg = 'No se encontró el objeto de servicio para agregar al carrito.';
        pushAssistantMsg(msg);
        speakText(msg, () => {
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
      const { action, targetPath, spokenMessage } = response.data;

      setIsProcessing(false);
      setStatusText('Listo');

      const fullMessage = spokenMessage;
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
      const welcomeText = 'Hola, soy el asistente de Foam Wash. ¿Cuál es tu petición?';
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
              {isListening ? '🎙' : '🎤 Hablar'}
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
        {isListening ? '🎙' : isProcessing ? '⏳' : '💬'}
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
