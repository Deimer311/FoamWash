package com.foamwash.stepdefinitions;

import com.foamwash.tasks.AbrirPagina;
import io.cucumber.java.Before;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

public class LoginStepDefinitions {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Dado("que el usuario abre la pagina principal de la aplicacion")
    public void abrirPaginaPrincipal() {
        OnStage.theActorCalled("Usuario").wasAbleTo(
                new AbrirPagina()
        );
    }

    @io.cucumber.java.es.Cuando("ingresa sus credenciales {string} y {string}")
    public void ingresaCredenciales(String correo, String contrasena) {
        OnStage.theActorInTheSpotlight().attemptsTo(
                com.foamwash.tasks.IngresarCredenciales.con(correo, contrasena)
        );
    }

    @Entonces("deberia ver el dashboard del rol {string} correctamente")
    public void verificarPagina(String rol) {
        OnStage.theActorInTheSpotlight().should(
                net.serenitybdd.screenplay.GivenWhenThen.seeThat(com.foamwash.questions.ElDashboard.cargaParaElRol(rol))
        );
    }
}
