// =============================================================================
// ARCHIVO  : LoginPage.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/LoginPage.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Página principal de inicio de sesión y registro. Contiene los formularios LoginView y RegisterView.
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './estilos_autenticacion/login.css';
// 🔊 NUEVO — Sonidos
import useSound from '../../hooks/useSound';

const LoginPage = ({ onBackToHome, onLoginSuccess, onRecuperar }) => {
    
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
                            <LoginView 
                                onLoginSuccess={onLoginSuccess}
                                onRecuperar={onRecuperar}
                            />
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
// COMPONENTE: LoginView (CON SONIDOS)
// =============================================================================
const LoginView = ({ onLoginSuccess, onRecuperar }) => {
    const { login } = useAuth();
    // 🔊 NUEVO
    const { playExito, playError } = useSound();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ 
        text: '', 
        isError: false, 
        isLoading: false 
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        
        setMessage({ text: '', isError: false, isLoading: true });

        try {
            const result = await login(email, password);

            if (result.success) {
                console.log('✅ Login exitoso:', result);
                // 🔊 NUEVO — Suena éxito
                playExito();
                
                setMessage({ 
                    text: result.message, 
                    isError: false, 
                    isLoading: false 
                });
                
                setTimeout(() => {
                    if (onLoginSuccess) {
                        onLoginSuccess({
                            role: result.role,
                            redirectPage: result.redirectPage
                        });
                    }
                }, 1000);

            } else {
                console.log('❌ Login fallido:', result.message);
                // 🔊 NUEVO — Suena error
                playError();
                
                setMessage({ 
                    text: result.message, 
                    isError: true, 
                    isLoading: false 
                });
            }
        } catch (error) {
            console.error('❌ Error en handleLogin:', error);
            // 🔊 NUEVO — Suena error
            playError();
            setMessage({ 
                text: 'Error al iniciar sesión. Por favor intenta de nuevo.', 
                isError: true, 
                isLoading: false 
            });
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
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            if (onRecuperar) {
                                onRecuperar();
                            }
                        }}
                        className="forgot-link"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
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
// COMPONENTE: RegisterView (CON SONIDOS)
// =============================================================================
const RegisterView = ({ onLoginSuccess }) => {
    const { register } = useAuth();
    // 🔊 NUEVO
    const { playExito, playError } = useSound();
    
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

    const handleRegister = async (e) => {
        e.preventDefault();
        
        setMessage({ text: '', isError: false, isLoading: true });

        // Validar teléfono
        if (phone && phone.length !== 10) {
            // 🔊 NUEVO — Suena error de validación
            playError();
            setMessage({ 
                text: 'El teléfono debe tener exactamente 10 dígitos.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }
        
        if (phone && !/^\d+$/.test(phone)) {
            // 🔊 NUEVO — Suena error de validación
            playError();
            setMessage({ 
                text: 'El teléfono solo puede contener números.', 
                isError: true, 
                isLoading: false 
            });
            return;
        }

        const userData = {
            email: email,
            fullName: fullName,
            phone: phone,
            address: address || 'Sin dirección especificada',
            password: password
        };

        console.log('📝 Datos a enviar:', userData);

        try {
            const result = await register(userData);

            if (result.success) {
                console.log('✅ Registro exitoso:', result);
                // 🔊 NUEVO — Suena éxito
                playExito();
                
                setMessage({ 
                    text: result.message, 
                    isError: false, 
                    isLoading: false 
                });
                
                setTimeout(() => {
                    if (onLoginSuccess) {
                        onLoginSuccess({
                            role: result.role,
                            redirectPage: result.redirectPage
                        });
                    }
                }, 1500);

            } else {
                console.log('❌ Registro fallido:', result.message);
                // 🔊 NUEVO — Suena error
                playError();
                
                setMessage({ 
                    text: result.message, 
                    isError: true, 
                    isLoading: false 
                });
            }
        } catch (error) {
            console.error('❌ Error en handleRegister:', error);
            // 🔊 NUEVO — Suena error
            playError();
            setMessage({ 
                text: 'Error al registrar. Por favor intenta de nuevo.', 
                isError: true, 
                isLoading: false 
            });
        }
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