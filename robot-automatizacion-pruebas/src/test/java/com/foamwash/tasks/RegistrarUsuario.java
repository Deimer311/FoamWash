package com.foamwash.tasks;

import com.foamwash.userinterfaces.RegisterPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Tasks;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;

public class RegistrarUsuario implements Task {

    private final String nombre;
    private final String telefono;
    private final String correo;
    private final String direccion;
    private final String contrasena;

    public RegistrarUsuario(String nombre, String telefono, String correo, String direccion, String contrasena) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.correo = correo;
        this.direccion = direccion;
        this.contrasena = contrasena;
    }

    public static RegistrarUsuario conDatos(String nombre, String telefono, String correo, String direccion, String contrasena) {
        return Tasks.instrumented(RegistrarUsuario.class, nombre, telefono, correo, direccion, contrasena);
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        // Asume que la vista de registro ya está abierta, de lo contrario se debe agregar un Click al BTN_MODAL_REGISTRO
        actor.attemptsTo(
                Enter.theValue(nombre).into(RegisterPage.INPUT_NOMBRE),
                Enter.theValue(telefono).into(RegisterPage.INPUT_TELEFONO),
                Enter.theValue(correo).into(RegisterPage.INPUT_EMAIL),
                Enter.theValue(direccion).into(RegisterPage.INPUT_DIRECCION),
                Enter.theValue(contrasena).into(RegisterPage.INPUT_PASSWORD),
                Click.on(RegisterPage.BTN_REGISTRAR)
        );
    }
}
