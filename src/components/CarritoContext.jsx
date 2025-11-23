// =============================================================================
// CARRITOCONTEXT.JSX - GESTOR GLOBAL DEL CARRITO (SIMPLIFICADO)
// =============================================================================
// Versión simplificada sin la función contarItems
// Los componentes calculan la cantidad directamente desde el array carrito
// =============================================================================

import React, { createContext, useContext, useState } from 'react';

// -----------------------------------------------------------------------------
// 1. CREAR EL CONTEXTO
// -----------------------------------------------------------------------------
const CarritoContext = createContext();

// -----------------------------------------------------------------------------
// 2. PROVIDER - PROVEEDOR DE DATOS
// -----------------------------------------------------------------------------
export const CarritoProvider = ({ children }) => {
    
    // =========================================================================
    // ESTADOS DEL CARRITO
    // =========================================================================
    
    // Estado principal: array de servicios en el carrito
    const [carrito, setCarrito] = useState([]);
    
    // Estado para guardar los pedidos finalizados
    const [pedidos, setPedidos] = useState([]);
    
    // =========================================================================
    // FUNCIÓN 1: AGREGAR SERVICIO AL CARRITO
    // =========================================================================
    const agregarAlCarrito = (servicio) => {
        const servicioExistente = carrito.find(item => item.id === servicio.id);
        
        if (servicioExistente) {
            // Si existe, aumentar cantidad
            setCarrito(carrito.map(item =>
                item.id === servicio.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            // Si no existe, agregarlo nuevo
            setCarrito([...carrito, { 
                ...servicio, 
                cantidad: 1, 
                tamano: '', 
                tipoLavado: '' 
            }]);
        }
    };
    
    // =========================================================================
    // FUNCIÓN 2: ELIMINAR SERVICIO DEL CARRITO
    // =========================================================================
    const eliminarDelCarrito = (servicioId) => {
        setCarrito(carrito.filter(item => item.id !== servicioId));
    };
    
    // =========================================================================
    // FUNCIÓN 3: ACTUALIZAR CANTIDAD
    // =========================================================================
    const actualizarCantidad = (servicioId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(servicioId);
        } else {
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
    const actualizarDetalle = (servicioId, campo, valor) => {
        setCarrito(carrito.map(item =>
            item.id === servicioId
                ? { ...item, [campo]: valor }
                : item
        ));
    };
    
    // =========================================================================
    // FUNCIÓN 5: CALCULAR TOTAL DEL CARRITO
    // =========================================================================
    const calcularTotal = () => {
        return carrito.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
    };
    
    // =========================================================================
    // FUNCIÓN 6: VACIAR EL CARRITO
    // =========================================================================
    const vaciarCarrito = () => {
        setCarrito([]);
    };
    
    // =========================================================================
    // FUNCIÓN 7: AGREGAR PEDIDO AL HISTORIAL
    // =========================================================================
    const agregarPedido = (pedido) => {
        setPedidos([...pedidos, pedido]);
        vaciarCarrito();
    };
    
    // =========================================================================
    // PROVEEDOR DEL CONTEXTO
    // =========================================================================
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
            agregarPedido         // Guardar pedido finalizado
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

// -----------------------------------------------------------------------------
// 3. HOOK PERSONALIZADO - useCarrito
// -----------------------------------------------------------------------------
export const useCarrito = () => {
    const context = useContext(CarritoContext);
    
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }
    
    return context;
};

// =============================================================================
// NOTA: ELIMINAMOS contarItems()
// =============================================================================
//
// ¿POR QUÉ?
// - No es necesario tener una función específica para contar items
// - Los componentes pueden calcular la cantidad directamente desde el array
// - Código más simple y fácil de entender
//
// CÓMO CALCULAR LA CANTIDAD EN LOS COMPONENTES:
// const { carrito } = useCarrito();
// const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
//
// =============================================================================