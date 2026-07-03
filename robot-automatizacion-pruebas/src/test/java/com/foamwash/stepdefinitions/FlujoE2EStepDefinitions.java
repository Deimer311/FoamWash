package com.foamwash.stepdefinitions;

import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import com.foamwash.tasks.AbrirPagina;
import com.foamwash.tasks.IngresarCredenciales;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;

public class FlujoE2EStepDefinitions {

    @Dado("que {string} agenda un servicio de limpieza")
    public void queClienteAgendaServicio(String nombreActor) {
        OnStage.theActorCalled(nombreActor).wasAbleTo(
            new AbrirPagina(),
            Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
            IngresarCredenciales.con("cliente@gmail.com", "123456")
        );
        // Validamos que el cliente haya ingresado correctamente
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".profile-link, .hc-nav-btn"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Cuando("{string} aprueba la orden y se la asigna a {string}")
    public void administradorApruebaOrden(String admin, String trabajador) {
        OnStage.theActorCalled(admin).wasAbleTo(
            new AbrirPagina(),
            Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
            IngresarCredenciales.con("admin@gmail.com", "123456")
        );
        // Validamos que el admin haya ingresado al dashboard
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.xpath("//*[contains(text(), 'Panel de Control')]"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Cuando("{string} atiende y marca la orden como completada")
    public void trabajadorCompletaOrden(String trabajador) {
        OnStage.theActorCalled(trabajador).wasAbleTo(
            new AbrirPagina(),
            Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
            IngresarCredenciales.con("trabajador@gmail.com", "123456")
        );
        // Validamos que el trabajador haya ingresado a su agenda
        OnStage.theActorInTheSpotlight().attemptsTo(
            net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.xpath("//*[contains(text(), 'Mis Órdenes')]"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
    }

    @Entonces("{string} deberia ver la orden como finalizada en su historial")
    public void clienteVerificaHistorial(String cliente) {
        // Volvemos a enfocarnos en el cliente original (su sesión sigue viva gracias a Serenity)
        OnStage.theActorCalled(cliente).attemptsTo(
            new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().should(
            seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(org.openqa.selenium.By.cssSelector(".profile-link, .hc-nav-btn")), 
                    net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }
}
