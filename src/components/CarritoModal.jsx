// =============================================================================
// CARRITOMODAL.JSX - MODAL DEL CARRITO DE COMPRAS
// =============================================================================
// Este componente muestra una ventana modal con todos los servicios agregados
// al carrito, permitiendo modificar cantidades, eliminar items y proceder
// a finalizar la compra.
//
// CARACTERÍSTICAS:
// - Vista detallada de cada servicio en el carrito
// - Controles de cantidad (+/-)
// - Botón para eliminar servicios
// - Cálculo automático del total
// - Animaciones suaves de entrada/salida
// =============================================================================

import React from 'react';
import { useCarrito } from './CarritoContext';

/**
 * COMPONENTE: CarritoModal
 * 
 * PROPS:
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onFinalizarCompra - Función al hacer clic en "Finalizar compra"
 * 
 * CONCEPTO: Modal (Ventana Emergente)
 * Un modal es una ventana que aparece sobre el contenido principal
 * y bloquea la interacción con el resto de la página hasta que se cierre.
 */
const CarritoModal = ({ isOpen, onClose, onFinalizarCompra }) => {
    
    // =========================================================================
    // 1. HOOKS Y DATOS
    // =========================================================================
    
    // Obtener datos y funciones del contexto del carrito
    const { 
        carrito,              // Array de servicios
        eliminarDelCarrito,   // Función para eliminar
        actualizarCantidad,   // Función para cambiar cantidad
        calcularTotal         // Función para calcular total
    } = useCarrito();
    
    // =========================================================================
    // 2. RENDERIZADO CONDICIONAL
    // =========================================================================
    
    // Si el modal no está abierto, no renderizar nada
    // Esto es más eficiente que ocultarlo con CSS
    if (!isOpen) return null;
    
    // =========================================================================
    // 3. CALCULAR ESTADÍSTICAS
    // =========================================================================
    
    // Calcular el número total de items (suma de cantidades)
    // Ejemplo: 2 muebles + 1 alfombra = 3 items
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    // =========================================================================
    // 4. MANEJADORES DE EVENTOS
    // =========================================================================
    
    /**
     * Maneja el clic en el overlay (fondo oscuro)
     * Cierra el modal solo si se hace clic directamente en el overlay,
     * no cuando se hace clic en el contenido del modal.
     * 
     * @param {Event} e - Evento del clic
     */
    const handleOverlayClick = (e) => {
        // e.target es el elemento donde se hizo clic
        // e.currentTarget es el elemento que tiene el event listener
        
        // Solo cerrar si el clic fue directamente en el overlay
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    /**
     * Maneja la finalización de compra
     * Verifica que haya items antes de proceder
     */
    const handleFinalizarCompra = () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        
        // Cerrar el modal del carrito
        onClose();
        
        // Abrir el modal de confirmación
        onFinalizarCompra();
    };
    
    // =========================================================================
    // 5. ESTILOS
    // =========================================================================
    
    // Estilo del overlay (fondo oscuro semi-transparente)
    const overlayStyle = {
        position: 'fixed',        // Fijo en la pantalla
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',  // Negro 70% transparente
        display: 'flex',
        alignItems: 'center',     // Centrar verticalmente
        justifyContent: 'center', // Centrar horizontalmente
        zIndex: 9999,             // Aparecer encima de todo
        padding: '20px',
        animation: 'fadeIn 0.3s ease'  // Animación de entrada
    };
    
    // Estilo del contenedor del modal
    const modalStyle = {
        background: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',        // Máximo 90% de la altura de la ventana
        overflow: 'hidden',       // Ocultar scroll del contenedor principal
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease'  // Animación de entrada
    };
    
    // Estilo del header del modal
    const headerStyle = {
        padding: '25px',
        borderBottom: '2px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0099ff, #0022ccff)'
    };
    
    // Estilo del título
    const titleStyle = {
        margin: 0,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '24px',
        fontWeight: 'bold'
    };
    
    // Estilo del botón cerrar (X)
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
    
    // Estilo del body (área scrolleable)
    const bodyStyle = {
        flex: 1,              // Ocupa todo el espacio disponible
        overflow: 'auto',     // Scroll si el contenido es muy largo
        padding: '20px'
    };
    
    // Estilo del footer
    const footerStyle = {
        padding: '25px',
        borderTop: '2px solid #f0f0f0',
        background: '#fafafa'
    };
    
    // =========================================================================
    // 6. RENDERIZADO
    // =========================================================================
    /**
     * ESTRUCTURA HTML:
     * 
     * <div> (overlay)
     *   └── <div> (modal)
     *         ├── <div> (header)
     *         │     ├── <h2> (título)
     *         │     └── <button> (cerrar)
     *         ├── <div> (body - scrolleable)
     *         │     └── [Lista de items del carrito]
     *         └── <div> (footer)
     *               ├── <div> (total)
     *               └── <div> (botones)
     */
    
    return (
        <>
            {/* ANIMACIONES CSS */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
            
            {/* OVERLAY */}
            <div 
                style={overlayStyle}
                onClick={handleOverlayClick}  // Cerrar al hacer clic en el fondo
            >
                {/* CONTENEDOR DEL MODAL */}
                <div 
                    style={modalStyle}
                    onClick={(e) => e.stopPropagation()}  // Evitar que el clic cierre el modal
                >
                    
                    {/* ============================================= */}
                    {/* HEADER DEL MODAL */}
                    {/* ============================================= */}
                    <div style={headerStyle}>
                        {/* TÍTULO CON ÍCONO */}
                        <h2 style={titleStyle}>
                            🛒 Carrito de Servicios
                        </h2>
                        
                        {/* BOTÓN CERRAR */}
                        <button
                            onClick={onClose}
                            style={closeButtonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'rotate(90deg)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'rotate(0deg)';
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* ============================================= */}
                    {/* BODY DEL MODAL (CONTENIDO SCROLLEABLE) */}
                    {/* ============================================= */}
                    <div style={bodyStyle}>
                        {/* CARRITO VACÍO */}
                        {carrito.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#999'
                            }}>
                                <div style={{
                                    fontSize: '64px',
                                    opacity: 0.3,
                                    marginBottom: '20px'
                                }}>
                                    🛒
                                </div>
                                <p style={{ fontSize: '18px' }}>
                                    El carrito está vacío
                                </p>
                            </div>
                        ) : (
                            /* LISTA DE ITEMS DEL CARRITO */
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                {carrito.map(item => (
                                    <CarritoItem 
                                        key={item.id}
                                        item={item}
                                        onEliminar={() => eliminarDelCarrito(item.id)}
                                        onActualizarCantidad={(nuevaCantidad) => 
                                            actualizarCantidad(item.id, nuevaCantidad)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* ============================================= */}
                    {/* FOOTER DEL MODAL (TOTAL Y BOTONES) */}
                    {/* ============================================= */}
                    {carrito.length > 0 && (
                        <div style={footerStyle}>
                            {/* TOTAL */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>
                                <span>Total:</span>
                                <span style={{ color: '#0099ff' }}>
                                    ${calcularTotal().toLocaleString('es-CO')}
                                </span>
                            </div>
                            
                            {/* BOTONES */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* BOTÓN: SEGUIR COMPRANDO */}
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        border: '2px solid #ddd',
                                        background: 'white',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f5f5f5';
                                        e.target.style.borderColor = '#999';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#ddd';
                                    }}
                                >
                                    Seguir comprando
                                </button>
                                
                                {/* BOTÓN: FINALIZAR COMPRA */}
                                <button
                                    onClick={handleFinalizarCompra}
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
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(0, 153, 255, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 255, 0.3)';
                                    }}
                                >
                                    Finalizar compra
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// =============================================================================
// COMPONENTE HIJO: CarritoItem
// =============================================================================
/**
 * Representa un item individual dentro del carrito
 * Este componente se creó para mantener el código organizado y reutilizable
 *
 * @param {object} item - Datos del servicio
 * @param {function} onEliminar - Función para eliminar el item
 * @param {function} onActualizarCantidad - Función para cambiar cantidad
 */
const CarritoItem = ({ item, onEliminar, onActualizarCantidad }) => {
    
    // Estilo del contenedor del item
    const itemStyle = {
        display: 'flex',
        gap: '15px',
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '12px',
        alignItems: 'center',
        transition: 'all 0.3s ease'
    };
    
    return (
        <div 
            style={itemStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9f9f9';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            {/* IMAGEN DEL SERVICIO */}
            <img
                src={item.imagen}
                alt={item.nombre}
                style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    flexShrink: 0  // No reducir tamaño
                }}
            />
            
            {/* INFORMACIÓN DEL SERVICIO */}
            <div style={{ flex: 1 }}>
                <h4 style={{
                    margin: '0 0 5px 0',
                    fontSize: '16px',
                    color: '#333'
                }}>
                    {item.nombre}
                </h4>
                <p style={{
                    margin: '0 0 8px 0',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    ⏱️ {item.duracion}
                </p>
                <p style={{
                    margin: 0,
                    color: '#0099ff',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ${item.precio.toLocaleString('es-CO')}
                </p>
            </div>
            
            {/* CONTROLES (CANTIDAD Y ELIMINAR) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {/* CONTROL DE CANTIDAD */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '25px',
                    border: '2px solid #0099ff'
                }}>
                    {/* BOTÓN DECREMENTAR (-) */}
                    <button
                        onClick={() => onActualizarCantidad(item.cantidad - 1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#0099ff',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        −
                    </button>
                    
                    {/* CANTIDAD ACTUAL */}
                    <span style={{
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center',
                        fontSize: '16px'
                    }}>
                        {item.cantidad}
                    </span>
                    
                    {/* BOTÓN INCREMENTAR (+) */}
                    <button
                        onClick={() => onActualizarCantidad(item.cantidad + 1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#0099ff',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        +
                    </button>
                </div>
                
                {/* BOTÓN ELIMINAR */}
                <button
                    onClick={onEliminar}
                    style={{
                        background: '#ff4444',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '18px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1) rotate(90deg)';
                        e.target.style.background = '#cc0000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1) rotate(0deg)';
                        e.target.style.background = '#ff4444';
                    }}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default CarritoModal;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
//
// 1. MODALES:
//    - Overlay + Contenido centrado
//    - position: fixed para cubrir toda la pantalla
//    - z-index alto para aparecer encima de todo
//
// 2. e.stopPropagation():
//    - Evita que el evento "burbujee" al elemento padre
//    - Útil para evitar que clics en el modal cierren el modal
//
// 3. COMPONENTES ANIDADOS:
//    - CarritoItem es un componente dentro de CarritoModal
//    - Mantiene el código organizado y reutilizable
//    - Cada componente tiene una responsabilidad clara
//
// 4. ANIMACIONES CSS:
//    - @keyframes para definir animaciones
//    - animation: nombre duración timing-function
//    - fadeIn para el overlay, slideUp para el modal
//
// 5. RENDERIZADO CONDICIONAL CON &&:
//    - {carrito.length > 0 && <Footer />}
//    - Solo renderiza si la condición es verdadera
//
// 6. FLEX: 1:
//    - El elemento ocupa todo el espacio disponible
//    - Útil para áreas scrolleables que deben crecer
//
// 7. overflow: 'auto':
//    - Muestra scroll solo si el contenido es más grande que el contenedor
//    - overflow: 'hidden' oculta el scroll completamente
//
// 8. .map() PARA LISTAS:
//    - {carrito.map(item => <CarritoItem key={item.id} item={item} />)}
//    - key es OBLIGATORIO para que React identifique cada elemento
//
// =============================================================================