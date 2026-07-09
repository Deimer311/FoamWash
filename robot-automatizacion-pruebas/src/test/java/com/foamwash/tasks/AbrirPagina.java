package com.foamwash.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Open;

import net.serenitybdd.screenplay.actions.Click;
import org.openqa.selenium.By;

public class AbrirPagina implements Task {

    @Override
    public <T extends Actor> void performAs(T actor) {
        if (!com.foamwash.userinterfaces.CrossPlatform.isMobile()) {
            actor.attemptsTo(
                    Open.url("http://localhost:3000")
            );
        }
    }
}
