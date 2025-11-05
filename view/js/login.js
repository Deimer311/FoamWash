// =============================================================================
// SIMULACIÓN DE AUTENTICACIÓN Y ROLES
// =============================================================================

// Base de datos simulada de usuarios predefinidos
const USERS_DB = {
    "admin@gmail.com": { 
        password: "123456", 
        role: "admin", 
        token: "token-admin-12345", 
        redirect: "./admin/dashboard.html" 
    },
    "trabajador@gmail.com": { 
        password: "123456", 
        role: "trabajador", 
        token: "token-trabajador-67890", 
        redirect: "./tareas.html" 
    },
    "cliente@gmail.com": { 
        password: "123456", 
        role: "cliente", 
        token: "token-cliente-abcde", 
        redirect: "./servicios_cliente.html" 
    }
};

// Función para mostrar mensajes en los formularios
function displayMessage(elementId, message, isError = false) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.className = 'message-area';
    if (message) {
        messageElement.classList.add(isError ? 'error-message' : 'success-message');
    }
}

// Función que simula el inicio de sesión
function simulateLogin(email, password) {
    const user = USERS_DB[email];

    if (!user) {
        return { success: false, message: "Correo o contraseña incorrectos." };
    }

    if (user.password !== password) {
        return { success: false, message: "Correo o contraseña incorrectos." };
    }

    return {
        success: true,
        message: `¡Bienvenido, ${user.role}! Redireccionando...`,
        role: user.role,
        token: user.token,
        redirect: user.redirect,
        email: email
    };
}

// =============================================================================
// GESTIÓN DE SESIONES ACTIVAS
// =============================================================================

// Función para registrar una nueva sesión activa
function registrarSesionActiva(email, role, token) {
    const sesion = {
        id: `SESSION-${Date.now()}`,
        email: email,
        role: role,
        token: token,
        fechaInicio: new Date().toISOString(),
        ultimaActividad: new Date().toISOString()
    };
    
    // Guardar en localStorage (simulación de sesiones activas del sistema)
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    // Verificar si ya existe una sesión para este usuario
    const sesionExistente = sesionesActivas.findIndex(s => s.email === email);
    
    if (sesionExistente !== -1) {
        // Actualizar sesión existente
        sesionesActivas[sesionExistente] = sesion;
        console.log('🔄 Sesión existente actualizada:', sesion.id);
    } else {
        // Agregar nueva sesión
        sesionesActivas.push(sesion);
        console.log('✅ Nueva sesión registrada:', sesion.id);
    }
    
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    
    return sesion;
}

// Función para actualizar la última actividad de la sesión
function actualizarActividadSesion(token) {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    const sesion = sesionesActivas.find(s => s.token === token);
    if (sesion) {
        sesion.ultimaActividad = new Date().toISOString();
        localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    }
}

// Función para eliminar una sesión activa
function eliminarSesionActiva(token) {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    
    const sesionEliminada = sesionesActivas.find(s => s.token === token);
    sesionesActivas = sesionesActivas.filter(s => s.token !== token);
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
    
    if (sesionEliminada) {
        console.log('❌ Sesión eliminada:', sesionEliminada.id);
    }
}

// Función para limpiar sesiones expiradas (más de 2 horas sin actividad)
function limpiarSesionesExpiradas() {
    let sesionesActivas = JSON.parse(localStorage.getItem('sesionesActivas') || '[]');
    const ahora = new Date().getTime();
    const dosHoras = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    
    const sesionesOriginales = sesionesActivas.length;
    sesionesActivas = sesionesActivas.filter(sesion => {
        const ultimaActividad = new Date(sesion.ultimaActividad).getTime();
        return (ahora - ultimaActividad) < dosHoras;
    });
    
    const sesionesEliminadas = sesionesOriginales - sesionesActivas.length;
    if (sesionesEliminadas > 0) {
        console.log(`🧹 ${sesionesEliminadas} sesiones expiradas eliminadas`);
    }
    
    localStorage.setItem('sesionesActivas', JSON.stringify(sesionesActivas));
}

// =============================================================================
// VERIFICACIÓN DE SESIÓN ACTIVA
// =============================================================================

