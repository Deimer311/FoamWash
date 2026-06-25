package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class DashboardPage {
    public static final Target TITULO_ADMIN = Target.the("titulo de acciones rápidas admin").located(By.xpath("//h2[contains(text(), 'Acciones Rápidas')]"));
    public static final Target TITULO_CLIENTE = Target.the("titulo de servicios cliente").located(By.xpath("//h2[contains(text(), 'Nuestros Servicios')]"));
    public static final Target TITULO_TRABAJADOR = Target.the("titulo de ordenes trabajador").located(By.xpath("//h2[contains(text(), 'Órdenes')]"));
}
