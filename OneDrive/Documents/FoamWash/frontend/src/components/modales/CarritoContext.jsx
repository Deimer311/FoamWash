// =============================================================================
// ARCHIVO  : CarritoContext.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/modales/CarritoContext.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Contexto global del carrito de servicios. Provee agregar, actualizar cantidad y limpiar el carrito.
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// 1. CREAR EL CONTEXTO
// -----------------------------------------------------------------------------
const CarritoContext = createContext();

// -----------------------------------------------------------------------------
// 2. KEYS DE LOCALSTORAGE
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
    CARRITO: 'foamwash_carrito',
    PEDIDOS: 'foamwash_pedidos'
};

// -----------------------------------------------------------------------------
// 3. PROVIDER - PROVEEDOR DE DATOS
// -----------------------------------------------------------------------------
export const CarritoProvider = ({ children }) => {
    
    // =========================================================================
    // ESTADOS DEL CARRITO CON PERSISTENCIA
    // =========================================================================
    
    // Estado principal: array de servicios en el carrito
    // Se carga desde localStorage al iniciar
    const [carrito, setCarrito] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CARRITO);
            const parsed = saved ? JSON.parse(saved) : [];
            console.log('🔄 Carrito cargado desde localStorage:', parsed.length, 'items');
            return parsed;
        } catch (e) {
            console.error('❌ Error cargando carrito:', e);
            return [];
        }
    });
    
    // Estado para guardar los pedidos finalizados
    const [pedidos, setPedidos] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
            const parsed = saved ? JSON.parse(saved) : [];
            console.log('🔄 Pedidos cargados desde localStorage:', parsed.length, 'pedidos');
            return parsed;
        } catch (e) {
            console.error('❌ Error cargando pedidos:', e);
            return [];
        }
    });
    
    // =========================================================================
    // EFECTOS: SINCRONIZAR CON LOCALSTORAGE
    // =========================================================================
    
    // Guardar carrito cuando cambie
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.CARRITO, JSON.stringify(carrito));
            console.log('💾 Carrito guardado:', carrito.length, 'items');
        } catch (e) {
            console.error('❌ Error guardando carrito:', e);
        }
    }, [carrito]);
    
    // Guardar pedidos cuando cambien
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
            console.log('💾 Pedidos guardados:', pedidos.length, 'pedidos');
        } catch (e) {
            console.error('❌ Error guardando pedidos:', e);
        }
    }, [pedidos]);
    
    // =========================================================================
    // FUNCIÓN 1: AGREGAR SERVICIO AL CARRITO
    // =========================================================================
    const agregarAlCarrito = (servicio) => {
        console.log('🛒 Agregando al carrito:', servicio);
        
        // Validar que el servicio tenga los campos necesarios
        if (!servicio || !servicio.id) {
            console.error('❌ Servicio inválido:', servicio);
            return false;
        }
        
        setCarrito(prevCarrito => {
            const servicioExistente = prevCarrito.find(item => item.id === servicio.id);
            
            if (servicioExistente) {
                // Si existe, aumentar cantidad
                console.log('📦 Servicio existente, aumentando cantidad');
                return prevCarrito.map(item =>
                    item.id === servicio.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            } else {
                // Si no existe, agregarlo nuevo
                console.log('✨ Nuevo servicio agregado');
                return [...prevCarrito, { 
                    ...servicio, 
                    cantidad: 1,
                    tamano: servicio.tamano || '',
                    fechaAgregado: new Date().toISOString()
                }];
            }
        });
        
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 2: ELIMINAR SERVICIO DEL CARRITO
    // =========================================================================
    const eliminarDelCarrito = (servicioId) => {
        console.log('🗑️ Eliminando del carrito:', servicioId);
        
        setCarrito(prevCarrito => 
            prevCarrito.filter(item => item.id !== servicioId)
        );
        
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 3: ACTUALIZAR CANTIDAD
    // =========================================================================
    const actualizarCantidad = (servicioId, nuevaCantidad) => {
        console.log('🔢 Actualizando cantidad:', servicioId, nuevaCantidad);
        
        if (nuevaCantidad <= 0) {
            return eliminarDelCarrito(servicioId);
        }
        
        setCarrito(prevCarrito =>
            prevCarrito.map(item =>
                item.id === servicioId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            )
        );
        
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 4: ACTUALIZAR DETALLES (TAMAÑO, ETC.)
    // =========================================================================
    const actualizarDetalle = (servicioId, campo, valor) => {
        console.log('✏️ Actualizando detalle:', servicioId, campo, valor);
        
        setCarrito(prevCarrito =>
            prevCarrito.map(item =>
                item.id === servicioId
                    ? { ...item, [campo]: valor }
                    : item
            )
        );
        
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 5: CALCULAR TOTAL DEL CARRITO
    // =========================================================================
    const calcularTotal = () => {
        const total = carrito.reduce((sum, item) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            return sum + (precio * cantidad);
        }, 0);
        
        return total;
    };
    
    // =========================================================================
    // FUNCIÓN 6: VACIAR EL CARRITO
    // =========================================================================
    const vaciarCarrito = () => {
        console.log('🧹 Vaciando carrito');
        setCarrito([]);
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 7: AGREGAR PEDIDO AL HISTORIAL
    // =========================================================================
    const agregarPedido = (pedido) => {
        console.log('📝 Agregando pedido:', pedido);
        
        // Validar pedido
        if (!pedido || !pedido.servicios || pedido.servicios.length === 0) {
            console.error('❌ Pedido inválido');
            return false;
        }
        
        // Crear pedido con ID único si no lo tiene
        const nuevoPedido = {
            ...pedido,
            id: pedido.id || `PED-${Date.now()}`,
            fechaCreacion: pedido.fechaCreacion || new Date().toISOString(),
            estado: pedido.estado || 'Pendiente'
        };
        
        setPedidos(prevPedidos => [...prevPedidos, nuevoPedido]);
        vaciarCarrito();
        
        console.log('✅ Pedido agregado exitosamente:', nuevoPedido.id);
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 8: OBTENER CANTIDAD TOTAL DE ITEMS
    // =========================================================================
    const obtenerCantidadTotal = () => {
        return carrito.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);
    };
    
    // =========================================================================
    // FUNCIÓN 9: VERIFICAR SI UN SERVICIO ESTÁ EN EL CARRITO
    // =========================================================================
    const estaEnCarrito = (servicioId) => {
        return carrito.some(item => item.id === servicioId);
    };
    
    // =========================================================================
    // FUNCIÓN 10: OBTENER PEDIDO POR ID
    // =========================================================================
    const obtenerPedido = (pedidoId) => {
        return pedidos.find(p => p.id === pedidoId);
    };
    
    // =========================================================================
    // FUNCIÓN 11: ACTUALIZAR ESTADO DE PEDIDO
    // =========================================================================
    const actualizarEstadoPedido = (pedidoId, nuevoEstado) => {
        console.log('🔄 Actualizando estado pedido:', pedidoId, nuevoEstado);
        
        setPedidos(prevPedidos =>
            prevPedidos.map(pedido =>
                pedido.id === pedidoId
                    ? { 
                        ...pedido, 
                        estado: nuevoEstado, 
                        fechaActualizacion: new Date().toISOString() 
                    }
                    : pedido
            )
        );
        
        return true;
    };
    
    // =========================================================================
    // FUNCIÓN 12: LIMPIAR TODO (útil para testing o logout)
    // =========================================================================
    const limpiarTodo = () => {
        console.log('🧹 Limpiando todo el carrito y pedidos');
        setCarrito([]);
        setPedidos([]);
        localStorage.removeItem(STORAGE_KEYS.CARRITO);
        localStorage.removeItem(STORAGE_KEYS.PEDIDOS);
        return true;
    };
    
    // =========================================================================
    // PROVEEDOR DEL CONTEXTO
    // =========================================================================
    return (
        <CarritoContext.Provider value={{
            // ESTADOS
            carrito,                    // Array de servicios en el carrito
            pedidos,                    // Historial de pedidos
            
            // FUNCIONES BÁSICAS DEL CARRITO
            agregarAlCarrito,           // Agregar servicio
            eliminarDelCarrito,         // Eliminar servicio
            actualizarCantidad,         // Cambiar cantidad
            actualizarDetalle,          // Cambiar tamaño, etc.
            calcularTotal,              // Calcular precio total
            vaciarCarrito,              // Limpiar carrito
            
            // FUNCIONES DE PEDIDOS
            agregarPedido,              // Guardar pedido finalizado
            obtenerPedido,              // Obtener pedido por ID
            actualizarEstadoPedido,     // Cambiar estado de pedido
            
            // FUNCIONES DE UTILIDAD
            obtenerCantidadTotal,       // Total de items en carrito
            estaEnCarrito,              // Verificar si servicio está en carrito
            limpiarTodo                 // Limpiar todo (testing/logout)
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

// -----------------------------------------------------------------------------
// 4. HOOK PERSONALIZADO - useCarrito
// -----------------------------------------------------------------------------
export const useCarrito = () => {
    const context = useContext(CarritoContext);
    
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }
    
    return context;
};

// -----------------------------------------------------------------------------
// 5. EXPORTAR TAMBIÉN EL CONTEXTO (OPCIONAL)
// -----------------------------------------------------------------------------
export default CarritoContext;