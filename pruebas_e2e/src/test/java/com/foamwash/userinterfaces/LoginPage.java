package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class LoginPage {
    public static final Target INPUT_EMAIL = CrossPlatform.target("campo email",
        By.xpath("//div[contains(@class, 'login-view')]//input[@type='email']"),
        By.xpath("//*[@content-desc='input_email']")
    );
    public static final Target INPUT_PASSWORD = CrossPlatform.target("campo contraseña",
        By.xpath("//div[contains(@class, 'login-view')]//input[@type='password']"),
        By.xpath("//*[@content-desc='input_password']")
    );
    public static final Target BTN_LOGIN = CrossPlatform.target("botón de iniciar sesión",
        By.xpath("//div[contains(@class, 'login-view')]//button[@type='submit']"),
        By.xpath("//*[@content-desc='btn_login']")
    );
}
