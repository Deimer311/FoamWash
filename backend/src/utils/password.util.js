/**
 * =============================================================================
 * UTILIDADES DE CONTRASEÑAS
 * Este módulo maneja todo lo relacionado con el hash y verificación de contraseñas
 * usando bcrypt, que es el estándar de la industria para almacenar contraseñas de forma segura.
 *------------------------------------------------------------------------------
 * ¿Por qué bcrypt?
 * - Genera un hash único incluso para contraseñas iguales (usa salt)
 * - Es lento intencionalmente para prevenir ataques de fuerza bruta
 * - El costo computacional se puede ajustar (salt rounds)
 * ------------------------------------------------------------------------------
 * FUNCIONES INCLUIDAS:
 * 1. hashPassword(password): Hashea una contraseña en texto plano.
 * 2. comparePassword(plainPassword, hashedPassword): Compara una contraseña en texto plano con un hash.
 * 3. validatePasswordStrength(password): Valida la fortaleza de una contraseña según criterios definidos.
 * 4. generateRandomPassword(length): Genera una contraseña aleatoria segura de longitud especificada.
 * -----------------------------------------------------------------------------
 * MANTENIMIENTO:
 * - Asegúrate de mantener bcrypt actualizado para beneficiarte de mejoras de seguridad.
 * - Revisa y ajusta los criterios de validación de contraseñas según las políticas de seguridad vigentes.
 * -----------------------------------------------------------------------------
 * guadado en src/utils/password.util.js
 * ultima actualizacion 5 de diciembre de 2025
 * =============================================================================
 */

const bcrypt = require('bcryptjs')

/**
 * 🔒 HASHEAR CONTRASEÑA
 *
 * Convierte una contraseña en texto plano a un hash seguro que se puede almacenar en la BD.
 *
 * @param {string} password - Contraseña en texto plano del usuario
 * @returns {Promise<string>} - Hash de la contraseña
 *
 * @example
 * const hashedPassword = await hashPassword('miContraseña123');
 * //Resultado: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
 *
 * Nota: Cada vez que ejecutas esto con la misma contraseña, obtienes un hash diferente
 * gracias al "salt" único que bcrypt genera automáticamente.
 */

const hashPassword = async (password) => {
    try {
        // Salt rounds = 10 significa que el algoritmo se ejecuta 2^10 (1024) veces
        // Más rounds = más seguro pero más lento
        // 10 es el balance recomendado por bcrypt
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        
        // bcrypt.hash genera automáticamente el salt y lo incluye en el hash final
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        return hashedPassword;
    } catch (error) {
        // Si hay un error en el hashing, lanzamos un error descriptivo
        throw new Error(`Error al hashear contraseña: ${error.message}`);
    }
};
/**
 *  COMPARAR CONTRASEÑA
 *
 * Verifica si una contraseña en texto plano coincide con un hash almacenado.
 * NO se puede "revertir" el hash, solo comparar.
 *
 * @param {string} plainPassword - Contraseña en texto plano que el usuario ingresó
 * @param {string} hashedPassword - Hash almacenado en la base de datos
 * @returns {Promise<boolean>} - true si coinciden, false si no
 *
 * @example
 * const isValid = await comparePassword('miContraseña123', hashedPasswordFromDB);
 * if (isValid) {
 *   console.log('¡Contraseña correcta!');
 * } else {
 *   console.log('Contraseña incorrecta');
 * }
 *------------------------------------------------------------------------------
 * ¿Cómo funciona?
 * 1. bcrypt extrae el salt del hash almacenado
 * 2. Hashea la contraseña ingresada con ese mismo salt
 * 3. Compara ambos hashes
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        // bcrypt.compare hace todo el trabajo pesado de comparación
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        
        return isMatch;
    } catch (error) {
        // Si hay un error en la comparación, lanzamos un error descriptivo
        throw new Error(`Error al comparar contraseña: ${error.message}`);
    }
};
/**
 *  VALIDAR FORTALEZA DE CONTRASEÑA
 *
 * Verifica que una contraseña cumpla con los requisitos mínimos de seguridad.
 *
 * @param {string} password - Contraseña a validar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 *
 * @example
 * const validation = validatePasswordStrength('abc');
 * // { isValid: false, errors: ['Debe tener al menos 6 caracteres'] }
 *
 * const validation = validatePasswordStrength('MiContraseña123!');
 * // { isValid: true, errors: [] }
 */
    const validatePasswordStrength = (password) => {
        const errors = [];
        
        // Requisito 1: Longitud mínima
        if (!password || password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Requisito 2: Longitud máxima (para evitar ataques DoS)
        if (password && password.length > 128) {
            errors.push('La contraseña no puede tener más de 128 caracteres');
        }
        
        // Requisitos opcionales (descomentarlos si los necesitas):
        
        // // Debe contener al menos una letra minúscula
        // if (!/[a-z]/.test(password)) {
        //   errors.push('Debe contener al menos una letra minúscula');
        // }
        
        // // Debe contener al menos una letra mayúscula
        // if (!/[A-Z]/.test(password)) {
        //   errors.push('Debe contener al menos una letra mayúscula');
        // }
        
        // // Debe contener al menos un número
        // if (!/\d/.test(password)) {
        //   errors.push('Debe contener al menos un número');
        // }
        
        // // Debe contener al menos un carácter especial
        // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        //   errors.push('Debe contener al menos un carácter especial');
        // }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    };

/**
 *  GENERAR CONTRASEÑA ALEATORIA SEGURA
 * 
 * Útil para:
 * - Reseteo de contraseñas temporales
 * - Generación de tokens de un solo uso
 * - Contraseñas provisionales para nuevos usuarios
 * 
 * @param {number} length - Longitud deseada (default: 12)
 * @returns {string} - Contraseña aleatoria segura
 * 
 * @example
 * const tempPassword = generateRandomPassword(16);
 * // Resultado: 'Kp9#mL2@qR8$nX3!'
 */
    const generateRandomPassword = (length = 12) => {
        // Caracteres disponibles para la contraseña
        const charset = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        // Combinamos todos los caracteres
        const allChars = Object.values(charset).join('');
        
        let password = '';
        
        // Asegurar que tenga al menos un caracter de cada tipo
        password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
        password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
        password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
        password += charset.special[Math.floor(Math.random() * charset.special.length)];
        
        // Rellenar el resto con caracteres aleatorios
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Mezclar la contraseña (shuffle) para que los caracteres obligatorios no estén siempre al inicio
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
        };

        // Exportamos todas las funciones
        module.exports = {
        hashPassword,
        comparePassword,
        validatePasswordStrength,
        generateRandomPassword
    };