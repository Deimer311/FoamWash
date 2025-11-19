// =============================================================================
// SEARCHSECTIONCLIENTE.JSX - BARRA DE BÚSQUEDA DE SERVICIOS
// =============================================================================
// Este componente permite al usuario buscar servicios por nombre, descripción o precio.
// Implementa búsqueda en tiempo real (mientras escribe).
//
// CARACTERÍSTICAS:
// - Búsqueda en tiempo real (sin botón)
// - Placeholder descriptivo
// - Icono de búsqueda
// - Manejo de Enter para búsqueda explícita
// =============================================================================

import React, { useState } from 'react';

/**
 * COMPONENTE: SearchSectionCliente
 * 
 * PROPS:
 * @param {string} searchQuery - Valor actual de la búsqueda (controlado por el padre)
 * @param {function} onSearch - Función que se ejecuta cuando cambia la búsqueda
 * 
 * CONCEPTO: Componente Controlado
 * El estado de la búsqueda está en el componente PADRE (ServiciosClientePage)
 * Este componente solo muestra el input y reporta cambios al padre.
 * 
 * ¿POR QUÉ?
 * - El padre necesita el término de búsqueda para filtrar los servicios
 * - Mantener el estado arriba permite compartirlo con otros componentes
 * - Pattern común en React: "Lifting State Up" (elevar el estado)
 */
const SearchSectionCliente = ({ searchQuery, onSearch }) => {
    
    // =========================================================================
    // 1. ESTADOS LOCALES (SOLO PARA UI)
    // =========================================================================
    
    // Estado para el efecto focus (cuando el input está activo)
    const [isFocused, setIsFocused] = useState(false);
    
    // =========================================================================
    // 2. MANEJADORES DE EVENTOS
    // =========================================================================
    
    /**
     * Maneja cambios en el input de búsqueda
     * Se ejecuta cada vez que el usuario escribe una letra
     * 
     * FLUJO:
     * 1. Usuario escribe "lav"
     * 2. onChange se dispara
     * 3. onSearch("lav") notifica al padre
     * 4. Padre actualiza su estado searchQuery
     * 5. Padre filtra servicios que contienen "lav"
     * 6. ServicesGrid se re-renderiza con servicios filtrados
     * 
     * @param {Event} e - Evento del input
     */
    const handleInputChange = (e) => {
        // Obtener el valor actual del input
        const valor = e.target.value;
        
        // Notificar al padre del cambio
        onSearch(valor);
    };
    
    /**
     * Maneja el clic en el botón de búsqueda
     * Útil si queremos agregar funcionalidad extra al hacer clic explícito
     */
    const handleSearchClick = () => {
        console.log('Búsqueda explícita:', searchQuery);
        // Por ahora solo log, pero podrías agregar analytics, etc.
    };
    
    /**
     * Maneja la tecla Enter en el input
     * Permite que el usuario presione Enter para "confirmar" búsqueda
     * 
     * @param {KeyboardEvent} e - Evento del teclado
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // Evitar submit de formulario si existe
            handleSearchClick();
        }
    };
    
    // =========================================================================
    // 3. ESTILOS
    // =========================================================================
    
    // Estilo del contenedor principal
    const sectionStyle = {
        background: 'white',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0'  // Separador sutil
    };
    
    // Estilo del contenedor del input y botón
    const containerStyle = {
        position: 'relative',  // Para posicionar el botón absolutamente
        width: '100%',
        maxWidth: '600px'  // Limitar ancho máximo en pantallas grandes
    };
    
    // Estilo del input con efectos dinámicos
    const inputStyle = {
        width: '100%',
        padding: '15px 50px 15px 20px',  // Espacio extra a la derecha para el botón
        fontSize: '16px',
        border: isFocused 
            ? '2px solid #5BC0DE'  // Borde celeste cuando está enfocado
            : '2px solid #ddd',    // Borde gris normal
        borderRadius: '30px',      // Bordes redondeados
        outline: 'none',           // Quitar outline por defecto
        transition: 'all 0.3s ease',
        boxShadow: isFocused 
            ? '0 0 15px rgba(91, 192, 222, 0.3)'  // Sombra al enfocar
            : 'none',
        fontFamily: 'Arial, sans-serif'
    };
    
    // Estilo del botón de búsqueda (ícono)
    const buttonStyle = {
        position: 'absolute',   // Posición absoluta dentro del contenedor
        right: '15px',          // 15px desde el borde derecho
        top: '50%',             // Centrar verticalmente
        transform: 'translateY(-50%)',  // Ajustar para centrado perfecto
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: isFocused ? '#5BC0DE' : '#666',  // Cambiar color al enfocar
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };
    
    // =========================================================================
    // 4. RENDERIZADO
    // =========================================================================
    /**
     * ESTRUCTURA HTML:
     * 
     * <section> (contenedor principal)
     *   └── <div> (contenedor del input/botón)
     *         ├── <input> (campo de búsqueda)
     *         └── <button> (icono de lupa)
     */
    
    return (
        <section style={sectionStyle}>
            <div style={containerStyle}>
                {/* 
                    INPUT DE BÚSQUEDA
                    
                    IMPORTANTE: Es un "input controlado"
                    - value={searchQuery}: El valor viene del padre
                    - onChange={handleInputChange}: Reporta cambios al padre
                    
                    ¿POR QUÉ value={searchQuery}?
                    - React controla el valor del input
                    - El input muestra lo que está en el estado del padre
                    - Si el padre resetea searchQuery a '', el input se limpia automáticamente
                */}
                <input 
                    type="text" 
                    placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                    aria-label="Buscar servicios"  // Accesibilidad
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    style={inputStyle}
                    // EVENTOS DE FOCUS para efectos visuales
                    onFocus={() => setIsFocused(true)}   // Input enfocado
                    onBlur={() => setIsFocused(false)}   // Input desenfocado
                />
                
                {/* 
                    BOTÓN DE BÚSQUEDA (ÍCONO DE LUPA)
                    
                    Posicionado absolutamente dentro del input
                    Visualmente parece parte del input
                */}
                <button 
                    type="button"
                    aria-label="Buscar"  // Accesibilidad
                    onClick={handleSearchClick}
                    style={buttonStyle}
                    // EFECTOS HOVER
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1.2)';
                        e.target.style.color = '#5BC0DE';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                        e.target.style.color = isFocused ? '#5BC0DE' : '#666';
                    }}
                >
                    🔍
                </button>
            </div>
        </section>
    );
};

