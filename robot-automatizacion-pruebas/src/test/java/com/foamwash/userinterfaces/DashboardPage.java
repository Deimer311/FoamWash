package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class DashboardPage {
    public static final Target TITULO_ADMIN = CrossPlatform.target("titulo de acciones rápidas admin",
        By.xpath("//h2[contains(text(), 'Acciones Rápidas')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'Acciones Rápidas')]")
    );
    public static final Target TITULO_CLIENTE = CrossPlatform.target("titulo de servicios cliente",
        By.xpath("//h2[contains(text(), 'Nuestros Servicios')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'Nuestros Servicios')]")
    );
    public static final Target TITULO_TRABAJADOR = CrossPlatform.target("titulo de ordenes trabajador",
        By.xpath("//h2[contains(text(), 'Órdenes')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'Órdenes')]")
    );
}
