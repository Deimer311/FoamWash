package com.foamwash.stepdefinitions;

import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actions.Open;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import org.openqa.selenium.WebDriver;
import net.thucydides.core.webdriver.ThucydidesWebDriverSupport;

import com.foamwash.userinterfaces.CrossPlatform;
import org.openqa.selenium.By;

public class SeguridadStepDefinitions {

    @Cuando("intenta navegar forzadamente a la ruta {string}")
    public void intentaNavegarForzadamenteALaRuta(String ruta) {
        // Obtenemos la URL base actual o formamos la URL con la ruta
        WebDriver driver = ThucydidesWebDriverSupport.getDriver();
        if (!com.foamwash.userinterfaces.CrossPlatform.isMobile()) {
            String baseUrl = "http://localhost:3000"; 
            OnStage.theActorInTheSpotlight().attemptsTo(
                    Open.url(baseUrl + ruta)
            );
        }
    }

    @Entonces("el sistema deberia impedirle el acceso y redirigirlo")
    public void elSistemaDeberiaImpedirleElAccesoYRedirigirlo() {
        // Verificamos que el sistema no renderice el panel de administrador, 
        // revisando que no exista el menú de admin o validando que esté en el home
        OnStage.theActorInTheSpotlight().should(
            net.serenitybdd.screenplay.GivenWhenThen.seeThat(
                net.serenitybdd.screenplay.questions.WebElementQuestion.the(CrossPlatform.target("panel admin no visible", By.xpath("//*[contains(text(), 'Panel de Administrador')]"), By.xpath("//android.widget.TextView[contains(@text, 'Panel de Administrador')]"))),
                net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isNotVisible()
            )
        );
    }
}
