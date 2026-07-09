package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class RegisterPage {
    public static final Target BTN_MODAL_REGISTRO = CrossPlatform.target("botón para abrir modal de registro",
        By.xpath("//button[contains(@class, 'toggle-button') and contains(text(), 'Registrar')]"),
        By.xpath("//android.widget.TextView[@text='Registrar']")
    );
    
    public static final Target INPUT_NOMBRE = CrossPlatform.target("campo nombre",
        By.xpath("//div[contains(@class, 'register-view')]//input[@placeholder='Nombre completo *']"),
        By.xpath("//android.widget.EditText[contains(@text, 'Nombre') or contains(@hint, 'Nombre')]")
    );
    public static final Target INPUT_TELEFONO = CrossPlatform.target("campo telefono",
        By.xpath("//div[contains(@class, 'register-view')]//input[contains(@placeholder, 'Teléfono')]"),
        By.xpath("//android.widget.EditText[contains(@text, 'Teléfono') or contains(@hint, 'Teléfono')]")
    );
    public static final Target INPUT_EMAIL = CrossPlatform.target("campo email",
        By.xpath("//div[contains(@class, 'register-view')]//input[@type='email']"),
        By.xpath("//android.widget.EditText[contains(@text, 'Email') or contains(@hint, 'Correo')]")
    );
    public static final Target INPUT_DIRECCION = CrossPlatform.target("campo direccion",
        By.xpath("//div[contains(@class, 'register-view')]//input[contains(@placeholder, 'Dirección')]"),
        By.xpath("//android.widget.EditText[contains(@text, 'Dirección') or contains(@hint, 'Dirección')]")
    );
    public static final Target INPUT_PASSWORD = CrossPlatform.target("campo contraseña",
        By.xpath("//div[contains(@class, 'register-view')]//input[@type='password']"),
        By.xpath("//android.widget.EditText[contains(@text, 'Contraseña') or contains(@hint, 'Contraseña')]")
    );
    public static final Target BTN_REGISTRAR = CrossPlatform.target("botón de finalizar registro",
        By.xpath("//div[contains(@class, 'register-view')]//button[@type='submit']"),
        By.xpath("//android.widget.Button//*[contains(@text, 'REGISTRAR') or contains(@text, 'Registrar')]")
    );
    
    public static final Target MSJ_CONFIRMACION = CrossPlatform.target("mensaje de confirmación",
        By.xpath("//div[contains(@class, 'message-area') and contains(@class, 'success-message')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'éxito') or contains(@text, 'completado')]")
    );
}
