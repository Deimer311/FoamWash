// =============================================================================
// LOGINPAGE.JSX - CON REDIRECCIÓN AUTOMÁTICA CORRECTA
// =============================================================================
// ACTUALIZADO para pasar el objeto completo del resultado del login
// al callback onLoginSuccess, incluyendo redirectPage
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './css/login.css';

const LoginPage = ({ onBackToHome, onLoginSuccess }) => {
    
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    
    const switchToRegister = () => {
        setIsRegisterActive(true);
    };
    
    const switchToLogin = () => {
        setIsRegisterActive(false);
    };
    
    return (
        <>
            <div className="background"></div>

            <center>
                <a 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        onBackToHome();
                    }}
                    style={{ textDecoration: 'none' }}
                >
                    <h1 className="logo-header">FoamWash</h1>
                </a>
            </center>

            <div className="container">
                <div className={`card-wrapper ${isRegisterActive ? 'register-active' : ''}`}>

                    <div className="card-side form-side">
                        {!isRegisterActive && (
                            <LoginView onLoginSuccess={onLoginSuccess} />
                        )}
                        
                        {isRegisterActive && (
                            <RegisterView onLoginSuccess={onLoginSuccess} />
                        )}
                    </div>

                    <div className="card-side toggle-side">
                        <div className={`toggle-content login-active-content ${!isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Hola amig@!</h2>
                            <p className="toggle-text">
                                Si no tienes una cuenta<br />
                                puedes crear una nueva
                            </p>
                            <button 
                                className="toggle-button" 
                                onClick={switchToRegister}
                            >
                                Registrar
                            </button>
                        </div>
                        
                        <div className={`toggle-content register-active-content ${isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Bienvenido de nuevo!</h2>
                            <p className="toggle-text">
                                Si ya tienes una cuenta<br />
                                puedes iniciar sesión
                            </p>
                            <button 
                                className="toggle-button" 
                                onClick={switchToLogin}
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

// =============================================================================
// COMPONENTE: LoginView (ACTUALIZADO)
// =============================================================================
const LoginView = ({ onLoginSuccess }) => {
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ 
        text: '', 
        isError: false, 
        isLoading: false 
    });

    const handleLogin = (e) => {
        e.preventDefault();
        
        setMessage({ text: '', isError: false, isLoading: true });

        // Simular delay de red (opcional)
        setTimeout(() => {
            // Llamar a login del contexto
            const result = login(email, password);

            if (result.success) {
                // ✅ LOGIN EXITOSO
                
                console.log('✅ Login exitoso en LoginView:', result);
                
                setMessage({ 
                    text: result.message, 
                    isError: false, 
                    isLoading: false 
                });
                
                // IMPORTANTE: Pasar el resultado COMPLETO al callback
                // Esto incluye: { success, message, role, redirectPage }
                setTimeout(() => {
                    if (onLoginSuccess) {
                        // Pasar el objeto completo con role y redirectPage
                        onLoginSuccess({
                            role: result.role,
                            redirectPage: result.redirectPage
                        });
                    }
                }, 1000);

            } else {
                // ❌ LOGIN FALLIDO
                console.log('❌ Login fallido:', result.message);
                
                setMessage({ 
                    text: result.message, 
                    isError: true, 
                    isLoading: false 
                });
            }
        }, 500);
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
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Correo electrónico" 
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Contraseña" 
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="forgot-password">
                    <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={message.isLoading}
                >
                    {message.isLoading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>
            
            
        </div>
    );
};

// =============================================================================
// COMPONENTE: RegisterView (ACTUALIZADO)
// =============================================================================
const RegisterView = ({ onLoginSuccess }) => {
    const { register } = useAuth();
    
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ 
        text: '', 
        isError: false, 
        isLoading: false 
    });

    const handleRegister = (e) => {
        e.preventDefault();
        
        setMessage({ text: '', isError: false, isLoading: true });

        // Validaciones
        if (phone && phone.length !== 10) {
            setMessage({ 
                text: 'El teléfono debe tener exactamente 10 dígitos.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }
        
        if (phone && !/^\d+$/.test(phone)) {
            setMessage({ 
                text: 'El teléfono solo puede contener números.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }

        setTimeout(() => {
            // Llamar a register del contexto
            const result = register(email, password, fullName, phone, address);

            if (result.success) {
                // ✅ REGISTRO EXITOSO
                
                console.log('✅ Registro exitoso en RegisterView:', result);
                
                setMessage({ 
                    text: result.message, 
                    isError: false, 
                    isLoading: false 
                });
                
                // IMPORTANTE: Pasar el resultado COMPLETO al callback
                setTimeout(() => {
                    if (onLoginSuccess) {
                        // Pasar el objeto completo con role y redirectPage
                        onLoginSuccess({
                            role: result.role,
                            redirectPage: result.redirectPage
                        });
                    }
                }, 1000);

            } else {
                // ❌ REGISTRO FALLIDO
                console.log('❌ Registro fallido:', result.message);
                
                setMessage({ 
                    text: result.message, 
                    isError: true, 
                    isLoading: false 
                });
            }
        }, 1000);
    };
    
    return (
        <div className="form-content register-view">
            <h2 className="title">Regístrate</h2>
            
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Procesando...' : message.text}
                </div>
            )}

            <form className="form" onSubmit={handleRegister}>
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

export default LoginPage;

// =============================================================================
// CAMBIOS CLAVE EN ESTA VERSIÓN:
// =============================================================================
//
// 1. LOGIN EXITOSO:
//    ANTES: onLoginSuccess(result.role)
//    AHORA: onLoginSuccess({ role: result.role, redirectPage: result.redirectPage })
//    
//    ¿POR QUÉ? App.js necesita ambos datos para redirigir correctamente
//
// 2. REGISTRO EXITOSO:
//    ANTES: onLoginSuccess(result.role)
//    AHORA: onLoginSuccess({ role: result.role, redirectPage: result.redirectPage })
//    
//    ¿POR QUÉ? Igual que con login, necesitamos la página de redirección
//
// 3. LOGGING MEJORADO:
//    - console.log muestra el resultado completo para debugging
//    - Ayuda a verificar que redirectPage se está pasando correctamente
//
// =============================================================================