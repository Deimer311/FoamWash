// =============================================================================
// ARCHIVO  : ConfirmacionModal.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/modales/ConfirmacionModal.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Modal de confirmación y agendamiento del pedido. Flujo completo de reserva.
// =============================================================================

import React, { useState } from 'react';
import { useCarrito } from './CarritoContext';
import { useAuth } from '../autenticacion/AuthContext';

const ConfirmacionModal = ({ isOpen, onClose, carritoItems = [] }) => {
    
    const { agregarPedido } = useCarrito();
    const { user } = useAuth();
    
    // Estados del formulario
    const [formData, setFormData] = useState({
        nombre: user?.name || '',
        telefono: '',
        direccion: '',
        fechaServicio: '',
        horaServicio: '',
        observaciones: ''
    });
    
    const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
    const [numeroPedido, setNumeroPedido] = useState('');
    
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;
    
    // ✅ Verificar si hay items en el carritoSnapshot
    console.log('📦 Items recibidos en ConfirmacionModal:', carritoItems);
    
    // Calcular total
    const calcularTotal = () => {
        if (!carritoItems || carritoItems.length === 0) return 0;
        return carritoItems.reduce((sum, item) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            return sum + (precio * cantidad);
        }, 0);
    };
    
    // Manejador del overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    // Manejador de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Manejador de confirmación del pedido
    const handleConfirmar = (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!formData.nombre.trim()) {
            alert('Por favor ingresa tu nombre');
            return;
        }
        if (!formData.telefono.trim()) {
            alert('Por favor ingresa tu teléfono');
            return;
        }
        if (!formData.direccion.trim()) {
            alert('Por favor ingresa tu dirección');
            return;
        }
        if (!formData.fechaServicio) {
            alert('Por favor selecciona una fecha para el servicio');
            return;
        }
        if (!formData.horaServicio) {
            alert('Por favor selecciona una hora para el servicio');
            return;
        }
        
        // ✅ Verificar que hay items
        if (!carritoItems || carritoItems.length === 0) {
            alert('No hay servicios en el carrito');
            return;
        }
        
        // Crear pedido
        const nuevoPedido = {
            id: `PED-${Date.now()}`,
            cliente: {
                nombre: formData.nombre,
                email: user?.email || '',
                telefono: formData.telefono,
                direccion: formData.direccion
            },
            servicios: carritoItems, // ✅ Usar el snapshot que recibimos
            fechaServicio: formData.fechaServicio,
            horaServicio: formData.horaServicio,
            observaciones: formData.observaciones,
            total: calcularTotal(),
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        
        console.log('📝 Creando pedido:', nuevoPedido);
        
        // Guardar pedido
        agregarPedido(nuevoPedido);
        
        // Mostrar confirmación
        setNumeroPedido(nuevoPedido.id);
        setPedidoConfirmado(true);
    };
    
    // Si el pedido fue confirmado, mostrar pantalla de éxito
    if (pedidoConfirmado) {
        return (
            <div style={overlayStyle} onClick={handleOverlayClick}>
                <div style={modalStyle}>
                    <div className="confirmacion-exitosa">
                        <div className="icono-exito">✓</div>
                        <h3>¡Pedido Confirmado!</h3>
                        <p>Tu pedido ha sido registrado exitosamente</p>
                        <strong>Número de pedido: {numeroPedido}</strong>
                        <p style={{ marginTop: '20px' }}>
                            Recibirás una confirmación pronto.
                        </p>
                        <button
                            onClick={() => {
                                setPedidoConfirmado(false);
                                setFormData({
                                    nombre: user?.name || '',
                                    telefono: '',
                                    direccion: '',
                                    fechaServicio: '',
                                    horaServicio: '',
                                    observaciones: ''
                                });
                                onClose();
                            }}
                            style={{
                                marginTop: '30px',
                                padding: '15px 40px',
                                background: 'white',
                                color: '#11998e',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // ✅ MOSTRAR MENSAJE SI NO HAY ITEMS
    if (!carritoItems || carritoItems.length === 0) {
        return (
            <div style={overlayStyle} onClick={handleOverlayClick}>
                <div style={modalStyle}>
                    <div style={headerStyle}>
                        <h2 style={titleStyle}>⚠️ Carrito Vacío</h2>
                        <button onClick={onClose} style={closeButtonStyle}>✕</button>
                    </div>
                    <div style={bodyStyle}>
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#999'
                        }}>
                            <p style={{ fontSize: '18px' }}>
                                No hay servicios en el carrito para confirmar
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    marginTop: '20px',
                                    padding: '12px 30px',
                                    background: '#0099ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '25px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Formulario de confirmación
    return (
        <div style={overlayStyle} onClick={handleOverlayClick}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                
                {/* HEADER */}
                <div style={headerStyle}>
                    <h2 style={titleStyle}>📝 Confirmar Agendación</h2>
                    <button onClick={onClose} style={closeButtonStyle}>✕</button>
                </div>
                
                {/* BODY */}
                <div style={bodyStyle}>
                    <form className="form-confirmacion" onSubmit={handleConfirmar}>
                        
                        {/* Información del cliente */}
                        <div className="form-group">
                            <label>Nombre completo *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Teléfono *</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                placeholder="Ej: 3001234567"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Dirección del servicio *</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Calle 123 #45-67, Apartamento 301"
                            />
                        </div>
                        
                        {/* Fecha y hora */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Fecha del servicio *</label>
                                <input
                                    type="date"
                                    name="fechaServicio"
                                    value={formData.fechaServicio}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Hora preferida *</label>
                                <input
                                    type="time"
                                    name="horaServicio"
                                    value={formData.horaServicio}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        {/* Observaciones */}
                        <div className="form-group">
                            <label>Observaciones adicionales</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Instrucciones especiales, detalles del lugar, etc."
                                rows="3"
                            />
                        </div>
                        
                        {/* Resumen del pedido */}
                        <div className="resumen-pedido">
                            <h3>Resumen de servicios</h3>
                            {carritoItems.map((item, index) => (
                                <div key={index} className="resumen-item">
                                    <span>
                                        {item.nombre} × {item.cantidad}
                                    </span>
                                    <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                                </div>
                            ))}
                            <div className="resumen-total-final">
                                <strong>Total:</strong>
                                <strong>${calcularTotal().toLocaleString('es-CO')}</strong>
                            </div>
                        </div>
                        
                        {/* Botones */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '15px', 
                            marginTop: '25px'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-cancelar"
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: '#f5576c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Seguir Cotizando
                            </button>
                            
                            <button
                                type="submit"
                                className="btn-confirmar"
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    background: '#11998e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Realizar Agendación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// ESTILOS
// =============================================================================

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
};

const modalStyle = {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
};

const headerStyle = {
    padding: '25px',
    borderBottom: '2px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #0099ff, #0066cc)'
};

const titleStyle = {
    margin: 0,
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold'
};

const closeButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '24px',
    transition: 'all 0.3s ease'
};

const bodyStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '30px'
};

export default ConfirmacionModal;