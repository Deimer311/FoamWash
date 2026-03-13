// =============================================================================
// LOGINPAGE.JSX - VERSIÓN FINAL CONECTADA A NESTJS
// =============================================================================
import React, { useState } from 'react';
import { useAuth } from '../modals/AuthContext';
import '../css/login.css';

const LoginPage = ({ onBackToHome, onLoginSuccess, onRecuperar }) => {
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    
    const switchToRegister = () => setIsRegisterActive(true);
    const switchToLogin = () => setIsRegisterActive(false);

    return (
        <>
            <div className="background"></div>
            <center>
                <a href="#" onClick={(e) => { e.preventDefault(); onBackToHome(); }} style={{ textDecoration: 'none' }}>
                    <h1 className="logo-header">FoamWash</h1>
                </a>
            </center>

            <div className="container">
                <div className={`card-wrapper ${isRegisterActive ? 'register-active' : ''}`}>
                    <div className="card-side form-side">
                        {!isRegisterActive ? (
                            <LoginView 
                                onLoginSuccess={onLoginSuccess}
                                onRecuperar={onRecuperar}
                            />
                        ) : (
                            <RegisterView onLoginSuccess={onLoginSuccess} />
                        )}
                    </div>

                    <div className="card-side toggle-side">
                        <div className={`toggle-content login-active-content ${!isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Hola amig@!</h2>
                            <p className="toggle-text">Si no tienes una cuenta<br />puedes crear una nueva</p>
                            <button className="toggle-button" onClick={switchToRegister}>Registrar</button>
                        </div>
                        <div className={`toggle-content register-active-content ${isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Bienvenido de nuevo!</h2>
                            <p className="toggle-text">Si ya tienes una cuenta<br />puedes iniciar sesión</p>
                            <button className="toggle-button" onClick={switchToLogin}>Iniciar sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// =============================================================================
// COMPONENTE INTERNO: LoginView (CONECTADO A BACKEND)
// =============================================================================
const LoginView = ({ onLoginSuccess, onRecuperar }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', isError: false, isLoading: false });

   const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false, isLoading: true });

    try {
        const result = await login(email, password);

            // VALIDACIÓN CLAVE: NestJS envía 'access_token'
            if (result && result.accessToken) { 
    // ✅ Cambié result.access_token por result.accessToken
    console.log('✅ Acceso concedido');
    setMessage({ text: '¡Sesión iniciada!', isError: false, isLoading: false });

                setTimeout(() => {
                    if (onLoginSuccess) {
                        // Aquí puedes ajustar según los datos que devuelva tu backend (roles, etc)
                        onLoginSuccess({
                            role: result.user?.role || 'cliente',
                            redirectPage: '/dashboard' 
                        });
                    }
                }, 1000);
            } else {
                throw new Error('No se recibió el token de acceso.');
            }
        } catch (error) {
            console.error('❌ Error en LoginView:', error);
            setMessage({ 
                text: 'Credenciales inválidas. Inténtalo de nuevo.', 
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
                    <input type="email" className="input-field" placeholder="Correo electrónico" required 
                           value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <input type="password" className="input-field" placeholder="Contraseña" required 
                           value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="forgot-password">
                    <a href="#" onClick={(e) => { e.preventDefault(); onRecuperar(); }} className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>
                <button type="submit" className="submit-button" disabled={message.isLoading}>
                    {message.isLoading ? 'Verificando...' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    );
};

// =============================================================================
// COMPONENTE INTERNO: RegisterView
// =============================================================================
const RegisterView = ({ onLoginSuccess }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({ email: '', fullName: '', phone: '', address: '', password: '' });
    const [message, setMessage] = useState({ text: '', isError: false, isLoading: false });

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage({ text: '', isError: false, isLoading: true });

        try {
            const result = await register(formData);
            if (result && (result.accessToken || result.id)) {
                setMessage({ text: 'Registro exitoso. ¡Bienvenido!', isError: false, isLoading: false });
                setTimeout(() => {
                    if (onLoginSuccess) onLoginSuccess({ role: 'cliente', redirectPage: '/dashboard' });
                }, 1500);
            }
        } catch (error) {
            setMessage({ text: 'Error al registrar. Intenta con otro correo.', isError: true, isLoading: false });
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
                <input type="email" className="input-field" placeholder="Email *" required 
                       onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="text" className="input-field" placeholder="Nombre completo *" required 
                       onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                <input type="tel" className="input-field" placeholder="Teléfono *" required 
                       onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <input type="password" className="input-field" placeholder="Contraseña *" required 
                       onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <button type="submit" className="submit-button register-submit" disabled={message.isLoading}>
                    {message.isLoading ? 'Creando cuenta...' : 'Registrar'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;