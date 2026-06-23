// =============================================================================
// ARCHIVO  : Recuperar.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/autenticacion/Recuperar.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Flujo de recuperación de contraseña en 3 pasos: solicitar código, verificar código y cambiar contraseña.
// =============================================================================

import React, { useState } from 'react';
import authService from '../../services/authService';
import './estilos_autenticacion/recuperar_estilos.css';
// 🔊 NUEVO — Sonidos
import useSound from '../../hooks/useSound';

const RecuperarContrasena = ({ onBackToLogin, onBackToHome }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🔊 NUEVO
  const { playExito, playError } = useSound();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PASO 1: Solicitar código al backend
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      // 🔊 NUEVO
      playError();
      setError('Por favor ingresa tu correo');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // 🔊 NUEVO
      playError();
      setError('Por favor ingresa un correo válido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.requestPasswordReset(email);

      if (result.success) {
        // 🔊 NUEVO
        playExito();
        setSuccess(`Código enviado a ${email}`);
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      } else {
        // 🔊 NUEVO
        playError();
        setError(result.error?.message || 'Error al enviar el código');
      }
    } catch (error) {
      // 🔊 NUEVO
      playError();
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
      // 🔊 NUEVO
      playError();
      setError('Por favor ingresa el código');
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      // 🔊 NUEVO
      playError();
      setError('El código debe tener 6 dígitos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.verifyResetCode(email, code);

      if (result.success) {
        // 🔊 NUEVO
        playExito();
        setSuccess('¡Código verificado correctamente!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1000);
      } else {
        // 🔊 NUEVO
        playError();
        setError(result.error?.message || 'Código inválido o expirado');
      }
    } catch (error) {
      // 🔊 NUEVO
      playError();
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
      // 🔊 NUEVO
      playError();
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      // 🔊 NUEVO
      playError();
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      // 🔊 NUEVO
      playError();
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(email, code, newPassword);

      if (result.success) {
        // 🔊 NUEVO
        playExito();
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
        // 🔊 NUEVO
        playError();
        setError(result.error?.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      // 🔊 NUEVO
      playError();
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
  // RENDER
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