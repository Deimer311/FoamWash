// =============================================================================
// ARCHIVO  : LoginView.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/LoginView.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Formulario de inicio de sesión reutilizable. Usa AuthContext para autenticar al usuario.
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginView = ({ onRedirect, onRecuperar }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false, isLoading: false });

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', isError: false, isLoading: true });
        try {
            const result = await login(email, password);
            if (result.success) {
                setMessage({ text: result.message, isError: false, isLoading: false });
                setTimeout(() => { if (onRedirect) onRedirect(result); }, 800);
            } else {
                setMessage({ text: result.message || 'Credenciales inválidas', isError: true, isLoading: false });
            }
        } catch {
            setMessage({ text: 'Error de conexión', isError: true, isLoading: false });
        }
    };

    return (
        <div className="form-content login-view">
            <h2 className="title">Iniciar sesión</h2>
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Cargando...' : message.text}
                </div>
            )}
            <form className="form" onSubmit={handleLogin}>
                <div className="input-group">
                    <input type="email" className="input-field" placeholder="Correo electrónico" required
                        autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <input type="password" className="input-field" placeholder="Contraseña" required
                        autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {onRecuperar && (
                    <div className="forgot-password">
                        <a href="#" className="forgot-link"
                            onClick={(e) => { e.preventDefault(); onRecuperar(); }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                )}
                <button type="submit" className="submit-button" disabled={message.isLoading}>
                    {message.isLoading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    );
};

export default LoginView;
