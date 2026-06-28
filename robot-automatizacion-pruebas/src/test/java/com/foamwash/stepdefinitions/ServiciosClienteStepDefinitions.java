package com.foamwash.stepdefinitions;

import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;

public class ServiciosClienteStepDefinitions {

    @Dado("que el cliente accede al catalogo de servicios")
    public void queElClienteAccedeAlCatalogoDeServicios() {
    }

    @Cuando("filtra por tipo de mobiliario")
    public void filtraPorTipoDeMobiliario() {
    }

    @Entonces("deberia ver el listado de servicios con nombre, descripcion y precio")
    public void deberiaVerElListadoDeServiciosConNombreDescripcionYPrecio() {
    }

    @Dado("que el cliente desea saber el costo estimado de un servicio")
    public void queElClienteDeseaSaberElCostoEstimadoDeUnServicio() {
    }

    @Cuando("envia el formulario de cotizacion con sus datos validos")
    public void enviaElFormularioDeCotizacionConSusDatosValidos() {
    }

    @Entonces("la solicitud deberia guardarse como pendiente y enviar una notificacion")
    public void laSolicitudDeberiaGuardarseComoPendienteYEnviarUnaNotificacion() {
    }

    @Dado("que el cliente selecciono un servicio")
    public void queElClienteSeleccionoUnServicio() {
    }

    @Cuando("escoge fecha, hora y ubicacion disponibles")
    public void escogeFechaHoraYUbicacionDisponibles() {
    }

    @Entonces("el servicio deberia agendarse y recibir una confirmacion automatica")
    public void elServicioDeberiaAgendarseYRecibirUnaConfirmacionAutomatica() {
    }

    @Dado("que el cliente ha iniciado sesion")
    public void queElClienteHaIniciadoSesion() {
    }

    @Cuando("accede a la seccion de su perfil")
    public void accedeALaSeccionDeSuPerfil() {
    }

    @Entonces("deberia ver el listado de sus servicios pasados con fecha y estado")
    public void deberiaVerElListadoDeSusServiciosPasadosConFechaYEstado() {
    }
}
