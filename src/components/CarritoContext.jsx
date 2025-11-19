// =============================================================================
// CARRITOCONTEXT.JSX - GESTOR GLOBAL DEL CARRITO DE COMPRAS
// =============================================================================
// Este archivo maneja TODA la lógica del carrito usando React Context API.
// Context API es como tener una "caja mágica" de datos que cualquier componente
// puede acceder sin necesidad de pasar props manualmente.
//
// VENTAJAS DE USAR CONTEXT:
// - No necesitas pasar props a través de múltiples niveles (props drilling)
// - Cualquier componente puede leer/actualizar el carrito
// - Estado centralizado y organizado
// =============================================================================

import React, { createContext, useContext, useState } from 'react';

// -----------------------------------------------------------------------------
// 1. CREAR EL CONTEXTO
// -----------------------------------------------------------------------------
// createContext() crea un "contenedor" para nuestros datos globales.
// Piénsalo como crear una "radio" que emite información a toda la app.

const CarritoContext = createContext();

// -----------------------------------------------------------------------------
// 2. PROVIDER - EL PROVEEDOR DE DATOS
// -----------------------------------------------------------------------------
/**
 * CarritoProvider es un componente que "envuelve" a otros componentes
 * y les proporciona acceso al carrito.
 * 
 * ANALOGÍA: 
 * Es como un proveedor de internet que da WiFi a toda tu casa.
 * Cualquier dispositivo (componente) dentro de la casa puede conectarse.
 * 
 * @param {object} children - Los componentes hijos que tendrán acceso al carrito
 */