// Función para verificar si hay una sesión activa
function checkActiveSession() {
    const token = sessionStorage.getItem('authToken');
    const role = sessionStorage.getItem('userRole');
    const email = sessionStorage.getItem('userEmail');
    
    if (!token || !role) {
        return { isActive: false };
    }
    
    // Actualizar actividad de la sesión
    actualizarActividadSesion(token);
    
    return {
        isActive: true,
        token: token,
        role: role,
        email: email
    };
}

// Función para proteger páginas que requieren autenticación
function protectPage(allowedRoles = []) {
    const session = checkActiveSession();
    
    if (!session.isActive) {
        // No hay sesión activa, redirigir al login
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = './index.html';
        return false;
    }
    
    // Si se especifican roles permitidos, verificar el rol del usuario
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = './index.html';
        return false;
    }
    
    console.log('✅ Acceso autorizado:', session.role, '-', session.email);
    return session;
}

// Función para cerrar sesión
function logout() {
    const token = sessionStorage.getItem('authToken');
    const email = sessionStorage.getItem('userEmail');
    
    // Eliminar sesión activa del registro
    if (token) {
        eliminarSesionActiva(token);
    }
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    
    console.log('👋 Sesión cerrada:', email);
    
    // Redirigir a index.html en la carpeta view
    window.location.href = './index.html';
}

// =============================================================================
// MANEJO DE EVENTOS DEL FORMULARIO DE INICIO DE SESIÓN
// =============================================================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        displayMessage('loginMessage', '');

        const result = simulateLogin(email, password);

        if (result.success) {
            displayMessage('loginMessage', result.message, false);

            // Guardar en sessionStorage
            sessionStorage.setItem('authToken', result.token);
            sessionStorage.setItem('userRole', result.role);
            sessionStorage.setItem('userEmail', result.email);
            
            // Registrar sesión activa en el sistema
            registrarSesionActiva(result.email, result.role, result.token);
            
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1500); 

        } else {
            displayMessage('loginMessage', result.message, true);
        }
    });
}

// =============================================================================
// MANEJO DE EVENTOS DEL FORMULARIO DE REGISTRO
// =============================================================================

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const inputs = registerForm.querySelectorAll('input');
        const email = inputs[0].value.trim();
        const fullName = inputs[1].value.trim();
        const phone = inputs[2].value.trim();
        const password = inputs[4].value.trim();

        displayMessage('registerMessage', '');

        if (USERS_DB[email]) {
            displayMessage('registerMessage', "El correo electrónico ya está registrado.", true);
            return;
        }

        if (password.length < 6) {
            displayMessage('registerMessage', "La contraseña debe tener al menos 6 caracteres.", true);
            return;
        }

        const newUserToken = `token-new-client-${Date.now()}`;
        const newUser = {
            password: password,
            role: "cliente",
            token: newUserToken,
            redirect: "./servicios_cliente.html",
            fullName: fullName,
            phone: phone
        };
        
        USERS_DB[email] = newUser;
        
        displayMessage('registerMessage', "Registro exitoso. Iniciando sesión...", false);

        // Guardar en sessionStorage
        sessionStorage.setItem('authToken', newUser.token);
        sessionStorage.setItem('userRole', newUser.role);
        sessionStorage.setItem('userEmail', email);
        
        // Registrar sesión activa en el sistema
        registrarSesionActiva(email, newUser.role, newUser.token);

        setTimeout(() => {
            registerForm.reset();
            window.location.href = newUser.redirect;
        }, 1500); 
    });
}

// =============================================================================
// LÓGICA DE INTERFAZ: SWITCH ENTRE LOGIN Y REGISTER
// =============================================================================

function setupToggleButtons() {
    const cardWrapper = document.querySelector('.card-wrapper');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');

    if (switchToRegisterBtn && cardWrapper) {
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cardWrapper.classList.add('register-active');
        });
    }

    if (switchToLoginBtn && cardWrapper) {
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cardWrapper.classList.remove('register-active');
        });
    }
}

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

// Limpiar sesiones expiradas al cargar la página
limpiarSesionesExpiradas();

// Ejecutar la función cuando el DOM esté listo
setupToggleButtons();

console.log('🔐 Sistema de autenticación inicializado');