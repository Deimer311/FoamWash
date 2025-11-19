// =============================================================================
// SERVICECARDCLIENTE.JSX - TARJETA INDIVIDUAL DE SERVICIO
// =============================================================================
// Este componente muestra un servicio individual con imagen, descripción y botón.
// Es el "ladrillo" que se repite en la cuadrícula de servicios.
//
// RESPONSABILIDADES:
// - Mostrar información del servicio
// - Manejar el botón "Agregar al carrito"
// - Aplicar animaciones hover
// =============================================================================

import React, { useState } from 'react';
import { useCarrito } from './CarritoContext';

/**
 * COMPONENTE: ServiceCardCliente
 * 
 * PROPS:
 * @param {object} servicio - Objeto con los datos del servicio
 *   - id: número único identificador
 *   - nombre: string con el nombre del servicio
 *   - descripcion: string con la descripción
 *   - precio: número con el precio
 *   - imagen: string con la URL de la imagen
 *   - duracion: string con el tiempo estimado
 * @param {function} onNotificacion - Función para mostrar notificaciones
 */
const ServiceCardCliente = ({ servicio, onNotificacion }) => {
    
    // =========================================================================
    // 1. HOOKS Y ESTADOS
    // =========================================================================
    
    // Extraer la función agregarAlCarrito del contexto
    // CONCEPTO: Destructuring
    // En lugar de: const carrito = useCarrito(); carrito.agregarAlCarrito()
    // Hacemos: const { agregarAlCarrito } = useCarrito(); agregarAlCarrito()
    const { agregarAlCarrito } = useCarrito();
    
    // Estado para controlar las animaciones hover
    // Cuando el mouse entra: isHovered = true
    // Cuando el mouse sale: isHovered = false
    const [isHovered, setIsHovered] = useState(false);
    
    // =========================================================================
    // 2. MANEJADORES DE EVENTOS
    // =========================================================================
    
    /**
     * Maneja el clic en el botón "Agregar"
     * 
     * FLUJO:
     * 1. Llamar a agregarAlCarrito (del Context)
     * 2. Mostrar notificación de éxito
     */
    const handleAgregar = () => {
        // Agregar el servicio al carrito (actualiza el estado global)
        agregarAlCarrito(servicio);
        
        // Mostrar notificación al usuario
        if (onNotificacion) {
            onNotificacion(`${servicio.nombre} agregado al carrito`);
        }
    };
    
    // =========================================================================
    // 3. ESTILOS DINÁMICOS
    // =========================================================================
    // Los estilos cambian según el estado (hover, active, etc.)
    
    // Estilo de la tarjeta principal
    const cardStyle = {
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isHovered 
            ? '0 15px 40px rgba(0, 0, 0, 0.2)'  // Sombra más grande cuando hover
            : '0 10px 30px rgba(0, 0, 0, 0.1)', // Sombra normal
        transition: 'all 0.4s ease',  // Transición suave de 0.4 segundos
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',  // Elevación hover
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
    };
    
    // Estilo del contenedor de imagen
    const imageContainerStyle = {
        width: '100%',
        height: '220px',
        overflow: 'hidden',  // Ocultar partes de la imagen que salgan del contenedor
        position: 'relative'
    };
    
    // Estilo de la imagen
    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',  // La imagen cubre todo el espacio sin distorsionarse
        transition: 'transform 0.4s ease',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'  // Zoom al hacer hover
    };
    
    // Estilo del contenido (texto)
    const contentStyle = {
        padding: '30px',
        textAlign: 'center',
        flex: 1,  // Ocupa todo el espacio disponible
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };
    
    // Estilo del título
    const titleStyle = {
        fontSize: '22px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '15px',
        lineHeight: '1.3'
    };
    
    // Estilo de la descripción
    const descriptionStyle = {
        fontSize: '15px',
        color: '#666',
        marginBottom: '20px',
        lineHeight: '1.5'
    };
    
    // Estilo del área de precio y botón
    const metaStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
    };
    
    // Estilo del precio
    const priceStyle = {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0099ff'
    };
    
    // Estilo del botón "Agregar"
    const buttonStyle = {
        background: '#0099ff',
        color: 'white',
        border: 'none',
        padding: '12px 40px',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0, 153, 255, 0.3)'
    };
    
    // =========================================================================
    // 4. RENDERIZADO
    // =========================================================================
    /**
     * ESTRUCTURA HTML:
     * 
     * <article> (tarjeta completa)
     *   ├── <div> (contenedor de imagen)
     *   │     └── <img> (imagen del servicio)
     *   └── <div> (contenido)
     *         ├── <h3> (título)
     *         ├── <p> (descripción)
     *         └── <div> (área de precio/botón)
     *               ├── <span> (precio)
     *               └── <button> (botón agregar)
     */
    
    return (
        <article 
            style={cardStyle}
            // EVENTOS DE MOUSE para el efecto hover
            onMouseEnter={() => setIsHovered(true)}   // Mouse entra
            onMouseLeave={() => setIsHovered(false)}  // Mouse sale
        >
            {/* SECCIÓN DE IMAGEN */}
            <div style={imageContainerStyle}>
                <img 
                    src={servicio.imagen} 
                    alt={servicio.nombre}
                    style={imageStyle}
                    // MANEJO DE ERROR: Si la imagen no carga, mostrar placeholder
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x300?text=Imagen+no+disponible';
                    }}
                />
            </div>
            
            {/* SECCIÓN DE CONTENIDO */}
            <div style={contentStyle}>
                {/* TÍTULO DEL SERVICIO */}
                <h3 style={titleStyle}>{servicio.nombre}</h3>
                
                {/* DESCRIPCIÓN */}
                <p style={descriptionStyle}>{servicio.descripcion}</p>
                
                {/* ÁREA DE PRECIO Y BOTÓN */}
                <div style={metaStyle}>
                    {/* PRECIO FORMATEADO */}
                    {/* 
                        .toLocaleString('es-CO') formatea el número como moneda colombiana:
                        90000 → "90.000"
                    */}
                    <span style={priceStyle}>
                        ${servicio.precio.toLocaleString('es-CO')}
                    </span>
                    
                    {/* BOTÓN AGREGAR AL CARRITO */}
                    <button 
                        type="button"
                        style={buttonStyle}
                        onClick={handleAgregar}
                        // EFECTOS HOVER ADICIONALES (más intensos que la tarjeta)
                        onMouseEnter={(e) => {
                            e.target.style.background = '#0077cc';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#0099ff';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 255, 0.3)';
                        }}
                        // EFECTO ACTIVE (cuando se presiona)
                        onMouseDown={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ServiceCardCliente;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
//
// 1. PROPS DESTRUCTURING:
//    - const ServiceCardCliente = ({ servicio, onNotificacion }) => { ... }
//    - Extraemos directamente las props que necesitamos
//
// 2. CONTEXT HOOK:
//    - const { agregarAlCarrito } = useCarrito();
//    - Accedemos a funciones globales sin pasar props
//
// 3. ESTADOS LOCALES PARA UI:
//    - const [isHovered, setIsHovered] = useState(false);
//    - Para controlar efectos visuales que no afectan otros componentes
//
// 4. ESTILOS DINÁMICOS:
//    - transform: isHovered ? 'translateY(-10px)' : 'translateY(0)'
//    - Los estilos cambian según el estado
//
// 5. EVENTOS DE MOUSE:
//    - onMouseEnter: Cuando el cursor entra al elemento
//    - onMouseLeave: Cuando el cursor sale del elemento
//    - onMouseDown: Cuando se presiona el botón del mouse
//    - onClick: Cuando se hace clic completo
//
// 6. MANEJO DE ERRORES EN IMÁGENES:
//    - onError={(e) => { e.target.src = 'imagen_alternativa.jpg' }}
//    - Si la imagen no carga, mostrar un placeholder
//
// 7. FORMATO DE NÚMEROS:
//    - .toLocaleString('es-CO'): Formatea números según la localización
//    - 90000 → "90.000" (con puntos de miles)
//
// 8. OBJECT-FIT: COVER:
//    - La imagen cubre todo el contenedor sin distorsionarse
//    - Puede recortar partes de la imagen para mantener proporción
//
// =============================================================================
//
// FLUJO DE INTERACCIÓN:
// =============================================================================
//
// 1. Usuario pasa el mouse sobre la tarjeta
//    ↓
// 2. onMouseEnter ejecuta setIsHovered(true)
//    ↓
// 3. React detecta cambio de estado y re-renderiza
//    ↓
// 4. Los estilos cambian (elevación, zoom en imagen, sombra)
//    ↓
// 5. Usuario hace clic en "Agregar"
//    ↓
// 6. handleAgregar() se ejecuta
//    ↓
// 7. agregarAlCarrito(servicio) actualiza el Context global
//    ↓
// 8. Todos los componentes que usan useCarrito() se re-renderizan
//    ↓
// 9. El badge del carrito se actualiza automáticamente
//
// =============================================================================