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
                Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
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
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".hc-header"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(org.openqa.selenium.By.cssSelector(".hc-header")), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el usuario se encuentra en la pagina de inicio de sesion")
    public void queElUsuarioSeEncuentraEnLaPaginaDeInicioDeSesion() {
        OnStage.theActorCalled("Cliente").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(org.openqa.selenium.By.cssSelector(".login-btn"))
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
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".error-message"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(org.openqa.selenium.By.cssSelector(".error-message")), 
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
                Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
                Click.on(org.openqa.selenium.By.cssSelector(".forgot-link"))
        );
    }

    @Cuando("solicita la recuperacion de contraseña con su correo")
    public void solicitaLaRecuperacionDeContrasenaConSuCorreo() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.actions.Enter.theValue("cliente@gmail.com").into(org.openqa.selenium.By.cssSelector("input[type='email']")),
                Click.on(org.openqa.selenium.By.cssSelector(".submit-button"))
        );
    }

    @Entonces("deberia recibir un enlace de recuperacion valido")
    public void deberiaRecibirUnEnlaceDeRecuperacionValido() {
        // Esperamos a que pase al paso 2 antes de la aserción
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".code-input"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(org.openqa.selenium.By.cssSelector(".code-input")), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }

    @Dado("que el cliente ha iniciado sesion en el sistema")
    public void queElClienteHaIniciadoSesionEnElSistema() {
        OnStage.theActorCalled("Cliente Perfil").wasAbleTo(
                new AbrirPagina()
        );
        OnStage.theActorInTheSpotlight().attemptsTo(
                Click.on(org.openqa.selenium.By.cssSelector(".login-btn")),
                IngresarCredenciales.con("cliente@gmail.com", "123456")
        );
    }

    @Cuando("edita su perfil con nueva informacion")
    public void editaSuPerfilConNuevaInformacion() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".hc-avatar-btn"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds(),
                Click.on(org.openqa.selenium.By.cssSelector(".hc-avatar-btn")),
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.xpath("//button[contains(., 'Mi Perfil')]"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isClickable()).forNoMoreThan(5).seconds(),
                Click.on(org.openqa.selenium.By.xpath("//button[contains(., 'Mi Perfil')]")),
                
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".edit-profile-btn"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(10).seconds(),
                Click.on(org.openqa.selenium.By.cssSelector(".edit-profile-btn")),
                
                net.serenitybdd.screenplay.actions.Enter.theValue("Calle Editada " + System.currentTimeMillis()).into(org.openqa.selenium.By.id("direccion")).thenHit(org.openqa.selenium.Keys.ENTER)
        );
    }

    @Entonces("los cambios deberian guardarse correctamente y ver un mensaje de confirmacion")
    public void losCambiosDeberianGuardarseCorrectamente() {
        OnStage.theActorInTheSpotlight().attemptsTo(
                net.serenitybdd.screenplay.waits.WaitUntil.the(org.openqa.selenium.By.cssSelector(".pce-toast"), net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible()).forNoMoreThan(5).seconds()
        );
        OnStage.theActorInTheSpotlight().should(
                seeThat(net.serenitybdd.screenplay.questions.WebElementQuestion.the(org.openqa.selenium.By.cssSelector(".pce-toast")), 
                        net.serenitybdd.screenplay.matchers.WebElementStateMatchers.isVisible())
        );
    }
}

