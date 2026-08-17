package com.foamwash.questions;

import com.foamwash.userinterfaces.RegisterPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;
import net.serenitybdd.screenplay.waits.WaitUntil;

import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible;

public class MensajeRegistro implements Question<String> {

    public static MensajeRegistro texto() {
        return new MensajeRegistro();
    }

    @Override
    public String answeredBy(Actor actor) {
        actor.attemptsTo(
                WaitUntil.the(RegisterPage.MSJ_CONFIRMACION, isVisible()).forNoMoreThan(5).seconds()
        );
        return Text.of(RegisterPage.MSJ_CONFIRMACION).answeredBy(actor);
    }
}
