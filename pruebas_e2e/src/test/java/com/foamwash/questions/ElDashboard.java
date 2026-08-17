package com.foamwash.questions;

import com.foamwash.userinterfaces.DashboardPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;

public class ElDashboard implements Question<Boolean> {

    private final String rol;

    public ElDashboard(String rol) {
        this.rol = rol;
    }

    public static ElDashboard cargaParaElRol(String rol) {
        return new ElDashboard(rol);
    }

    @Override
    public Boolean answeredBy(Actor actor) {
        if (rol.equalsIgnoreCase("admin")) {
            return Visibility.of(DashboardPage.TITULO_ADMIN).answeredBy(actor);
        } else if (rol.equalsIgnoreCase("cliente")) {
            return Visibility.of(DashboardPage.TITULO_CLIENTE).answeredBy(actor);
        } else if (rol.equalsIgnoreCase("trabajador")) {
            return Visibility.of(DashboardPage.TITULO_TRABAJADOR).answeredBy(actor);
        }
        return false;
    }
}
