package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class LoginPage {
    public static final Target INPUT_EMAIL = Target.the("campo email").located(By.xpath("//div[contains(@class, 'login-view')]//input[@type='email']"));
    public static final Target INPUT_PASSWORD = Target.the("campo contraseña").located(By.xpath("//div[contains(@class, 'login-view')]//input[@type='password']"));
    public static final Target BTN_LOGIN = Target.the("botón de iniciar sesión").located(By.xpath("//div[contains(@class, 'login-view')]//button[@type='submit']"));
}
