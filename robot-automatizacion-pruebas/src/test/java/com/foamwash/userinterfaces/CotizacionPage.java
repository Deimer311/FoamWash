package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class CotizacionPage {
    public static final Target BTN_SERVICIOS = CrossPlatform.target("botón de servicios en home",
        By.cssSelector(".main-btn[href='#']"),
        By.xpath("//android.widget.Button[contains(@text, 'Servicios') or contains(@content-desc, 'Servicios')]")
    );
    public static final Target BTN_COTIZACION = CrossPlatform.target("botón de cotización en nav",
        By.xpath("//a[contains(text(), 'Cotización')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'Cotización')]")
    );
    public static final Target BTN_AGREGAR_CARRITO = CrossPlatform.target("botón agregar al carrito",
        By.xpath("(//button[contains(@class, 'btn-cotizar')])[1]"),
        By.xpath("(//android.widget.Button[contains(@text, 'Agregar') or contains(@text, 'Cotizar')])[1]")
    );
    public static final Target BTN_VER_CARRITO = CrossPlatform.target("botón ver carrito flotante",
        By.cssSelector(".btn-carrito-flotante"),
        By.xpath("//android.widget.Button[contains(@text, 'Carrito') or contains(@text, 'Ver')]")
    );
    public static final Target BTN_GENERAR_COTIZACION = CrossPlatform.target("botón generar cotización",
        By.xpath("//button[contains(text(), 'Generar Cotización')]"),
        By.xpath("//android.widget.Button[contains(@text, 'Generar Cotización')]")
    );
    public static final Target MSG_EXITO = CrossPlatform.target("mensaje de éxito de cotización",
        By.xpath("//h3[contains(text(), '¡Cotización Generada!')]"),
        By.xpath("//android.widget.TextView[contains(@text, 'Generada') or contains(@text, 'Éxito')]")
    );
}
