package com.foamwash.tasks;

import com.foamwash.userinterfaces.CotizacionPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.SelectFromOptions;
import org.openqa.selenium.By;

public class DiligenciarCotizacion implements Task {

    public static DiligenciarCotizacion paraUnServicio() {
        return Tasks.instrumented(DiligenciarCotizacion.class);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Click.on(CotizacionPage.BTN_AGREGAR_CARRITO),
                Click.on(CotizacionPage.BTN_VER_CARRITO),
                Click.on(By.xpath("//button[contains(text(), 'Finalizar compra')]")),
                SelectFromOptions.byVisibleText("Estandar").from(By.xpath("//select[contains(., 'Seleccionar')]")),
                Click.on(CotizacionPage.BTN_GENERAR_COTIZACION)
        );
    }
}
