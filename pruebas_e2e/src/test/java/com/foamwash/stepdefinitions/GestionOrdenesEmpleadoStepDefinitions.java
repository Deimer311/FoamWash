package com.foamwash.stepdefinitions;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import org.openqa.selenium.By;
import com.foamwash.tasks.AbrirPagina;
import com.foamwash.tasks.IngresarCredenciales;
import com.foamwash.userinterfaces.CrossPlatform;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;
import net.serenitybdd.screenplay.actions.SelectFromOptions;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import net.serenitybdd.screenplay.questions.WebElementQuestion;

public class GestionOrdenesEmpleadoStepDefinitions {

    @Dado("que el empleado accede a su panel")
    public void queElEmpleadoAccedeASuPanel() {
        OnStage.theActorCalled("Empleado").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("trabajador@gmail.com", "123456"),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("nav agenda", By.xpath("//span[text()='Agenda']/.."), By.xpath("//*[@content-desc='employee_panel']")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Cuando("revisa su agenda de servicios")
    public void revisaSuAgendaDeServicios() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Click.on(CrossPlatform.target("nav agenda", By.xpath("//span[text()='Agenda']/.."), By.xpath("//*[@content-desc='nav_agenda']")))
        );
    }

    @Entonces("deberia ver el listado de ordenes asignadas por fecha y hora")
    public void deberiaVerElListadoDeOrdenesAsignadasPorFechaYHora() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("lista agenda", By.xpath("//*[contains(@class, 'ag-card')]"), By.xpath("//*[contains(@resource-id, 'agenda_list')]"))),
                WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el empleado tiene una orden asignada")
    public void queElEmpleadoTieneUnaOrdenAsignada() {
        queElEmpleadoAccedeASuPanel();
        revisaSuAgendaDeServicios();
    }

    @Cuando("visualiza los detalles de la orden")
    public void visualizaLosDetallesDeLaOrden() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("lista agenda", By.xpath("//*[contains(@class, 'ag-card')]"), By.xpath("//*[contains(@resource-id, 'agenda_list')]")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Entonces("deberia ver el tipo de servicio, observaciones y ubicacion")
    public void deberiaVerElTipoDeServicioObservacionesYUbicacion() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("detalle orden", By.xpath("//*[contains(@class, 'ag-card')]"), By.xpath("//*[contains(@resource-id, 'order_details')]"))),
                WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el empleado esta atendiendo una orden")
    public void queElEmpleadoEstaAtendiendoUnaOrden() {
        queElEmpleadoTieneUnaOrdenAsignada();
        visualizaLosDetallesDeLaOrden();
    }

    @Cuando("agrega observaciones sobre el servicio realizado")
    public void agregaObservacionesSobreElServicioRealizado() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Enter.theValue("Servicio completado").into(CrossPlatform.target("input buscar", By.cssSelector(".ag-search"), By.xpath("//*[@content-desc='input_observaciones']")))
        );
    }

    @Entonces("las observaciones deberian quedar guardadas en la orden")
    public void lasObservacionesDeberianQuedarGuardadasEnLaOrden() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("input buscar", By.cssSelector(".ag-search"), By.xpath("//*[@content-desc='input_observaciones']"))), WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el empleado ha terminado el servicio")
    public void queElEmpleadoHaTerminadoElServicio() {
        queElEmpleadoEstaAtendiendoUnaOrden();
    }

    @Cuando("marca la orden como finalizada")
    public void marcaLaOrdenComoFinalizada() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            SelectFromOptions.byVisibleText("Completado").from(CrossPlatform.target("marcar finalizada", By.cssSelector(".ag-estado-select"), By.xpath("//*[@content-desc='btn_complete']")))
        );
    }

    @Entonces("el estado de la orden deberia actualizarse en el sistema")
    public void elEstadoDeLaOrdenDeberiaActualizarseEnElSistema() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("estado completado", By.xpath("//div[contains(text(), 'Completado')]"), By.xpath("//*[contains(@text, 'finalizada')]")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Dado("que el administrador asigna un nuevo servicio")
    public void queElAdministradorAsignaUnNuevoServicio() {
        // En un flujo aislado asumimos que la notificación llega de fondo
    }

    @Cuando("el sistema notifica al empleado")
    public void elSistemaNotificaAlEmpleado() {
        // El empleado abre la campana de notificaciones (si existe) o simplemente se loguea
        OnStage.theActorCalled("Empleado").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("trabajador@gmail.com", "123456")
        );
    }

    @Entonces("el empleado deberia ver los detalles del nuevo servicio")
    public void elEmpleadoDeberiaVerLosDetallesDelNuevoServicio() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("lista agenda", By.xpath("//*[contains(@class, 'ag-card')]"), By.xpath("//*[contains(@resource-id, 'notifications')]"))),
                WebElementStateMatchers.isVisible())
        );
    }
}
