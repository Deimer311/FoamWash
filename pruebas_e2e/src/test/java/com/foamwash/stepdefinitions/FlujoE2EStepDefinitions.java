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

public class FlujoE2EStepDefinitions {

    @Dado("que {string} agenda un servicio de limpieza")
    public void queClienteAgendaServicio(String nombreActor) {
        OnStage.theActorCalled(nombreActor).wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456"),
            Click.on(CrossPlatform.target("btn agendar", By.xpath("//span[contains(@class, 'hc-nav-label') and text()='Agendar']/.."), By.xpath("//*[@content-desc='btn_schedule']"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("agregar servicio", By.xpath("(//button[contains(@class, 'sc-btn')])[1]"), By.xpath("//button")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("agregar servicio", By.xpath("(//button[contains(@class, 'sc-btn')])[1]"), By.xpath("//button"))),
            Click.on(CrossPlatform.target("btn abrir carrito", By.xpath("//button[contains(@title, 'Ver carrito')]|//button[contains(@class, 'cart-btn-floating')]|//div[contains(@class, 'cart-btn-floating')]//button|//button[contains(text(), '🛒')]"), By.xpath("//button"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn finalizar compra", By.xpath("//button[contains(text(), 'Ver cotización')]|//button[contains(@class, 'fwm-btn-primary')]"), By.xpath("//button")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Click.on(CrossPlatform.target("btn finalizar compra", By.xpath("//button[contains(text(), 'Ver cotización')]|//button[contains(@class, 'fwm-btn-primary')]"), By.xpath("//button"))),
            net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("input fecha", By.xpath("//input[@type='date']"), By.xpath("//*[@content-desc='input_fecha']")), WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
            Enter.theValue("2026-12-01").into(CrossPlatform.target("input fecha", By.xpath("//input[@type='date']"), By.xpath("//*[@content-desc='input_fecha']"))),
            Enter.theValue("14:00").into(CrossPlatform.target("input hora", By.xpath("//input[@type='time']"), By.xpath("//*[@content-desc='input_hora']"))),
            Enter.theValue("Calle Falsa 123").into(CrossPlatform.target("input ubicacion", By.xpath("//input[@type='text' and not(contains(@class, 'search'))]"), By.xpath("//*[@content-desc='input_ubicacion']"))),
            Click.on(CrossPlatform.target("btn confirmar", By.xpath("//button[contains(., 'Confirmar') or contains(., 'Listo')]|//button[contains(@class, 'fwm-btn-success')]"), By.xpath("//*[@content-desc='btn_confirm']")))
        );
    }

    @Cuando("{string} aprueba la orden y se la asigna a {string}")
    public void administradorApruebaOrden(String admin, String trabajador) {
        OnStage.theActorCalled(admin).wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("admin@gmail.com", "123456"),
            Click.on(CrossPlatform.target("nav ordenes", By.xpath("//span[text()='Agenda']/.."), By.xpath("//*[@content-desc='nav_orders']"))),
            Click.on(CrossPlatform.target("btn editar asignacion", By.cssSelector(".ag-action-btn.edit"), By.xpath("//*[@content-desc='btn_approve']"))),
            SelectFromOptions.byVisibleText(trabajador).from(CrossPlatform.target("seleccionar empleado", By.xpath("//select"), By.xpath("//*[contains(@text, '" + trabajador + "')]"))),
            Click.on(CrossPlatform.target("confirmar asignacion", By.cssSelector(".ag-save-btn"), By.xpath("//*[@content-desc='btn_confirm_assign']")))
        );
    }

    @Cuando("{string} atiende y marca la orden como completada")
    public void trabajadorCompletaOrden(String trabajador) {
        OnStage.theActorCalled(trabajador).wasAbleTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("trabajador@gmail.com", "123456"),
            Click.on(CrossPlatform.target("nav agenda", By.xpath("//span[text()='Agenda']/.."), By.xpath("//*[@content-desc='nav_agenda']"))),
            SelectFromOptions.byVisibleText("Completado").from(CrossPlatform.target("marcar finalizada", By.cssSelector(".ag-estado-select"), By.xpath("//*[@content-desc='btn_complete']")))
        );
    }

    @Entonces("{string} deberia ver la orden como finalizada en su historial")
    public void clienteVerificaHistorial(String cliente) {
        OnStage.theActorCalled(cliente).attemptsTo(
            new AbrirPagina(),
            Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
            IngresarCredenciales.con("cliente@gmail.com", "123456"),
            Click.on(CrossPlatform.target("btn perfil", By.cssSelector(".hc-avatar-btn"), By.xpath("//*[@content-desc='btn_profile']"))),
            Click.on(CrossPlatform.target("btn historial", By.xpath("//button[contains(., 'Mis Agendamientos')]"), By.xpath("//*[@content-desc='btn_history']")))
        );
        OnStage.theActorInTheSpotlight().should(
            seeThat(WebElementQuestion.the(CrossPlatform.target("orden completada", By.xpath("//div[contains(text(), 'Completado') or contains(text(), 'Finalizada')]"), By.xpath("//*[contains(@text, 'Completada') or contains(@text, 'Finalizada')]"))), 
                    WebElementStateMatchers.isVisible())
        );
    }
}
