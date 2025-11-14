// =============================================================================
// REGISTERVIEW.JSX - FORMULARIO DE REGISTRO DE NUEVOS USUARIOS
// =============================================================================
// Este componente maneja el registro de nuevos usuarios.
// Los nuevos usuarios siempre se registran con el rol "cliente".
// =============================================================================

import React, { useState } from 'react';
import { registerUser, registrarSesionActiva } from '../utils/AuthUtils';

/**
 * COMPONENTE: RegisterView
 * 
 * PROPS:
 * - onRedirect: función que se ejecuta después del registro exitoso
 * 
 * CONCEPTO CLAVE:
 * Este componente es similar a LoginView, pero maneja más campos de entrada.
 * Aprenderás a manejar formularios con múltiples inputs de manera eficiente.
 */
const RegisterView = ({ onRedirect }) => {
    // -------------------------------------------------------------------------
    // 1. ESTADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    
    // Estado para los campos del formulario
    // NOTA: Podrías usar un solo objeto para todos los campos, pero por claridad
    // usamos variables separadas como en el LoginView
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    
    // Estado para mensajes de error/éxito
    const [message, setMessage] = useState({ 
        text: '', 
        isError: false, 
        isLoading: false 
    });

    // -------------------------------------------------------------------------
    // 2. FUNCIÓN MANEJADORA DEL FORMULARIO
    // -------------------------------------------------------------------------
    
    /**
     * Se ejecuta cuando el usuario envía el formulario de registro
     * @param {Event} e - Evento del formulario
     */
    const handleRegister = (e) => {
        e.preventDefault(); // Evitar recarga de la página
        
        // Limpiar mensaje anterior y mostrar estado de carga
        setMessage({ text: '', isError: false, isLoading: true });

        // =====================================================================
        // VALIDACIONES DEL LADO DEL CLIENTE (ANTES DE ENVIAR)
        // =====================================================================
        // En una app real, SIEMPRE debes validar también en el servidor.
        // Las validaciones del cliente son para mejor UX, pero no son seguras.
        
        // VALIDACIÓN 1: Verificar que el teléfono tenga 10 dígitos
        if (phone && phone.length !== 10) {
            setMessage({ 
                text: 'El teléfono debe tener exactamente 10 dígitos.', 
                isError: true, 
                isLoading: false 
            });
            return; // Detener la ejecución aquí
        }
        
        // VALIDACIÓN 2: Verificar que el teléfono solo contenga números
        if (phone && !/^\d+$/.test(phone)) {
            setMessage({ 
                text: 'El teléfono solo puede contener números.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }

        // =====================================================================
        // PROCESO DE REGISTRO
        // =====================================================================
        
        // Simular un delay de red (como si estuviéramos esperando respuesta del servidor)
        setTimeout(() => {
            // PASO 1: Llamar a la función de registro
            const result = registerUser(email, password, {
                fullName: fullName,
                phone: phone,
                address: address
            });

            // PASO 2: Verificar el resultado
            if (result.success) {
                // ✅ REGISTRO EXITOSO
                
                setMessage({ 
                    text: result.message, 
                    isError: false, 
                    isLoading: false 
                });

                // PASO 3: Registrar la sesión en localStorage
                // El usuario queda automáticamente logueado después del registro
                registrarSesionActiva(
                    result.email,
                    result.role,
                    result.token,
                    result.redirect
                );
                
                // PASO 4: Redirigir después de 1.5 segundos
                setTimeout(() => {
                    if (onRedirect) {
                        onRedirect(result.redirect);
                    }
                }, 1500);

            } else {
                // ❌ REGISTRO FALLIDO
                setMessage({ 
                    text: result.message, 
                    isError: true, 
                    isLoading: false 
                });
            }
        }, 1500); // Simulamos 1.5 segundos de "procesamiento"
    };

    // -------------------------------------------------------------------------
    // 3. RENDERIZADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    
    return (
        <div className="form-content register-view">
            <h2 className="title">Regístrate</h2>
            
            {/* MENSAJES DE ESTADO */}
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Procesando...' : message.text}
                </div>
            )}

            {/* 
                FORMULARIO DE REGISTRO
                
                CONCEPTO - MÚLTIPLES INPUTS CONTROLADOS:
                Cada input tiene su propio:
                - value={estado}
                - onChange={(e) => setEstado(e.target.value)}
                
                PATRÓN COMÚN:
                Para formularios grandes, puedes usar un solo objeto de estado:
                
                const [formData, setFormData] = useState({
                    email: '',
                    fullName: '',
                    phone: '',
                    ...
                });
                
                Y actualizar con:
                onChange={(e) => setFormData({
                    ...formData,
                    [e.target.name]: e.target.value
                })}
                
                Pero para aprender, es más claro usar estados separados.
            */}
            <form className="form" onSubmit={handleRegister}>
                
                {/* INPUT DE EMAIL */}
                <div className="input-group">
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Correo electrónico *" 
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                {/* INPUT DE NOMBRE COMPLETO */}
                <div className="input-group">
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Nombre completo *" 
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                
                {/* INPUT DE TELÉFONO */}
                {/* 
                    VALIDACIÓN HTML:
                    - pattern="[0-9]{10}" → Solo acepta 10 dígitos
                    - type="tel" → Muestra teclado numérico en móviles
                    
                    NOTA: La validación HTML es básica. Nuestra validación en JS
                    es más robusta y muestra mensajes personalizados.
                */}
                <div className="input-group">
                    <input 
                        type="tel" 
                        className="input-field" 
                        placeholder="Teléfono (10 dígitos) *" 
                        required
                        pattern="[0-9]{10}"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                
                {/* INPUT DE DIRECCIÓN (OPCIONAL) */}
                {/* 
                    CONCEPTO - CAMPOS OPCIONALES:
                    - Este input NO tiene el atributo "required"
                    - El usuario puede dejarlo vacío
                    - En el estado inicial es una cadena vacía ''
                */}
                <div className="input-group">
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Dirección (opcional)" 
                        autoComplete="street-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                
                {/* INPUT DE CONTRASEÑA */}
                {/* 
                    SEGURIDAD:
                    - type="password" → Oculta los caracteres
                    - autoComplete="new-password" → Ayuda a los gestores de contraseñas
                    - En producción, deberías:
                      1. Encriptar la contraseña antes de enviarla
                      2. Usar HTTPS siempre
                      3. Implementar 2FA (autenticación de dos factores)
                */}
                <div className="input-group">
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Contraseña (mín. 6 caracteres) *" 
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {/* BOTÓN DE ENVÍO */}
                <button 
                    type="submit" 
                    className="submit-button register-submit"
                    disabled={message.isLoading}
                >
                    {message.isLoading ? 'Procesando...' : 'Registrar'}
                </button>
            </form>
        </div>
    );
};

export default RegisterView;

// =============================================================================
// CONCEPTOS ADICIONALES QUE APRENDISTE:
// =============================================================================
// 
// 1. VALIDACIÓN DE FORMULARIOS:
//    - Validaciones HTML (pattern, required, type)
//    - Validaciones JavaScript personalizadas
//    - Expresiones regulares: /^\d+$/.test(phone)
//      · ^ = inicio de la cadena
//      · \d = cualquier dígito (0-9)
//      · + = uno o más dígitos
//      · $ = fin de la cadena
// 
// 2. SETTIMEOUT EN REACT:
//    - Simula operaciones asíncronas (como llamadas a API)
//    - Permite mostrar estados de "cargando"
//    - En producción, usarías fetch() o axios para llamadas reales
// 
// 3. CAMPOS OPCIONALES VS REQUERIDOS:
//    - required → El usuario DEBE completarlo
//    - Sin required → El usuario PUEDE dejarlo vacío
// 
// 4. PASAR DATOS ADICIONALES:
//    - registerUser(email, password, { fullName, phone, address })
//    - El tercer parámetro es un objeto con datos extra
//    - Esto se llama "parámetro options" o "parámetro config"
// 
// 5. EARLY RETURN:
//    - if (error) { return; }
//    - Detiene la ejecución de la función
//    - Útil para validaciones antes del procesamiento principal
// 
// =============================================================================