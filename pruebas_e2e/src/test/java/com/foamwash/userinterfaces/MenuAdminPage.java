package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class MenuAdminPage {
    public static final Target BTN_EMPLEADOS = CrossPlatform.target("botón empleados",
        By.xpath("//button[contains(text(), 'Empleados') or contains(., '👥')]"),
        By.xpath("//android.widget.Button[contains(@text, 'Empleados')]")
    );
    public static final Target TABLA_EMPLEADOS = CrossPlatform.target("lista de empleados",
        By.cssSelector(".empleados-grid"),
        By.xpath("//android.widget.ScrollView | //android.widget.ListView")
    );
}
