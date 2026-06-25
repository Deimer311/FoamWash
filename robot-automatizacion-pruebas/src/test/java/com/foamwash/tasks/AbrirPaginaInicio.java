package com.foamwash.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Open;

public class AbrirPaginaInicio implements Task {

    public static AbrirPaginaInicio home() {
        return Tasks.instrumented(AbrirPaginaInicio.class);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Open.url("http://localhost:3000")
        );
    }
}
