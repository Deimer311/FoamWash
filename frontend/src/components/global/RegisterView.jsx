import React, { useState } from 'react';
import { registrarSesionActiva } from '../utils/AuthUtils';

const RegisterView = ({ onRedirect }) => {
    // 1. ESTADOS DEL FORMULARIO (Incluyendo campos de tu SQL)
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [documento, setDocumento] = useState(''); // Requerido por SQL
    const [tipoDoc, setTipoDoc] = useState(1);      // Requerido por SQL (FK)
    
    const [message, setMessage] = useState({ 
        text: '', 
        isError: false, 
        isLoading: false 
    });

    // 2. FUNCIÓN DE REGISTRO (Marcada como async)
    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Reiniciar estados de mensaje
        setMessage({ text: '', isError: false, isLoading: true });

        // =====================================================================
        // VALIDACIONES PREVIAS
        // =====================================================================
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            setMessage({ 
                text: 'El teléfono debe tener 10 dígitos numéricos.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }

        if (password.length < 6) {
            setMessage({ 
                text: 'La contraseña debe tener al menos 6 caracteres.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }

        // =====================================================================
        // PETICIÓN AL BACKEND (CONEXIÓN REAL)
        // =====================================================================
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: fullName,
                    telefono: phone,
                    n_documento: documento,
                    direccion: address,
                    correo: email,
                    contrasena: password,
                    rol_id: 3,      // Rol Cliente por defecto
                    tipo_doc_id: tipoDoc
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // ✅ ÉXITO
                setMessage({ text: '¡Usuario creado exitosamente!', isError: false, isLoading: false });

                // Registrar sesión localmente (opcional)
                registrarSesionActiva(email, 'cliente', 'token_generado', '/dashboard');

                // Redirigir
                setTimeout(() => {
                    if (onRedirect) onRedirect('/dashboard');
                }, 1500);

            } else {
                // ❌ ERROR DESDE EL SERVIDOR (ej: Correo ya existe)
                throw new Error(result.message || 'Error al registrar el usuario');
            }

        } catch (error) {
            setMessage({ 
                text: error.message || 'Error de conexión con el servidor', 
                isError: true, 
                isLoading: false 
            });
        }
    };

    return (
        <div className="form-content register-view">
            <h2 className="title">Regístrate en Foam Wash</h2>
            
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Procesando registro...' : message.text}
                </div>
            )}

            <form className="form" onSubmit={handleRegister}>
                <div className="input-group">
                    <input type="text" className="input-field" placeholder="Nombre completo *" required
                        value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                {/* NUEVO: Campo de Documento para cumplir con tu SQL */}
                <div className="input-group">
                    <input type="text" className="input-field" placeholder="Número de Documento *" required
                        value={documento} onChange={(e) => setDocumento(e.target.value)} />
                </div>

                <div className="input-group">
                    <input type="tel" className="input-field" placeholder="Teléfono (10 dígitos) *" required
                        value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="input-group">
                    <input type="email" className="input-field" placeholder="Correo electrónico *" required
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="input-group">
                    <input type="text" className="input-field" placeholder="Dirección (opcional)"
                        value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="input-group">
                    <input type="password" placeholder="Contraseña *" required className="input-field"
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" className="submit-button" disabled={message.isLoading}>
                    {message.isLoading ? 'Registrando...' : 'Finalizar Registro'}
                </button>
            </form>
        </div>
    );
};

export default RegisterView;