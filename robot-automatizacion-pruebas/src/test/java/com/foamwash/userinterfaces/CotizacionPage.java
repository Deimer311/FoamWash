package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class CotizacionPage {
    public static final Target BTN_SERVICIOS = Target.the("botón de servicios en home").located(By.cssSelector(".main-btn[href='#']")); // o texto "Servicios"
    public static final Target BTN_COTIZACION = Target.the("botón de cotización en nav").located(By.xpath("//a[contains(text(), 'Cotización')]"));
    public static final Target BTN_AGREGAR_CARRITO = Target.the("botón agregar al carrito").located(By.xpath("(//button[contains(@class, 'btn-cotizar')])[1]"));
    public static final Target BTN_VER_CARRITO = Target.the("botón ver carrito flotante").located(By.cssSelector(".btn-carrito-flotante"));
    public static final Target BTN_GENERAR_COTIZACION = Target.the("botón generar cotización").located(By.xpath("//button[contains(text(), 'Generar Cotización')]"));
    public static final Target MSG_EXITO = Target.the("mensaje de éxito de cotización").located(By.xpath("//h3[contains(text(), '¡Cotización Generada!')]"));
}
