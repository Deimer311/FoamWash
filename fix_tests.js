const fs = require("node:fs");
const path = require("node:path");

const stepDefsDir = "pruebas_e2e/src/test/java/com/foamwash/stepdefinitions";

function replaceInFile(filename, replacements) {
    const filePath = path.join(stepDefsDir, filename);
    let content = fs.readFileSync(filePath, "utf-8");
    for (const repl of replacements) {
        content = content.split(repl.from).join(repl.to);
    }
    fs.writeFileSync(filePath, content, "utf-8");
}

replaceInFile("AutenticacionStepDefinitions.java", [
    { from: "\"mi perfil\"", to: "\"perfil\"" }
]);

replaceInFile("FlujoE2EStepDefinitions.java", [
    { from: "Ver cotización", to: "cotizaci" },
    { from: "Ver cotizacin", to: "cotizaci" },
    { from: "Ver cotizaci", to: "Continuar" } // We need to match Continuar Agendamiento or Solicitar Cotizaci
]);

const btnPanelFrom = "\"//button[contains(@class, 'ha-nav-btn') and contains(., 'Panel')]\"";
const btnPanelTo = "\"//*[contains(@class, 'nav-btn') or contains(@class, 'nav-item') or contains(@class, 'mobile-btn')]//*[contains(text(), 'Panel')]/.. | //button[contains(., 'Panel')]\"";

replaceInFile("GestionOrdenesAdminStepDefinitions.java", [
    { from: btnPanelFrom, to: btnPanelTo }
]);

replaceInFile("GestionOrdenesEmpleadoStepDefinitions.java", [
    { from: "\"//*[contains(@class, 'ag-card')]\"", to: "\".reserva-card, .ag-card\"" },
    { from: String.raw`By.xpath("//*[contains(@class, \'ag-card\')]")`, to: "By.cssSelector(\".reserva-card, .ag-card\")" }
]);

replaceInFile("ReportesEstadisticasStepDefinitions.java", [
    { from: btnPanelFrom, to: btnPanelTo }
]);

replaceInFile("ServiciosClienteStepDefinitions.java", [
    { from: "\"Ver cotización\"", to: "\"Continuar\"" },
    { from: String.raw`By.xpath("//button[contains(., \'Continuar\')]|//button[contains(@class, \'fwm-btn-primary\')]")`, to: String.raw`By.xpath("//button[contains(., \'Continuar\') or contains(., \'Solicitar Cotizaci\')]")` },
    { from: ".history-list", to: ".agendamientos-list, .history-list" },
    { from: "input_detalle", to: "input_observaciones" },
    { from: "input detalle", to: "input observaciones" }
]);

replaceInFile("GestionUsuariosStepDefinitions.java", [
    { from: "By.xpath(\"//span[text()='Panel']/..\")", to: btnPanelTo },
    { from: ".ha-nav-btn, .ha-mobile-btn", to: btnPanelTo }
]);

console.log("Fixes applied.");
