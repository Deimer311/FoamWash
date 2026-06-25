package com.foamwash.stepdefinitions;

import com.foamwash.tasks.AbrirPaginaInicio;
import com.foamwash.tasks.DiligenciarCotizacion;
import com.foamwash.tasks.IrACotizar;
import com.foamwash.userinterfaces.CotizacionPage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.questions.Visibility;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;

public class CotizarStepDefinitions {

    @Dado("que el visitante esta en la pagina principal")
    public void queElVisitanteEstaEnLaPaginaPrincipal() {
        OnStage.theActorCalled("Visitante").wasAbleTo(
                AbrirPaginaInicio.home()
        );
    }

    @Cuando("navega a la seccion de cotizaciones")
    public void navegaALaSeccionDeCotizaciones() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                IrACotizar.desdeElHome()
        );
    }

    @Cuando("selecciona un servicio de la lista")
    public void seleccionaUnServicioDeLaLista() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                DiligenciarCotizacion.paraUnServicio()
        );
    }

    @Entonces("deberia ver el mensaje de confirmacion de la cotizacion")
    public void deberiaVerElMensajeDeConfirmacionDeLaCotizacion() {
        OnStage.theActorInTheSpotlight().should(
                seeThat(Visibility.of(CotizacionPage.MSG_EXITO))
        );
    }
}
