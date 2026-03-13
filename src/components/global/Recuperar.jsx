/**=============================================================================
 *RECUPERAR CONTRASEÑA - COMPONENTE DE REACT
  *=============================================================================
  *Descripción:
  * - Este componente maneja el proceso de recuperación de contraseña en tres pasos:
  *  1. Solicitar un código de restablecimiento al backend.
  * 2. Verificar el código recibido por correo.
  * 3. Cambiar la contraseña utilizando el código verificado.
  * - El componente utiliza estados locales para manejar el progreso, los
  * errores y los mensajes de éxito.
  * - Se comunica con el backend a través de authService, que hace llamadas a
  * las rutas definidas en auth.js.
  * - El diseño es responsivo y amigable, con indicadores de paso y mensajes
  * claros para el usuario.
  *
  *Nota: Este componente asume que las rutas del backend para la recuperación
  de contraseña están implementadas correctamente.
  * - POST /api/auth/request-password-reset: Para solicitar el código
  de restablecimiento.
  * - POST /api/auth/verify-reset-code: Para verificar el código recibido.
  * - POST /api/auth/reset-password: Para cambiar la contraseña utilizando
  * el código verificado.
  *
  *El componente también incluye validaciones básicas para los campos de entrada
  y maneja estados de carga para mejorar la experiencia del usuario.
  *=============================================================================
 */
import React, { useState } from 'react';
import authService from '../../services/authService';
import '../css/recuperar_estilos.css';

const RecuperarContrasena = ({ onBackToLogin, onBackToHome }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PASO 1: Solicitar código al backend
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      setError('Por favor ingresa tu correo');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo válido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.requestPasswordReset(email);

      if (result.success) {
        setSuccess(`Código enviado a ${email}`);
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error?.message || 'Error al enviar el código');
      }
    } catch (error) {
      setError(error?.error?.message || 'Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PASO 2: Verificar código con el backend
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleVerifyCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!code) {
      setError('Por favor ingresa el código');
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.verifyResetCode(email, code);

      if (result.success) {
        setSuccess('¡Código verificado correctamente!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1000);
      } else {
        setError(result.error?.message || 'Código inválido o expirado');
      }
    } catch (error) {
      setError(error?.error?.message || 'Código inválido o expirado');
    } finally {
      setIsLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PASO 3: Cambiar contraseña en el backend
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(email, code, newPassword);

      if (result.success) {
        setSuccess('¡Contraseña cambiada exitosamente!');
        setTimeout(() => {
          setStep(1);
          setEmail('');
          setCode('');
          setNewPassword('');
          setConfirmPassword('');
          setError('');
          setSuccess('');
          if (onBackToLogin) onBackToLogin();
        }, 1500);
      } else {
        setError(result.error?.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      setError(error?.error?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseOtherEmail = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && !isLoading) action();
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER — mismo JSX que tenías, sin cambios
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="recuperar-container">
      <div className="recuperar-background"></div>
      
      <div className="recuperar-content">
        <div className="recuperar-logo">
          <a href="#" onClick={(e) => { e.preventDefault(); if (onBackToHome) onBackToHome(); }} className="logo-link">
            <h1>FoamWash</h1>
          </a>
        </div>

        <div className="recuperar-card">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Correo</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Código</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Nueva Contraseña</div>
            </div>
          </div>

          {step === 1 && (
            <div className="step-content fade-in">
              <h2 className="step-title">Recuperar contraseña</h2>
              <p className="step-description">
                Ingresa tu correo electrónico y te enviaremos<br />
                un código para restablecer tu contraseña
              </p>
              <div className="form-group">
                <input type="email" placeholder="Correo electrónico" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleSendCode)}
                  className="input-field" autoComplete="email" disabled={isLoading} />
                {error && <p className="error-message">❌ {error}</p>}
                {success && <p className="success-message">✅ {success}</p>}
                <div className="link-container">
                  <button type="button" onClick={() => { if (onBackToLogin) onBackToLogin(); }}
                    className="text-link" disabled={isLoading}>
                    ← Volver al inicio de sesión
                  </button>
                </div>
                <button onClick={handleSendCode} className="submit-button" disabled={isLoading}>
                  {isLoading ? '📧 Enviando...' : 'Enviar código'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content fade-in">
              <h2 className="step-title">Ingresa tu código</h2>
              <p className="step-description">
                Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
              </p>
              <div className="form-group">
                <input type="text" placeholder="000000" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={(e) => handleKeyPress(e, handleVerifyCode)}
                  className="input-field code-input" maxLength="6" autoComplete="off" />
                {error && <p className="error-message">❌ {error}</p>}
                {success && <p className="success-message">✅ {success}</p>}
                <div className="link-container">
                  <button type="button" onClick={handleUseOtherEmail} className="text-link">
                    ← Usar otro correo
                  </button>
                </div>
                <button onClick={handleVerifyCode} className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content fade-in">
              <h2 className="step-title">Nueva contraseña</h2>
              <p className="step-description">
                Ingresa tu nueva contraseña y confírmala<br />(Mínimo 6 caracteres)
              </p>
              <div className="form-group">
                <input type="password" placeholder="Nueva contraseña" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field" autoComplete="new-password" />
                <input type="password" placeholder="Confirmar contraseña" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleChangePassword)}
                  className="input-field" autoComplete="new-password" />
                {error && <p className="error-message">❌ {error}</p>}
                {success && <p className="success-message">✅ {success}</p>}
                <div className="link-container">
                  <button type="button" onClick={handleUseOtherEmail} className="text-link">
                    ← Usar otro correo
                  </button>
                </div>
                <button onClick={handleChangePassword} className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;