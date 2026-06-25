package com.foamwash.stepdefinitions;

import com.foamwash.tasks.AbrirPagina;
import com.foamwash.tasks.IngresarCredenciales;
import com.foamwash.tasks.NavegarMenuAdmin;
import com.foamwash.userinterfaces.MenuAdminPage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.questions.Visibility;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;

public class AdminStepDefinitions {

    // "Dado que el usuario abre la pagina principal de la aplicacion" y "Y ingresa sus credenciales..."
    // Se reutilizan los pasos de LoginStepDefinitions (si coinciden las regex), o los creamos si son diferentes.
    // En admin.feature pusimos:
    // Dado que el usuario abre la pagina principal de la aplicacion
    // Y ingresa sus credenciales "admin@gmail.com" y "123456"
    // Estas están en LoginStepDefinitions, así que no hace falta duplicar.

    @Cuando("navega a la seccion de {string}")
    public void navegaALaSeccion(String seccion) {
        OnStage.theActorInTheSpotlight().attemptsTo(
                NavegarMenuAdmin.hacia(seccion)
        );
    }

    @Entonces("deberia ver la lista de empleados cargada")
    public void deberiaVerLaListaDeEmpleadosCargada() {
        OnStage.theActorInTheSpotlight().should(
                seeThat(Visibility.of(MenuAdminPage.TABLA_EMPLEADOS))
        );
    }
}