export default SearchSectionCliente;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
//
// 1. INPUTS CONTROLADOS:
//    - value={estado} + onChange={actualizaEstado}
//    - React es la "fuente única de verdad" del valor
//    - El input siempre refleja el estado
//
// 2. LIFTING STATE UP (Elevar el Estado):
//    - El estado searchQuery está en el componente PADRE
//    - Este componente solo "reporta" cambios
//    - Permite que múltiples componentes accedan al mismo dato
//
// 3. EVENTOS DE TECLADO:
//    - onKeyDown: Se ejecuta al presionar cualquier tecla
//    - e.key: Qué tecla se presionó ('Enter', 'Escape', 'a', etc.)
//    - Útil para atajos de teclado
//
// 4. EVENTOS DE FOCUS:
//    - onFocus: Cuando el input recibe foco (clic o Tab)
//    - onBlur: Cuando el input pierde foco
//    - Útil para efectos visuales y validaciones
//
// 5. POSICIONAMIENTO ABSOLUTO:
//    - position: 'absolute' en el hijo
//    - position: 'relative' en el padre
//    - El hijo se posiciona relativamente al padre
//
// 6. CENTRADO CON TRANSFORM:
//    - top: '50%' + transform: 'translateY(-50%)'
//    - Truco para centrar verticalmente sin conocer la altura
//    - Funciona porque translateY usa el tamaño del elemento mismo
//
// 7. PLACEHOLDER DESCRIPTIVO:
//    - placeholder con ejemplos concretos
//    - Ayuda al usuario a entender qué puede buscar
//    - Mejor UX que un placeholder genérico
//
// 8. ARIA-LABEL:
//    - Atributo de accesibilidad
//    - Describe el propósito del elemento para lectores de pantalla
//    - Importante para usuarios con discapacidades visuales
//
// =============================================================================
//
// FLUJO COMPLETO DE BÚSQUEDA:
// =============================================================================
//
// 1. Usuario hace clic en el input
//    ↓
// 2. onFocus ejecuta setIsFocused(true)
//    ↓
// 3. Estilos cambian (borde celeste, sombra)
//    ↓
// 4. Usuario escribe "lava"
//    ↓
// 5. onChange se ejecuta 4 veces (una por cada letra)
//    ↓
// 6. handleInputChange llama a onSearch("l"), onSearch("la"), ...
//    ↓
// 7. Componente padre actualiza su estado searchQuery
//    ↓
// 8. Padre filtra servicios basándose en searchQuery
//    ↓
// 9. Servicios filtrados se pasan a ServicesGrid
//    ↓
// 10. ServicesGrid se re-renderiza con resultados filtrados
//     ↓
// 11. Usuario ve solo servicios que contienen "lava"
//
// =============================================================================
//
// MEJORAS OPCIONALES (PARA IMPLEMENTAR DESPUÉS):
// =============================================================================
//
// 1. DEBOUNCING:
//    - Esperar a que el usuario termine de escribir antes de buscar
//    - Evita búsquedas innecesarias mientras escribe
//    - Usar setTimeout y clearTimeout
//
// 2. BÚSQUEDA POR VOZ:
//    - Web Speech API
//    - Botón de micrófono
//
// 3. AUTOCOMPLETADO:
//    - Mostrar sugerencias mientras escribe
//    - Dropdown con resultados previos
//
// 4. HISTORIAL DE BÚSQUEDAS:
//    - Guardar búsquedas recientes
//    - Mostrar al hacer foco en el input
//
// 5. FILTROS AVANZADOS:
//    - Rango de precio
//    - Duración del servicio
//    - Categorías
//
// =============================================================================