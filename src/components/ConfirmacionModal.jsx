// =============================================================================
// CONFIRMACIONMODAL.JSX - MODAL DE CONFIRMACIÓN Y FINALIZACIÓN DE PEDIDO
// =============================================================================
// Este es el modal MÁS COMPLEJO del sistema. Maneja:
// - Detalles de cada servicio (tamaño, tipo de lavado)
// - Formulario de información del pedido (dirección, fecha, hora)
// - Validaciones
// - Confirmación exitosa con animación
// - Guardado del pedido
//
// FLUJO:
// 1. Mostrar servicios del carrito con campos adicionales
// 2. Recopilar información de entrega
// 3. Validar todo
// 4. Guardar pedido
// 5. Mostrar confirmación animada
// 6. Limpiar carrito
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useCarrito } from './CarritoContext';

/**
 * COMPONENTE: ConfirmacionModal
 * 
 * PROPS:
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * 
 * CONCEPTO: Formulario Multi-paso
 * Este modal maneja múltiples pasos en un solo componente:
 * - Paso 1: Detalles de servicios
 * - Paso 2: Información de entrega
 * - Paso 3: Confirmación exitosa
 */
const ConfirmacionModal = ({ isOpen, onClose }) => {
    
    // =========================================================================
    // 1. HOOKS Y ESTADOS
    // =========================================================================
    
    // Obtener datos y funciones del contexto
    const { 
        carrito, 
        calcularTotal, 
        actualizarDetalle, 
        agregarPedido 
    } = useCarrito();
    
    // Estado del formulario
    // CONCEPTO: Estado como objeto
    // Agrupar datos relacionados en un solo objeto facilita el manejo
    const [formData, setFormData] = useState({
        direccion: '',
        ciudad: '',
        telefono: '',
        fecha: '',
        hora: '',
        observaciones: ''
    });
    
    // Estado para el pedido confirmado
    // null = no hay pedido confirmado
    // objeto = pedido fue confirmado exitosamente
    const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
    
    // =========================================================================
    // 2. EFECTO: RESETEAR AL ABRIR/CERRAR
    // =========================================================================
    /**
     * useEffect con dependencia [isOpen]
     * Se ejecuta cada vez que isOpen cambia
     * 
     * PROPÓSITO:
     * Resetear el estado cuando el modal se cierra
     * para que la próxima vez esté limpio
     */
    useEffect(() => {
        if (!isOpen) {
            // Resetear formulario
            setFormData({
                direccion: '',
                ciudad: '',
                telefono: '',
                fecha: '',
                hora: '',
                observaciones: ''
            });
            
            // Resetear confirmación
            setPedidoConfirmado(null);
        }
    }, [isOpen]);  // Solo ejecutar cuando isOpen cambia
    
    // =========================================================================
    // 3. RENDERIZADO CONDICIONAL TEMPRANO
    // =========================================================================
    
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;
    
    // =========================================================================
    // 4. CALCULAR FECHA MÍNIMA
    // =========================================================================
    /**
     * La fecha mínima para el servicio es mañana
     * (no permitimos servicios para hoy)
     */
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaMinima = manana.toISOString().split('T')[0];  // Formato: YYYY-MM-DD
    
    // =========================================================================
    // 5. MANEJADORES DE EVENTOS
    // =========================================================================
    
    /**
     * Maneja cambios en los campos del formulario
     * 
     * CONCEPTO: Computed Property Names
     * [e.target.name]: e.target.value
     * Usa el atributo "name" del input como clave del objeto
     * 
     * @param {Event} e - Evento del input
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;  // Destructuring del evento
        
        setFormData({
            ...formData,      // Mantener todos los campos existentes
            [name]: value     // Actualizar solo el campo que cambió
        });
    };
    
    /**
     * Maneja el envío del formulario
     * 
     * FLUJO DE VALIDACIÓN:
     * 1. Verificar que los campos requeridos estén llenos
     * 2. Verificar que todos los servicios tengan tamaño y tipo
     * 3. Crear objeto del pedido
     * 4. Guardar pedido
     * 5. Mostrar confirmación
     * 
     * @param {Event} e - Evento del formulario
     */
    const handleSubmit = (e) => {
        e.preventDefault();  // Evitar recarga de página
        
        // VALIDACIÓN 1: Verificar que el formulario HTML sea válido
        // checkValidity() verifica los atributos "required" de los inputs
        if (!e.target.checkValidity()) {
            e.target.reportValidity();  // Mostrar mensajes de error del navegador
            return;
        }
        
        // VALIDACIÓN 2: Verificar que todos los servicios tengan detalles
        const serviciosSinDetalles = carrito.filter(
            item => !item.tamano || !item.tipoLavado
        );
        
        if (serviciosSinDetalles.length > 0) {
            alert('Por favor completa los detalles de todos los servicios');
            return;
        }
        
        // CREAR OBJETO DEL PEDIDO
        const pedido = {
            id: `PED-${Date.now()}`,  // ID único basado en timestamp
            servicios: carrito.map(item => ({ ...item })),  // Copiar servicios
            ...formData,  // Agregar datos del formulario
            total: calcularTotal(),
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        
        // GUARDAR PEDIDO (esto limpia el carrito automáticamente)
        agregarPedido(pedido);
        
        // MOSTRAR CONFIRMACIÓN
        setPedidoConfirmado(pedido);
        
        // AUTO-CERRAR DESPUÉS DE 5 SEGUNDOS
        setTimeout(() => {
            onClose();
        }, 5000);
    };
    
    /**
     * Formatea una fecha para mostrarla de forma legible
     * 
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {string} Fecha formateada (ej: "sábado, 25 de noviembre de 2023")
     */
    const formatearFecha = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');  // Agregar hora para evitar problemas de zona horaria
        return date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // =========================================================================
    // 6. ESTILOS
    // =========================================================================
    
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
        padding: '20px',
        overflow: 'auto'  // Permitir scroll si el contenido es muy alto
    };
    
    const modalStyle = {
        background: 'white',
        borderRadius: '20px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    };
    
    const headerStyle = {
        padding: '25px',
        borderBottom: '2px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0099ff, #00cc88)',
        position: 'sticky',
        top: 0,
        zIndex: 10
    };
    
    const bodyStyle = {
        padding: '25px'
    };
    
    // =========================================================================
    // 7. RENDERIZADO
    // =========================================================================
    
    return (
        <>
            {/* ANIMACIONES */}
            <style>{`
                @keyframes scaleIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
            `}</style>
            
            <div 
                style={overlayStyle}
                onClick={onClose}
            >
                <div 
                    style={modalStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div style={headerStyle}>
                        <h2 style={{ margin: 0, color: 'white' }}>
                            {pedidoConfirmado ? '✅ Pedido Confirmado' : '📋 Confirmar Pedido'}
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
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
                                fontSize: '24px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* BODY */}
                    <div style={bodyStyle}>
                        {pedidoConfirmado ? (
                            /* VISTA: CONFIRMACIÓN EXITOSA */
                            <VistaConfirmacion 
                                pedido={pedidoConfirmado}
                                formatearFecha={formatearFecha}
                            />
                        ) : (
                            /* VISTA: FORMULARIO */
                            <VistaFormulario
                                carrito={carrito}
                                formData={formData}
                                fechaMinima={fechaMinima}
                                onInputChange={handleInputChange}
                                onSubmit={handleSubmit}
                                onActualizarDetalle={actualizarDetalle}
                                calcularTotal={calcularTotal}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// =============================================================================
// COMPONENTE: VistaFormulario
// =============================================================================
/**
 * Formulario para capturar detalles del servicio e información de entrega
 * Separado en su propio componente para mejor organización
 */
const VistaFormulario = ({
    carrito,
    formData,
    fechaMinima,
    onInputChange,
    onSubmit,
    onActualizarDetalle,
    calcularTotal
}) => {
    return (
        <form onSubmit={onSubmit}>
            {/* DETALLES DE SERVICIOS */}
            <h3 style={{ marginBottom: '20px' }}>Detalles de los servicios</h3>
            
            {carrito.map((item, index) => (
                <div key={item.id} style={{
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{ marginBottom: '15px' }}>{item.nombre}</h4>
                    
                    <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}
                    />
                    
                    {/* SELECT: TAMAÑO */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold'
                        }}>
                            Tamaño *
                        </label>
                        <select
                            required
                            value={item.tamano}
                            onChange={(e) => onActualizarDetalle(item.id, 'tamano', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #ddd',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">Seleccionar tamaño</option>
                            {item.tamanos.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* INPUT NUMBER: CANTIDAD */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold'
                        }}>
                            Cantidad *
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={item.cantidad}
                            readOnly
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #ddd',
                                fontSize: '16px',
                                background: '#f0f0f0'
                            }}
                        />
                    </div>
                    
                    {/* SELECT: TIPO DE LAVADO */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold'
                        }}>
                            Tipo de Lavado *
                        </label>
                        <select
                            required
                            value={item.tipoLavado}
                            onChange={(e) => onActualizarDetalle(item.id, 'tipoLavado', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #ddd',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">Seleccionar tipo</option>
                            {item.tiposLavado.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            
            {/* INFORMACIÓN DE ENTREGA */}
            <h3 style={{ marginBottom: '20px', marginTop: '30px' }}>
                Información de entrega
            </h3>
            
            <FormField
                label="Dirección de servicio *"
                name="direccion"
                type="text"
                placeholder="Ej: Calle 123 #45-67, Apto 101"
                value={formData.direccion}
                onChange={onInputChange}
                required
            />
            
            <FormField
                label="Ciudad *"
                name="ciudad"
                type="text"
                placeholder="Ej: Bogotá"
                value={formData.ciudad}
                onChange={onInputChange}
                required
            />
            
            <FormField
                label="Teléfono de contacto *"
                name="telefono"
                type="tel"
                placeholder="Ej: 3001234567"
                value={formData.telefono}
                onChange={onInputChange}
                required
            />
            
            <FormField
                label="Fecha preferida del servicio *"
                name="fecha"
                type="date"
                min={fechaMinima}
                value={formData.fecha}
                onChange={onInputChange}
                required
            />
            
            {/* SELECT: HORA */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold'
                }}>
                    Hora preferida *
                </label>
                <select
                    name="hora"
                    required
                    value={formData.hora}
                    onChange={onInputChange}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontSize: '16px'
                    }}
                >
                    <option value="">Seleccionar hora</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                </select>
            </div>
            
            {/* TEXTAREA: OBSERVACIONES */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold'
                }}>
                    Observaciones adicionales
                </label>
                <textarea
                    name="observaciones"
                    rows="3"
                    placeholder="Información adicional..."
                    value={formData.observaciones}
                    onChange={onInputChange}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontSize: '16px',
                        fontFamily: 'Arial, sans-serif',
                        resize: 'vertical'
                    }}
                />
            </div>
            
            {/* RESUMEN DEL PEDIDO */}
            <div style={{
                background: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '15px' }}>Resumen de tu pedido</h3>
                {carrito.map(item => (
                    <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #ddd'
                    }}>
                        <span>
                            {item.nombre} x{item.cantidad}
                            {item.tamano && ` (${item.tamano})`}
                            {item.tipoLavado && ` - ${item.tipoLavado}`}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>
                            ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                        </span>
                    </div>
                ))}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginTop: '15px',
                    color: '#0099ff'
                }}>
                    <span>Total a pagar:</span>
                    <span>${calcularTotal().toLocaleString('es-CO')}</span>
                </div>
            </div>
            
            {/* BOTONES */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    style={{
                        flex: 1,
                        padding: '15px',
                        border: '2px solid #ddd',
                        background: 'white',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    style={{
                        flex: 1,
                        padding: '15px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0099ff, #00cc88)',
                        color: 'white',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0, 153, 255, 0.3)'
                    }}
                >
                    Confirmar pedido
                </button>
            </div>
        </form>
    );
};

// =============================================================================
// COMPONENTE: FormField (Campo de Formulario Reutilizable)
// =============================================================================
const FormField = ({ label, name, type, placeholder, value, onChange, required, min }) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={{
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold'
        }}>
            {label}
        </label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                fontSize: '16px'
            }}
        />
    </div>
);

