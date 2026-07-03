package com.foamwash.stepdefinitions;

import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;

public class GestionOrdenesEmpleadoStepDefinitions {

    @Dado("que el empleado accede a su panel")
    public void queElEmpleadoAccedeASuPanel() {
    }

    @Cuando("revisa su agenda de servicios")
    public void revisaSuAgendaDeServicios() {
    }

    @Entonces("deberia ver el listado de ordenes asignadas por fecha y hora")
    public void deberiaVerElListadoDeOrdenesAsignadasPorFechaYHora() {
    }

    @Dado("que el empleado tiene una orden asignada")
    public void queElEmpleadoTieneUnaOrdenAsignada() {
    }

    @Cuando("visualiza los detalles de la orden")
    public void visualizaLosDetallesDeLaOrden() {
    }

    @Entonces("deberia ver el tipo de servicio, observaciones y ubicacion")
    public void deberiaVerElTipoDeServicioObservacionesYUbicacion() {
    }

    @Dado("que el empleado esta atendiendo una orden")
    public void queElEmpleadoEstaAtendiendoUnaOrden() {
    }

    @Cuando("agrega observaciones sobre el servicio realizado")
    public void agregaObservacionesSobreElServicioRealizado() {
    }

    @Entonces("las observaciones deberian quedar guardadas en la orden")
    public void lasObservacionesDeberianQuedarGuardadasEnLaOrden() {
    }

    @Dado("que el empleado ha terminado el servicio")
    public void queElEmpleadoHaTerminadoElServicio() {
    }

    @Cuando("marca la orden como finalizada")
    public void marcaLaOrdenComoFinalizada() {
    }

    @Entonces("el estado de la orden deberia actualizarse en el sistema")
    public void elEstadoDeLaOrdenDeberiaActualizarseEnElSistema() {
    }

    @Dado("que el administrador asigna un nuevo servicio")
    public void queElAdministradorAsignaUnNuevoServicio() {
    }

    @Cuando("el sistema notifica al empleado")
    public void elSistemaNotificaAlEmpleado() {
    }

    @Entonces("el empleado deberia ver los detalles del nuevo servicio")
    public void elEmpleadoDeberiaVerLosDetallesDelNuevoServicio() {
    }
}
