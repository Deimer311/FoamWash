package com.foamwash.tasks;

import com.foamwash.userinterfaces.CotizacionPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Click;
import org.openqa.selenium.By;

public class IrACotizar implements Task {

    public static IrACotizar desdeElHome() {
        return Tasks.instrumented(IrACotizar.class);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        // En el main content hay un boton para ir a servicios
        actor.attemptsTo(
                Click.on(By.cssSelector(".service-btn"))
        );
        // Luego en ServiciosPage damos click en Cotización
        actor.attemptsTo(
                Click.on(CotizacionPage.BTN_COTIZACION)
        );
    }
}
