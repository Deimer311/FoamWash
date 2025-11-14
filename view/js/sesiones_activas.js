/**
 * Sistema de gestión de sesiones activas
 * Conecta con el sistema de login para rastrear y mostrar sesiones en tiempo real
 */

// =============================================================================
// OBTENER SESIONES ACTIVAS DEL SISTEMA
// =============================================================================

function obtenerSesionesActivas() {
    const sesiones = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    return sesiones;
}

function contarSesionesActivas() {
    return obtenerSesionesActivas().length;
}

function obtenerSesionesPorRol(rol) {
    return obtenerSesionesActivas().filter(s => s.role === rol);
}

// =============================================================================
// ACTUALIZACIÓN DEL CONTADOR EN LA INTERFAZ
// =============================================================================

function actualizarContadorSesiones() {
    const contadorElement = document.getElementById('contadorSesiones');
    const sesionesActivas = contarSesionesActivas();
    
    if (contadorElement) {
        contadorElement.textContent = sesionesActivas;
    }
    
    return sesionesActivas;
}

// =============================================================================
// MOSTRAR LISTA DETALLADA DE SESIONES (Para dashboards de admin)
// =============================================================================

function mostrarListaSesiones(containerId = 'listaSesiones') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sesiones = obtenerSesionesActivas();
    
    if (sesiones.length === 0) {
        container.innerHTML = '<p class="sin-sesiones">No hay sesiones activas</p>';
        return;
    }
    
    container.innerHTML = sesiones.map(sesion => {
        const fechaInicio = new Date(sesion.fechaInicio);
        const ultimaActividad = new Date(sesion.ultimaActividad);
        const tiempoTranscurrido = calcularTiempoTranscurrido(fechaInicio);
        
        return `
            <div class="sesion-item" data-sesion-id="${sesion.id}">
                <div class="sesion-header">
                    <span class="sesion-rol ${sesion.role}">${sesion.role.toUpperCase()}</span>
                    <span class="sesion-tiempo">⏱️ ${tiempoTranscurrido}</span>
                </div>
                <div class="sesion-info">
                    <p><strong>Usuario:</strong> ${sesion.email}</p>
                    <p><strong>ID Sesión:</strong> ${sesion.id}</p>
                    <p><strong>Inicio:</strong> ${formatearFecha(fechaInicio)}</p>
                    <p><strong>Última actividad:</strong> ${formatearFecha(ultimaActividad)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================================================
// ESTADÍSTICAS DE SESIONES
// =============================================================================

function obtenerEstadisticasSesiones() {
    const sesiones = obtenerSesionesActivas();
    
    const estadisticas = {
        total: sesiones.length,
        admin: sesiones.filter(s => s.role === 'admin').length,
        trabajador: sesiones.filter(s => s.role === 'trabajador').length,
        cliente: sesiones.filter(s => s.role === 'cliente').length,
        sesiones: sesiones
    };
    
    return estadisticas;
}

function mostrarEstadisticasSesiones(containerId = 'estadisticasSesiones') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = obtenerEstadisticasSesiones();
    
    container.innerHTML = `
        <div class="estadisticas-grid">
            <div class="stat-card total">
                <h3>Total Sesiones</h3>
                <p class="stat-numero">${stats.total}</p>
            </div>
            <div class="stat-card admin">
                <h3>Administradores</h3>
                <p class="stat-numero">${stats.admin}</p>
            </div>
            <div class="stat-card trabajador">
                <h3>Trabajadores</h3>
                <p class="stat-numero">${stats.trabajador}</p>
            </div>
            <div class="stat-card cliente">
                <h3>Clientes</h3>
                <p class="stat-numero">${stats.cliente}</p>
            </div>
        </div>
    `;
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const inicio = new Date(fecha);
    const diferencia = ahora - inicio;
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `${dias}d ${horas % 24}h`;
    if (horas > 0) return `${horas}h ${minutos % 60}m`;
    return `${minutos}m`;
}

function formatearFecha(fecha) {
    return fecha.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// =============================================================================
// SISTEMA DE NOTIFICACIONES (Compatible con servicios_cliente.js)
// =============================================================================

function mostrarNotificacionSesion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificacionContainer');
    if (!container) {
        console.log(mensaje);
        return;
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    
    const iconos = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    
    notificacion.innerHTML = `
        <span class="notificacion-icono">${iconos[tipo] || iconos['info']}</span>
        <span class="notificacion-mensaje">${mensaje}</span>
    `;
    
    container.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => notificacion.classList.add('show'), 10);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 400);
    }, 4000);
}

// =============================================================================
// MONITOREO EN TIEMPO REAL
// =============================================================================

let intervaloMonitoreo = null;

function iniciarMonitoreoSesiones(intervalo = 5000) {
    // Actualizar inmediatamente
    actualizarContadorSesiones();
    
    // Actualizar periódicamente
    if (intervaloMonitoreo) {
        clearInterval(intervaloMonitoreo);
    }
    
    intervaloMonitoreo = setInterval(() => {
        actualizarContadorSesiones();
        
        // Si existe el contenedor de lista, actualizarlo también
        if (document.getElementById('listaSesiones')) {
            mostrarListaSesiones();
        }
        
        // Si existe el contenedor de estadísticas, actualizarlo
        if (document.getElementById('estadisticasSesiones')) {
            mostrarEstadisticasSesiones();
        }
    }, intervalo);
    
    console.log('🔄 Monitoreo de sesiones iniciado');
}

function detenerMonitoreoSesiones() {
    if (intervaloMonitoreo) {
        clearInterval(intervaloMonitoreo);
        intervaloMonitoreo = null;
        console.log('⏸️ Monitoreo de sesiones detenido');
    }
}

// =============================================================================
// VERIFICACIÓN DE SESIÓN ACTUAL
// =============================================================================

function verificarSesionActual() {
    const token = sessionStorage.getItem('authToken');
    const email = sessionStorage.getItem('userEmail');
    
    if (!token || !email) {
        return null;
    }
    
    const sesiones = obtenerSesionesActivas();
    return sesiones.find(s => s.token === token && s.email === email);
}

function mostrarInfoSesionActual(containerId = 'infoSesionActual') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sesion = verificarSesionActual();
    
    if (!sesion) {
        container.innerHTML = '<p>No hay sesión activa</p>';
        return;
    }
    
    const tiempoActivo = calcularTiempoTranscurrido(new Date(sesion.fechaInicio));
    
    container.innerHTML = `
        <div class="sesion-actual">
            <h3>Tu Sesión Activa</h3>
            <p><strong>Rol:</strong> ${sesion.role}</p>
            <p><strong>Tiempo activo:</strong> ${tiempoActivo}</p>
            <p><strong>Última actividad:</strong> ${formatearFecha(new Date(sesion.ultimaActividad))}</p>
        </div>
    `;
}

// =============================================================================
// SIMULACIÓN DE ACTIVIDAD (Para pruebas - OPCIONAL)
// =============================================================================

let simulacionActiva = false;
let intervaloCreacion = null;
let intervaloEliminacion = null;

function iniciarSimulacionSesiones() {
    if (simulacionActiva) {
        mostrarNotificacionSesion('La simulación ya está activa', 'warning');
        return;
    }
    
    simulacionActiva = true;
    console.log('🔄 Simulación de sesiones iniciada');
    mostrarNotificacionSesion('Simulación de sesiones iniciada', 'info');
    
    // Crear sesiones de prueba aleatorias cada 8 segundos
    intervaloCreacion = setInterval(() => {
        if (!simulacionActiva) {
            clearInterval(intervaloCreacion);
            return;
        }
        
        const roles = ['admin', 'trabajador', 'cliente'];
        const rolAleatorio = roles[Math.floor(Math.random() * roles.length)];
        const emailAleatorio = `test_${Date.now()}@test.com`;
        const tokenAleatorio = `token-test-${Date.now()}`;
        
        // Usar la función de login.js si está disponible
        if (typeof registrarSesionActiva === 'function') {
            registrarSesionActiva(emailAleatorio, rolAleatorio, tokenAleatorio);
            mostrarNotificacionSesion(`Nueva sesión ${rolAleatorio} creada`, 'success');
        }
    }, 8000);
    
    // Eliminar sesiones aleatorias cada 12 segundos
    intervaloEliminacion = setInterval(() => {
        if (!simulacionActiva) {
            clearInterval(intervaloEliminacion);
            return;
        }
        
        const sesiones = obtenerSesionesActivas();
        // Solo eliminar sesiones de prueba
        const sesionesPrueba = sesiones.filter(s => s.email.includes('test_'));
        
        if (sesionesPrueba.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * sesionesPrueba.length);
            const sesionEliminar = sesionesPrueba[indiceAleatorio];
            
            if (typeof eliminarSesionActiva === 'function') {
                eliminarSesionActiva(sesionEliminar.token);
                mostrarNotificacionSesion(`Sesión ${sesionEliminar.role} cerrada`, 'warning');
            }
        }
    }, 12000);
}

function detenerSimulacionSesiones() {
    simulacionActiva = false;
    
    if (intervaloCreacion) {
        clearInterval(intervaloCreacion);
        intervaloCreacion = null;
    }
    
    if (intervaloEliminacion) {
        clearInterval(intervaloEliminacion);
        intervaloEliminacion = null;
    }
    
    console.log('⏸️ Simulación de sesiones detenida');
    mostrarNotificacionSesion('Simulación de sesiones detenida', 'info');
}

// =============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Sistema de sesiones activas inicializado');
    
    // Iniciar monitoreo automático
    iniciarMonitoreoSesiones();
    
    // Mostrar información si los contenedores existen
    if (document.getElementById('listaSesiones')) {
        mostrarListaSesiones();
    }
    
    if (document.getElementById('estadisticasSesiones')) {
        mostrarEstadisticasSesiones();
    }
    
    if (document.getElementById('infoSesionActual')) {
        mostrarInfoSesionActual();
    }
});

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    detenerMonitoreoSesiones();
    detenerSimulacionSesiones();
});