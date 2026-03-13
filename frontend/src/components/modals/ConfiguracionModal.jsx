import React, { useState } from 'react';
import QuickActionModal from './QuickActionModal';

function ConfiguracionModal({ configuracion, onClose, onSave }) {
    const [siteName, setSiteName] = useState(configuracion.siteName);
    const [email, setEmail] = useState(configuracion.email);
    const [phone, setPhone] = useState(configuracion.phone);
    const [timeoutMinutes, setTimeoutMinutes] = useState(configuracion.timeoutMinutes);

    const guardar = () => {
        onSave({ siteName, email, phone, timeoutMinutes });
    };

    return (
        <QuickActionModal titulo="⚙️ Configuración" onClose={onClose} anchoGrande={false}>
            <div style={{ display: 'grid', gap: '16px' }}>
                <ConfigInput label="Nombre del Sitio" value={siteName} onChange={e => setSiteName(e.target.value)} id="configSiteName" />
                <ConfigInput label="Email de Contacto" type="email" value={email} onChange={e => setEmail(e.target.value)} id="configEmail" />
                <ConfigInput label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} id="configPhone" />
                <ConfigInput label="Timeout de Sesión (minutos)" type="number" value={timeoutMinutes} onChange={e => setTimeoutMinutes(e.target.value)} id="configTimeout" />

                <button onClick={guardar} style={saveButtonStyle}>
                    💾 Guardar Configuración
                </button>
            </div>
        </QuickActionModal>
    );
}

// Subcomponente y estilos
const ConfigInput = ({ label, id, type = 'text', value, onChange }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input 
            type={type} 
            id={id} 
            value={value} 
            onChange={onChange} 
            style={inputStyle} 
        />
    </div>
);
const labelStyle = { display: 'block', fontWeight: '600', marginBottom: '8px', color: '#555' };
const inputStyle = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' };
const saveButtonStyle = { background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' };

export default ConfiguracionModal;