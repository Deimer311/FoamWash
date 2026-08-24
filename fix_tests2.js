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

replaceInFile("GestionOrdenesEmpleadoStepDefinitions.java", [
    { from: "By.xpath(\".reserva-card, .ag-card\")", to: "By.cssSelector(\".reserva-card, .ag-card\")" }
]);

const btnPanelFrom = "//*[contains(@class, 'nav-btn') or contains(@class, 'nav-item') or contains(@class, 'mobile-btn')]//*[contains(text(), 'Panel')]/.. | //button[contains(., 'Panel')]";
const btnPanelTo = "//button[contains(@class, 'ha-nav-btn') and contains(., 'Panel')] | //button[contains(@class, 'ha-mobile-btn') and contains(., 'Panel')] | //a[contains(@href, '/admin')] | //button[contains(@class, 'fad-nav-btn') and contains(., 'Panel')]";

replaceInFile("GestionOrdenesAdminStepDefinitions.java", [
    { from: btnPanelFrom, to: btnPanelTo }
]);

replaceInFile("GestionUsuariosStepDefinitions.java", [
    { from: btnPanelFrom, to: btnPanelTo }
]);

replaceInFile("ReportesEstadisticasStepDefinitions.java", [
    { from: btnPanelFrom, to: btnPanelTo }
]);

// Wait for stage 2 to render, or use CSS selectors
replaceInFile("FlujoE2EStepDefinitions.java", [
    { from: "By.xpath(\"//input[@type='date']\")", to: "By.cssSelector(\"input[type='date']\")" },
    { from: "By.xpath(\"//input[@type='time']\")", to: "By.cssSelector(\"input[type='time']\")" }
]);

replaceInFile("ServiciosClienteStepDefinitions.java", [
    { from: "By.xpath(\"//input[@type='date']\")", to: "By.cssSelector(\"input[type='date']\")" },
    { from: "By.xpath(\"//input[@type='time']\")", to: "By.cssSelector(\"input[type='time']\")" },
    { from: "By.xpath(\"//textarea\")", to: "By.cssSelector(\"textarea\")" }
]);

console.log("Fixes applied.");
