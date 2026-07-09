package com.foamwash.stepdefinitions;

import com.foamwash.questions.MensajeRegistro;
import com.foamwash.questions.ElDashboard;
import com.foamwash.tasks.AbrirPagina;
import com.foamwash.tasks.IngresarCredenciales;
import com.foamwash.tasks.RegistrarUsuario;
import com.foamwash.userinterfaces.RegisterPage;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.Before;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.actions.Click;
import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.containsString;
import com.foamwash.userinterfaces.CrossPlatform;
import org.openqa.selenium.By;

public class AutenticacionStepDefinitions {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Dado("que el usuario se encuentra en la pagina de registro")
    public void queElUsuarioSeEncuentraEnLaPaginaDeRegistro() {
        OnStage.theActorCalled("Cliente Nuevo").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
                Click.on(RegisterPage.BTN_MODAL_REGISTRO)
        );
    }

    @Cuando("llena el formulario con sus datos validos")
    public void llenaElFormularioConSusDatosValidos() {
        String correoDinamico = "usuario" + System.currentTimeMillis() + "@gmail.com";
        OnStage.theActorInTheSpotlight().attemptsTo(
                RegistrarUsuario.conDatos("Juan Perez", "3001234567", correoDinamico, "Calle Falsa 123", "123456")
        );
    }

    @Entonces("deberia ver un mensaje de confirmacion de registro")
    public void deberiaVerUnMensajeDeConfirmacionDeRegistro() {
        // Esperar a que la redirección ocurra y el elemento sea visible
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("header confirmacion", By.cssSelector(".hc-header"), By.xpath("//android.widget.TextView")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(CrossPlatform.target("header confirmacion", By.cssSelector(".hc-header"), By.xpath("//android.widget.TextView"))), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el usuario se encuentra en la pagina de inicio de sesion")
    public void queElUsuarioSeEncuentraEnLaPaginaDeInicioDeSesion() {
        OnStage.theActorCalled("Cliente").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']")))
        );
    }

    @Cuando("ingresa credenciales invalidas")
    public void ingresaCredencialesInvalidas() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                IngresarCredenciales.con("correo_falso_no_existe@gmail.com", "ClaveIncorrecta123")
        );
    }

    @Entonces("deberia ver un mensaje de error indicando fallo de autenticacion")
    public void deberiaVerUnMensajeDeErrorIndicandoFalloDeAutenticacion() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("mensaje de error", By.cssSelector(".error-message"), By.xpath("//android.widget.TextView[contains(@text, 'error') or contains(@text, 'inválida')]")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(CrossPlatform.target("mensaje de error", By.cssSelector(".error-message"), By.xpath("//android.widget.TextView[contains(@text, 'error') or contains(@text, 'inválida')]"))), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }

    @Cuando("ingresa credenciales validas de cliente")
    public void ingresaCredencialesValidasDeCliente() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                IngresarCredenciales.con("cliente@gmail.com", "123456")
        );
    }

    @Entonces("deberia acceder a su panel principal")
    public void deberiaAccederASuPanelPrincipal() {
        OnStage.theActorInTheSpotlight().should(
                seeThat(ElDashboard.cargaParaElRol("cliente"))
        );
    }

    @Dado("que el usuario olvido su contraseña")
    public void queElUsuarioOlvidoSuContrasena() {
        OnStage.theActorCalled("Cliente Olvidadizo").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
                Click.on(CrossPlatform.target("enlace olvido contraseña", By.cssSelector(".forgot-link"), By.xpath("//android.widget.TextView[contains(@text, 'olvidado')]")))
        );
    }

    @Cuando("solicita la recuperacion de contraseña con su correo")
    public void solicitaLaRecuperacionDeContrasenaConSuCorreo() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.actions.Enter.theValue("cliente@gmail.com").into(CrossPlatform.target("email recuperación", By.cssSelector("input[type='email']"), By.xpath("//android.widget.EditText[contains(@text, 'Email')]"))),
                Click.on(CrossPlatform.target("botón enviar", By.cssSelector(".submit-button"), By.xpath("//android.widget.Button[contains(@text, 'Enviar')]")))
        );
    }

    @Entonces("deberia recibir un enlace de recuperacion valido")
    public void deberiaRecibirUnEnlaceDeRecuperacionValido() {
        // Esperamos a que pase al paso 2 antes de la aserción
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("input codigo", By.cssSelector(".code-input"), By.xpath("//android.widget.EditText")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(CrossPlatform.target("input codigo", By.cssSelector(".code-input"), By.xpath("//android.widget.EditText"))), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el cliente ha iniciado sesion en el sistema")
    public void queElClienteHaIniciadoSesionEnElSistema() {
        OnStage.theActorCalled("Cliente Perfil").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(CrossPlatform.target("botón login", By.cssSelector(".login-btn"), By.xpath("//*[@content-desc='btn_login']"))),
                IngresarCredenciales.con("cliente@gmail.com", "123456")
        );
    }

    @Cuando("edita su perfil con nueva informacion")
    public void editaSuPerfilConNuevaInformacion() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("avatar", By.cssSelector(".hc-avatar-btn"), By.xpath("//android.widget.ImageView")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
                Click.on(CrossPlatform.target("avatar", By.cssSelector(".hc-avatar-btn"), By.xpath("//android.widget.ImageView"))),
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn mi perfil", By.xpath("//button[contains(., 'Mi Perfil')]"), By.xpath("//android.widget.TextView[contains(@text, 'Perfil')]")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isClickable()).forNoMoreThan(5).seconds(),
                Click.on(CrossPlatform.target("btn mi perfil", By.xpath("//button[contains(., 'Mi Perfil')]"), By.xpath("//android.widget.TextView[contains(@text, 'Perfil')]"))),
                
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("btn editar perfil", By.cssSelector(".edit-profile-btn"), By.xpath("//android.widget.Button[contains(@text, 'Editar')]")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(10).seconds(),
                Click.on(CrossPlatform.target("btn editar perfil", By.cssSelector(".edit-profile-btn"), By.xpath("//android.widget.Button[contains(@text, 'Editar')]"))),
                
                net.serenitybdd.screenplay.actions.Enter.theValue("Calle Editada " + System.currentTimeMillis()).into(CrossPlatform.target("input direccion", By.id("direccion"), By.xpath("//android.widget.EditText[contains(@text, 'Dirección') or contains(@hint, 'Dirección')]"))).thenHit(org.openqa.selenium.Keys.ENTER)
        );
    }

    @Entonces("los cambios deberian guardarse correctamente y ver un mensaje de confirmacion")
    public void losCambiosDeberianGuardarseCorrectamente() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(CrossPlatform.target("toast", By.cssSelector(".pce-toast"), By.xpath("//android.widget.Toast | //android.widget.TextView[contains(@text, 'éxito')]")), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(CrossPlatform.target("toast", By.cssSelector(".pce-toast"), By.xpath("//android.widget.Toast | //android.widget.TextView[contains(@text, 'éxito')]"))), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }
}



