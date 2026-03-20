/**=============================================================================
 * EXPORTADOR CENTRAL DE SERVICIOS
 * Facilita las eexportaciones
 * =============================================================================
 */
export {default as api} from './api';//esto esta exportando el servicio de API, lo que permite que otros archivos puedan importar el servicio de API desde este archivo centralizado.
export {default as authService} from './authService';//esto esta exportando el servicio de autenticación, lo que permite que otros archivos puedan importar el servicio de autenticación desde este archivo centralizado.
