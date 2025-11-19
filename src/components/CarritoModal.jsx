//=============================================================================
// CarritoModal.jsx - modal del carrito de compras
//=============================================================================
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
import {useCarrito} from './CarritoContext';
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
const CarritoModal =({isOpen, onClose, onFinalizarCompra})=>{
    //--------------------------------------------------------------------------
    // 1. hooks y datos
    //--------------------------------------------------------------------------

    //oobtener datos y funciones del contexto del carrito
    const {
        carrito,// array de servicios en el carrito
        eliminarDelCarrito,// función para eliminar un servicio
        actualizarCantidad,// función para actualizar cantidad
        calcularTotal// función para calcular total
    } = useCarrito();

    //--------------------------------------------------------------------------
    // 2. renderizado condicional
    //--------------------------------------------------------------------------

    // si el modal no esta abierto, no renderizamos nada
    // Esto e más eficiente que ocultarlo con css

    if(!isOpen) return null;

    //--------------------------------------------------------------------------
    // 3. calcular estadisticas
    //--------------------------------------------------------------------------

    //calcular el numero total de items (suma de cantidades)
    //ejemplo: 2 muebles + 1 alfombra = 3 items

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    //==========================================================================
    // 4. manejadores de eventos
    //==========================================================================

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
    //==========================================================================
    // 5. estilos
    //==========================================================================
    const overlayStyle = {
        position: 'fixed', // fijo en la pantalla
        top : 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', // fondo oscuro semi-transparente
        display: 'flex',
        alignItems: 'center',// centrar verticalmente
        justifyContent: 'center',// centrar horizontalmente
        zIndex: 9999,//Aparecer encima de todo
        padding: '20px',
        animation: 'fadeIn 0.3s ease' // animación de entrada
    };

    //estilos del contenedor del modal
    const modalStyle = {
        background: 'while',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',// altura máxima del 80% de la ventana
        overflow: 'hidden', // ocultar scroll del contenedor pricipal
        display: 'flex', // usar flexbox
        flexDirection: 'column', // columna vertical
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation:'slideUp 0.3s ease' // Animacion de entrada
    };
    