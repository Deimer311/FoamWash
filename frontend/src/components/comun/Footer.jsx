// =============================================================================
// ARCHIVO  : Footer.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/Footer.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Footer principal de la página pública.
// =============================================================================

import React, { useState } from 'react';

const Footer = () => {
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [message, setMessage] = useState('');
    
    // Reemplaza estos valores con tus datos reales
    const socialLinks = {
        facebook: 'https://www.facebook.com/share/1HhYNYTwtK/',
        whatsappNumber: '573144368571' // Formato: código país + número (sin +)
    };
    
    const handleWhatsAppClick = (e) => {
        e.preventDefault();
        setShowWhatsAppModal(true);
    };
    
    const sendWhatsAppMessage = () => {
        if (!message.trim()) return;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${socialLinks.whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        setShowWhatsAppModal(false);
        setMessage('');
    };

    const styles = {
        footer: {
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
        },
        socialContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px'
        },
        socialIcon: {
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
            border: 'none',
            padding: '0'
        },
        facebook: {
            backgroundColor: '#1877f2'
        },
        whatsapp: {
            backgroundColor: '#25d366'
        },
        copyright: {
            fontSize: '14px',
            color: '#ffffffff'
        },
        modalOverlay: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
            padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        },
        modalHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        textarea: {
            width: '100%',
            height: '120px',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'none',
            fontFamily: 'inherit',
            marginBottom: '15px',
            boxSizing: 'border-box'
        },
        buttonContainer: {
            display: 'flex',
            gap: '10px'
        },
        button: {
            flex: '1',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        cancelButton: {
            backgroundColor: '#e0e0e0',
            color: '#333'
        },
        sendButton: {
            backgroundColor: '#25d366',
            color: 'white'
        },
        sendButtonDisabled: {
            backgroundColor: '#ccc',
            color: '#666',
            cursor: 'not-allowed'
        }
    };

    return (
        <>
            <div style={styles.footer} className="footer">
                <div style={styles.socialContainer}>
                    <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{...styles.socialIcon, ...styles.facebook}}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                    
                    <button
                        onClick={handleWhatsAppClick}
                        style={{...styles.socialIcon, ...styles.whatsapp}}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </button>
                    
                
                </div>
                
                <div style={styles.copyright}>
                    © 2025 Lavados Gonzalez. Todos los derechos reservados.
                </div>
            </div>

            {showWhatsAppModal && (
                <div style={styles.modalOverlay} onClick={() => setShowWhatsAppModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25d366">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Enviar mensaje por WhatsApp
                            </div>
                            <button 
                                style={styles.closeButton}
                                onClick={() => setShowWhatsAppModal(false)}
                                onMouseOver={(e) => e.currentTarget.style.color = '#333'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#999'}
                            >
                                ×
                            </button>
                        </div>
                        
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            style={styles.textarea}
                            onFocus={(e) => e.target.style.borderColor = '#25d366'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                        
                        <div style={styles.buttonContainer}>
                            <button
                                onClick={() => setShowWhatsAppModal(false)}
                                style={{...styles.button, ...styles.cancelButton}}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={sendWhatsAppMessage}
                                disabled={!message.trim()}
                                style={{
                                    ...styles.button,
                                    ...(message.trim() ? styles.sendButton : styles.sendButtonDisabled)
                                }}
                                onMouseOver={(e) => {
                                    if (message.trim()) e.currentTarget.style.backgroundColor = '#1fb855'
                                }}
                                onMouseOut={(e) => {
                                    if (message.trim()) e.currentTarget.style.backgroundColor = '#25d366'
                                }}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;