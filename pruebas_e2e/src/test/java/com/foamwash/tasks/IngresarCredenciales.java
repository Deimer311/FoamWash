package com.foamwash.tasks;

import com.foamwash.userinterfaces.LoginPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;

public class IngresarCredenciales implements Task {

    private final String correo;
    private final String contrasena;

    public IngresarCredenciales(String correo, String contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }

    public static IngresarCredenciales con(String correo, String contrasena) {
        return Tasks.instrumented(IngresarCredenciales.class, correo, contrasena);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Enter.theValue(correo).into(LoginPage.INPUT_EMAIL),
                Enter.theValue(contrasena).into(LoginPage.INPUT_PASSWORD),
                Click.on(LoginPage.BTN_LOGIN)
        );
    }
}
