package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class MenuAdminPage {
    public static final Target BTN_EMPLEADOS = Target.the("botón empleados").located(By.xpath("//button[contains(text(), 'Empleados') or contains(., '👥')]"));
    public static final Target TABLA_EMPLEADOS = Target.the("lista de empleados").located(By.cssSelector(".empleados-grid"));
}
