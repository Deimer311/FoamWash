package com.foamwash.tasks;

import com.foamwash.userinterfaces.MenuAdminPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Click;

public class NavegarMenuAdmin implements Task {

    private final String seccion;

    public NavegarMenuAdmin(String seccion) {
        this.seccion = seccion;
    }

    public static NavegarMenuAdmin hacia(String seccion) {
        return Tasks.instrumented(NavegarMenuAdmin.class, seccion);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        if (seccion.equalsIgnoreCase("Empleados")) {
            actor.attemptsTo(
                    Click.on(MenuAdminPage.BTN_EMPLEADOS)
            );
        }
    }
}