export const CarritoProvider = ({ children }) => {
    
    // =========================================================================
    // ESTADOS DEL CARRITO
    // =========================================================================
    
    // Estado principal: array de servicios en el carrito
    // Cada item tiene: {id, nombre, precio, cantidad, tamano, tipoLavado, ...}
    const [carrito, setCarrito] = useState([]);
    
    // Estado para guardar los pedidos finalizados
    // Historial de compras del usuario
    const [pedidos, setPedidos] = useState([]);
    
    // =========================================================================
    // FUNCIÓN 1: AGREGAR SERVICIO AL CARRITO
    // =========================================================================
    /**
     * Agrega un servicio al carrito o incrementa su cantidad si ya existe.
     * 
     * LÓGICA:
     * 1. Buscar si el servicio ya está en el carrito
     * 2. Si existe: aumentar cantidad en 1
     * 3. Si NO existe: agregarlo nuevo con cantidad = 1
     * 
     * @param {object} servicio - El servicio a agregar (con id, nombre, precio, etc.)
     */
    const agregarAlCarrito = (servicio) => {
        // PASO 1: Buscar si el servicio ya existe
        // .find() busca el primer elemento que cumpla la condición
        const servicioExistente = carrito.find(item => item.id === servicio.id);
        
        if (servicioExistente) {
            // ✅ YA EXISTE: Solo incrementar la cantidad
            
            // .map() recorre TODO el carrito y crea un nuevo array
            // Si el id coincide, actualizamos la cantidad
            // Si no coincide, dejamos el item sin cambios
            setCarrito(carrito.map(item =>
                item.id === servicio.id
                    ? { ...item, cantidad: item.cantidad + 1 }  // Incrementar cantidad
                    : item  // Dejar sin cambios
            ));
        } else {
            // ❌ NO EXISTE: Agregarlo como nuevo
            
            // Spread operator (...) copia todas las propiedades del servicio
            // y agregamos cantidad: 1, tamano: '', tipoLavado: ''
            setCarrito([
                ...carrito,  // Mantener todos los items existentes
                { 
                    ...servicio,  // Copiar todas las propiedades del servicio
                    cantidad: 1,  // Agregar cantidad inicial
                    tamano: '',   // Campo vacío (se llenará después)
                    tipoLavado: ''  // Campo vacío (se llenará después)
                }
            ]);
        }
    };
    
    // =========================================================================
    // FUNCIÓN 2: ELIMINAR SERVICIO DEL CARRITO
    // =========================================================================
    /**
     * Elimina completamente un servicio del carrito.
     * 
     * CONCEPTO: .filter()
     * Es como una "criba" que solo deja pasar los elementos que cumplen una condición.
     * 
     * @param {number} servicioId - El ID del servicio a eliminar
     */
    const eliminarDelCarrito = (servicioId) => {
        // .filter() crea un NUEVO array solo con los items que NO tienen ese ID
        // Es decir, "filtra" y elimina el servicio
        setCarrito(carrito.filter(item => item.id !== servicioId));
    };
    
    // =========================================================================
    // FUNCIÓN 3: ACTUALIZAR CANTIDAD
    // =========================================================================
    /**
     * Cambia la cantidad de un servicio en el carrito.
     * Si la nueva cantidad es 0 o negativa, elimina el servicio.
     * 
     * @param {number} servicioId - ID del servicio
     * @param {number} nuevaCantidad - Nueva cantidad deseada
     */
    const actualizarCantidad = (servicioId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            // Si la cantidad es 0 o menos, eliminar el servicio
            eliminarDelCarrito(servicioId);
        } else {
            // Actualizar la cantidad usando .map()
            setCarrito(carrito.map(item =>
                item.id === servicioId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            ));
        }
    };
    
    // =========================================================================
    // FUNCIÓN 4: ACTUALIZAR DETALLES (TAMAÑO, TIPO DE LAVADO, ETC.)
    // =========================================================================
    /**
     * Actualiza cualquier campo de un servicio (tamaño, tipo de lavado, etc.)
     * 
     * CONCEPTO: Computed Property Names [campo]
     * Permite usar una variable como nombre de propiedad
     * Ejemplo: si campo = "tamano" y valor = "Grande"
     *          { [campo]: valor } se convierte en { tamano: "Grande" }
     * 
     * @param {number} servicioId - ID del servicio
     * @param {string} campo - Nombre del campo a actualizar ('tamano', 'tipoLavado', etc.)
     * @param {any} valor - Nuevo valor para ese campo
     */
    const actualizarDetalle = (servicioId, campo, valor) => {
        setCarrito(carrito.map(item =>
            item.id === servicioId
                ? { 
                    ...item,           // Mantener todas las propiedades existentes
                    [campo]: valor     // Actualizar solo el campo específico
                  }
                : item
        ));
    };
    
    // =========================================================================
    // FUNCIÓN 5: CALCULAR TOTAL DEL CARRITO
    // =========================================================================
    /**
     * Suma el precio total de todos los servicios en el carrito.
     * 
     * CONCEPTO: .reduce()
     * Es como una "calculadora acumulativa" que suma valores uno por uno.
     * 
     * PARÁMETROS DE .reduce():
     * - total: El acumulador (la suma parcial)
     * - item: El elemento actual del array
     * - 0: El valor inicial del acumulador
     * 
     * @returns {number} Total en pesos del carrito
     */
    const calcularTotal = () => {
        return carrito.reduce((total, item) => {
            // Para cada item: sumar (precio × cantidad) al total
            return total + (item.precio * item.cantidad);
        }, 0);  // Empezar desde 0
    };
    
    // =========================================================================
    // FUNCIÓN 6: VACIAR EL CARRITO
    // =========================================================================
    /**
     * Elimina todos los servicios del carrito.
     * Se usa después de confirmar un pedido.
     */
    const vaciarCarrito = () => {
        setCarrito([]);  // Establecer como array vacío
    };
    
    // =========================================================================
    // FUNCIÓN 7: AGREGAR PEDIDO AL HISTORIAL
    // =========================================================================
    /**
     * Guarda un pedido finalizado en el historial y vacía el carrito.
     * 
     * @param {object} pedido - Objeto con toda la información del pedido
     */
    const agregarPedido = (pedido) => {
        // PASO 1: Agregar el nuevo pedido al historial
        setPedidos([...pedidos, pedido]);
        
        // PASO 2: Vaciar el carrito
        vaciarCarrito();
    };
    
    // =========================================================================
    // FUNCIÓN 8: CONTAR ITEMS EN EL CARRITO
    // =========================================================================
    /**
     * Cuenta el número TOTAL de items (suma de todas las cantidades).
     * Útil para mostrar el badge del carrito.
     * 
     * @returns {number} Total de items en el carrito
     */
    const contarItems = () => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };
    
    // =========================================================================
    // PROVEEDOR DEL CONTEXTO
    // =========================================================================
    /**
     * CONCEPTO CLAVE: Provider
     * 
     * El Provider es como una "torre de transmisión" que emite todos los datos
     * y funciones que queremos compartir con los componentes.
     * 
     * value={{...}} contiene TODO lo que queremos compartir:
     * - Estados: carrito, pedidos
     * - Funciones: agregarAlCarrito, eliminarDelCarrito, etc.
     * 
     * Los componentes hijos ({children}) se renderizan dentro del Provider
     * y pueden acceder a todo lo que está en "value".
     */
    return (
        <CarritoContext.Provider value={{
            // ESTADOS
            carrito,              // Array de servicios en el carrito
            pedidos,              // Historial de pedidos
            
            // FUNCIONES
            agregarAlCarrito,     // Agregar servicio
            eliminarDelCarrito,   // Eliminar servicio
            actualizarCantidad,   // Cambiar cantidad
            actualizarDetalle,    // Cambiar tamaño, tipo, etc.
            calcularTotal,        // Calcular precio total
            vaciarCarrito,        // Limpiar carrito
            agregarPedido,        // Guardar pedido finalizado
            contarItems           // Contar total de items
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

// -----------------------------------------------------------------------------
// 3. HOOK PERSONALIZADO - useCarrito
// -----------------------------------------------------------------------------
/**
 * Hook personalizado para acceder fácilmente al contexto del carrito.
 * 
 * CONCEPTO: Custom Hook
 * Es una función que encapsula lógica reutilizable.
 * En lugar de escribir useContext(CarritoContext) en cada componente,
 * simplemente escribimos useCarrito().
 * 
 * USO EN OTROS COMPONENTES:
 * ```javascript
 * import { useCarrito } from './CarritoContext';
 * 
 * function MiComponente() {
 *   const { carrito, agregarAlCarrito } = useCarrito();
 *   // Ahora puedes usar carrito y agregarAlCarrito
 * }
 * ```
 * 
 * @returns {object} Objeto con todos los estados y funciones del carrito
 */
export const useCarrito = () => {
    const context = useContext(CarritoContext);
    
    // VALIDACIÓN: Verificar que el componente esté dentro del Provider
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }
    
    return context;
};

// =============================================================================
// RESUMEN DE CONCEPTOS CLAVE:
// =============================================================================
//
// 1. CONTEXT API:
//    - createContext(): Crea el contexto
//    - Provider: Componente que proporciona los datos
//    - useContext(): Hook para consumir el contexto
//
// 2. SPREAD OPERATOR (...):
//    - [...array, nuevoItem]: Agrega item al final del array
//    - { ...objeto, nuevaProp: valor }: Copia objeto y agrega/modifica propiedad
//
// 3. MÉTODOS DE ARRAY:
//    - .find(): Busca el primer elemento que cumple una condición
//    - .filter(): Crea nuevo array con elementos que cumplen una condición
//    - .map(): Transforma cada elemento del array
//    - .reduce(): Acumula valores (suma, concatenación, etc.)
//
// 4. COMPUTED PROPERTY NAMES:
//    - { [variable]: valor }: Usa el valor de la variable como nombre de propiedad
//
// 5. CUSTOM HOOKS:
//    - Funciones que usan hooks de React (useState, useContext, etc.)
//    - Permiten reutilizar lógica entre componentes
//    - Convención: empiezan con "use" (useCarrito, useAuth, etc.)
//
// =============================================================================
//
// FLUJO COMPLETO DE USO:
// =============================================================================
//
// 1. En App.js:
//    <CarritoProvider>
//      <MiApp />
//    </CarritoProvider>
//
// 2. En cualquier componente hijo:
//    const { carrito, agregarAlCarrito } = useCarrito();
//    agregarAlCarrito(servicio);
//
// 3. El estado se actualiza automáticamente en TODOS los componentes
//    que usan useCarrito()
//
// =============================================================================