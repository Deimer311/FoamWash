package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class RegisterPage {
    public static final Target BTN_MODAL_REGISTRO = Target.the("botón para abrir modal de registro").located(By.xpath("//button[contains(@class, 'toggle-button') and contains(text(), 'Registrar')]"));
    
    public static final Target INPUT_NOMBRE = Target.the("campo nombre").located(By.xpath("//div[contains(@class, 'register-view')]//input[@placeholder='Nombre completo *']"));
    public static final Target INPUT_TELEFONO = Target.the("campo telefono").located(By.xpath("//div[contains(@class, 'register-view')]//input[contains(@placeholder, 'Teléfono')]"));
    public static final Target INPUT_EMAIL = Target.the("campo email").located(By.xpath("//div[contains(@class, 'register-view')]//input[@type='email']"));
    public static final Target INPUT_DIRECCION = Target.the("campo direccion").located(By.xpath("//div[contains(@class, 'register-view')]//input[contains(@placeholder, 'Dirección')]"));
    public static final Target INPUT_PASSWORD = Target.the("campo contraseña").located(By.xpath("//div[contains(@class, 'register-view')]//input[@type='password']"));
    public static final Target BTN_REGISTRAR = Target.the("botón de finalizar registro").located(By.xpath("//div[contains(@class, 'register-view')]//button[@type='submit']"));
    
    public static final Target MSJ_CONFIRMACION = Target.the("mensaje de confirmación").located(By.xpath("//div[contains(@class, 'message-area') and contains(@class, 'success-message')]"));
}