// =============================================================================
// COMPONENTE: VistaConfirmacion
// =============================================================================
const VistaConfirmacion = ({ pedido, formatearFecha }) => (
    <div style={{
        textAlign: 'center',
        padding: '40px 20px'
    }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00cc88, #0099ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            fontSize: '40px',
            color: 'white',
            animation: 'scaleIn 0.5s ease, pulse 2s ease infinite'
        }}>
            ✓
        </div>
        
        <h3 style={{ marginBottom: '20px', fontSize: '28px' }}>
            ¡Pedido confirmado!
        </h3>
        
        <p style={{ marginBottom: '10px', fontSize: '16px' }}>
            Tu código de pedido es:
        </p>
        
        <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0099ff',
            marginBottom: '30px'
        }}>
            {pedido.id}
        </p>
        
        <div style={{
            background: '#f9f9f9',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'left'
        }}>
            <p style={{ marginBottom: '10px' }}>
                📅 <strong>Fecha:</strong> {formatearFecha(pedido.fecha)} a las {pedido.hora}
            </p>
            <p style={{ marginBottom: '10px' }}>
                📍 <strong>Dirección:</strong> {pedido.direccion}, {pedido.ciudad}
            </p>
            <p style={{ marginBottom: 0 }}>
                💰 <strong>Total:</strong> ${pedido.total.toLocaleString('es-CO')}
            </p>
        </div>
        
        <p style={{
            marginTop: '30px',
            fontSize: '14px',
            color: '#666'
        }}>
            Recibirás una confirmación por WhatsApp al {pedido.telefono}
        </p>
    </div>
);

export default ConfirmacionModal;

// =============================================================================
// CONCEPTOS CLAVE:
// =============================================================================
// 1. FORMULARIOS COMPLEJOS
// 2. VALIDACIONES MÚLTIPLES
// 3. COMPONENTES SEPARADOS PARA ORGANIZACIÓN
// 4. ANIMACIONES CON @KEYFRAMES
// 5. MANEJO DE FECHAS Y FORMATOS
// 6. ESTADOS CONDICIONALES
// =============================================================================