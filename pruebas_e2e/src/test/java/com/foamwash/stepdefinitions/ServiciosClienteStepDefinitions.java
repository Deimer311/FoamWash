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
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.matchers.WebElementStateMatchers;
import net.serenitybdd.screenplay.questions.WebElementQuestion;

public class ServiciosClienteStepDefinitions {

    @Dado("que el cliente accede al catalogo de servicios")
    public void queElClienteAccedeAlCatalogoDeServicios() {
        OnStage.theActorCalled("Cliente").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456"),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn agendar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Agendar']/.."), By.xpath("//*[@content-desc='btn_schedule']")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("btn agendar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Agendar']/.."), By.xpath("//*[@content-desc='btn_schedule']")))
        );
    }

    @Cuando("filtra por tipo de mobiliario")
    public void filtraPorTipoDeMobiliario() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Enter.theValue("Sofás").into(CrossPlatform.target("filtro sofas", By.xpath("//input[contains(@class, 'search-input')]"), By.xpath("//android.widget.EditText")))
        );
    }

    @Entonces("deberia ver el listado de servicios con nombre, descripcion y precio")
    public void deberiaVerElListadoDeServiciosConNombreDescripcionYPrecio() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("lista servicios", By.cssSelector(".services-list, .service-item"), By.xpath("//*[contains(@resource-id, 'service_list')]"))),
                WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el cliente desea saber el costo estimado de un servicio")
    public void queElClienteDeseaSaberElCostoEstimadoDeUnServicio() {
        OnStage.theActorCalled("Cliente").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456"),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn cotizar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Cotizar']/.."), By.xpath("//*[@content-desc='btn_quote']")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("btn cotizar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Cotizar']/.."), By.xpath("//*[@content-desc='btn_quote']")))
        );
    }

    @Cuando("envia el formulario de cotizacion con sus datos validos")
    public void enviaElFormularioDeCotizacionConSusDatosValidos() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Enter.theValue("Sofa 3 puestos").into(CrossPlatform.target("input detalle", By.xpath("//textarea"), By.xpath("//*[@content-desc='input_detalle']"))),
            Click.on(CrossPlatform.target("btn solicitar", By.xpath("//button[contains(., 'Solicitar')]"), By.xpath("//*[@content-desc='btn_submit_quote']")))
        );
    }

    @Entonces("la solicitud deberia guardarse como pendiente y enviar una notificacion")
    public void laSolicitudDeberiaGuardarseComoPendienteYEnviarUnaNotificacion() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("toast exito", By.cssSelector(".toast-success"), By.xpath("//*[contains(@text, 'éxito')]")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Dado("que el cliente selecciono un servicio")
    public void queElClienteSeleccionoUnServicio() {
        OnStage.theActorCalled("Cliente Comprador").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456"),
            Click.on(CrossPlatform.target("btn agendar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Agendar']/.."), By.xpath("//*[@content-desc='btn_schedule']")))
        );
    }

    @Cuando("escoge fecha, hora y ubicacion disponibles")
    public void escogeFechaHoraYUbicacionDisponibles() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Click.on(CrossPlatform.target("btn agendar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Agendar']/.."), By.xpath("//*[@content-desc='btn_schedule']"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("agregar servicio", By.xpath("(//button[contains(@class, 'sc-btn')])[1]"), By.xpath("//button")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("agregar servicio", By.xpath("(//button[contains(@class, 'sc-btn')])[1]"), By.xpath("//button"))),
            Click.on(CrossPlatform.target("btn abrir carrito", By.xpath("//button[contains(@title, 'Ver carrito')]|//button[contains(@class, 'cart-btn-floating')]|//div[contains(@class, 'cart-btn-floating')]//button|//button[contains(text(), '🛒')]"), By.xpath("//button"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn finalizar compra", By.xpath("//button[contains(text(), 'Ver cotización')]|//button[contains(@class, 'fwm-btn-primary')]"), By.xpath("//button")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("btn finalizar compra", By.xpath("//button[contains(text(), 'Ver cotización')]|//button[contains(@class, 'fwm-btn-primary')]"), By.xpath("//button"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("input fecha", By.xpath("//input[@type='date']"), By.xpath("//*[@content-desc='input_fecha']")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Enter.theValue("2026-10-10").into(CrossPlatform.target("input fecha", By.xpath("//input[@type='date']"), By.xpath("//*[@content-desc='input_fecha']"))),
            Enter.theValue("08:00").into(CrossPlatform.target("input hora", By.xpath("//input[@type='time']"), By.xpath("//*[@content-desc='input_hora']"))),
            Enter.theValue("Calle 100").into(CrossPlatform.target("input ubicacion", By.xpath("//input[@type='text' and not(contains(@class, 'search'))]"), By.xpath("//*[@content-desc='input_ubicacion']"))),
            Click.on(CrossPlatform.target("btn confirmar", By.xpath("//button[contains(., 'Confirmar') or contains(., 'Listo')]|//button[contains(@class, 'fwm-btn-success')]"), By.xpath("//*[@content-desc='btn_confirm']")))
        );
    }

    @Entonces("el servicio deberia agendarse y recibir una confirmacion automatica")
    public void elServicioDeberiaAgendarseYRecibirUnaConfirmacionAutomatica() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("toast confirmacion", By.cssSelector(".toast-success"), By.xpath("//*[contains(@text, 'confirmada')]")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Dado("que el cliente ha iniciado sesion")
    public void queElClienteHaIniciadoSesion() {
        OnStage.theActorCalled("Cliente").wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456")
        );
    }

    @Cuando("accede a la seccion de su perfil")
    public void accedeALaSeccionDeSuPerfil() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Click.on(CrossPlatform.target("btn avatar", By.xpath("//div[contains(@class, 'hc-avatar-btn')]"), By.xpath("//*[@content-desc='btn_avatar']"))),
            Click.on(CrossPlatform.target("btn perfil", By.xpath("//button[contains(., 'Mi Perfil')]"), By.xpath("//*[@content-desc='btn_profile']")))
        );
    }

    @Cuando("el cliente navega a la seccion de historial de reservas")
    public void elClienteNavegaALaSeccionDeHistorialDeReservas() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            Click.on(CrossPlatform.target("btn avatar", By.xpath("//div[contains(@class, 'hc-avatar-btn')]"), By.xpath("//*[@content-desc='btn_avatar']"))),
            Click.on(CrossPlatform.target("btn historial", By.xpath("//button[contains(., 'Mis Agendamientos')]"), By.xpath("//*[@content-desc='btn_history']")))
        );
    }

    @Entonces("deberia ver el listado de sus servicios pasados con fecha y estado")
    public void deberiaVerElListadoDeSusServiciosPasadosConFechaYEstado() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("lista historial", By.cssSelector(".history-list"), By.xpath("//*[contains(@resource-id, 'history_list')]"))),
                WebElementStateMatchers.isVisible())
        );
    }
}
