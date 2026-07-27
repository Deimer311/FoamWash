// =============================================================================
// ARCHIVO  : RegisterView.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/RegisterView.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Formulario de registro de nuevos usuarios. Usa AuthContext para crear la cuenta y hacer login automático.
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './estilos_autenticacion/login.css';

const RegisterView = ({ onRedirect }) => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false, isLoading: false });

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage({ text: '', isError: false, isLoading: true });

        if (phone && (phone.length !== 10 || !/^\d+$/.test(phone))) {
            setMessage({ text: 'El teléfono debe tener 10 dígitos numéricos.', isError: true, isLoading: false });
            return;
        }
        if (password.length < 6) {
            setMessage({ text: 'La contraseña debe tener al menos 6 caracteres.', isError: true, isLoading: false });
            return;
        }

        try {
            const result = await register({ email, fullName, phone, address, password });
            if (result.success) {
                setMessage({ text: result.message, isError: false, isLoading: false });
                setTimeout(() => { if (onRedirect) onRedirect(result); }, 1000);
            } else {
                let mensaje = result.message || 'Error al registrar';
                if (result.message?.toLowerCase().includes('correo')) {
                    mensaje = 'Correo inválido o ya registrado.';
                } else if (result.message?.toLowerCase().includes('contraseña')) {
                    mensaje = 'Contraseña incorrecta.';
                }
                setMessage({ text: mensaje, isError: true, isLoading: false });
            }

        } catch {
            setMessage({ text: 'Error de conexión', isError: true, isLoading: false });
        }


    };

    return (
        <div className="form-content register-view">
            <h2 className="title">Regístrate en Foam Wash</h2>
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Procesando...' : message.text}
                </div>
            )}
            <form className="form" onSubmit={handleRegister}>
                <div className="input-group">
                    <input type="text" className="input-field" placeholder="Nombre completo *" required
                        value={fullName} onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} />
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
                    <input type="password" className="input-field" placeholder="Contraseña *" required
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
