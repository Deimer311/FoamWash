import React, { useState } from 'react';
import QuickActionModal from './QuickActionModal';

function NuevoUsuarioModal({ usuarios, onClose, onSave, onDelete }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [tipo, setTipo] = useState('cliente_natural');

    const guardarUsuario = () => {
        if (!nombre || !email) {
            alert('⚠️ Por favor complete todos los campos obligatorios');
            return;
        }

        const nuevoUsuario = { nombre, email, tipo };
        onSave(nuevoUsuario);

        // Limpiar formulario
        setNombre('');
        setEmail('');
        setTipo('cliente_natural');
    };

    return (
        <QuickActionModal titulo="➕ Nuevo Usuario" onClose={onClose}>
            {/* Formulario de Creación */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#333', marginBottom: '16px' }}>Crear Nuevo Usuario</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Campos de Input */}
                    <InputGroup label="Nombre Completo *" id="nuevoNombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
                    <InputGroup label="Email *" id="nuevoEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                    
                    <div>
                        <label style={labelStyle}>Tipo de Usuario *</label>
                        <select 
                            id="nuevoTipo" 
                            value={tipo} 
                            onChange={e => setTipo(e.target.value)} 
                            style={inputStyle}
                        >
                            <option value="cliente_natural">Cliente Natural</option>
                            <option value="cliente_empresarial">Cliente Empresarial</option>
                            <option value="empleado">Empleado</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>

                    <button 
                        onClick={guardarUsuario} 
                        style={saveButtonStyle}
                    >
                        ✓ Guardar Usuario
                    </button>
                </div>
            </div>
            
            <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />

            {/* Lista de Usuarios Existentes */}
            <div>
                <h3 style={{ color: '#333', marginBottom: '16px' }}>📋 Usuarios Existentes</h3>
                <div>
                    {usuarios.map(usuario => (
                        <div key={usuario.id} style={userItemStyle}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{usuario.nombre}</p>
                                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>{usuario.email} • {usuario.tipo}</p>
                            </div>
                            <button 
                                onClick={() => onDelete(usuario.id)} 
                                style={deleteButtonStyle}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </QuickActionModal>
    );
}

// Subcomponente y estilos para el formulario
const InputGroup = ({ label, id, type = 'text', value, onChange, placeholder }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input 
            type={type} 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            style={inputStyle} 
        />
    </div>
);

const labelStyle = { display: 'block', fontWeight: '600', marginBottom: '8px', color: '#555' };
const inputStyle = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' };
const saveButtonStyle = { background: 'linear-gradient(135deg, #00C851 0%, #00A041 100%)', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' };
const userItemStyle = { background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const deleteButtonStyle = { background: '#FF3547', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };

export default NuevoUsuarioModal;