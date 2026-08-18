package com.foamwash.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import net.thucydides.model.environment.SystemEnvironmentVariables;
import net.thucydides.model.util.EnvironmentVariables;
import org.openqa.selenium.By;

public class CrossPlatform {

    public static Target target(String targetName, By webLocator, By mobileLocator) {
        EnvironmentVariables variables = SystemEnvironmentVariables.createEnvironmentVariables();
        String environment = variables.getProperty("environment", "default");
        String driver = variables.getProperty("webdriver.driver", "chrome");

        if ("mobile".equalsIgnoreCase(environment) || "appium".equalsIgnoreCase(driver)) {
            return Target.the(targetName).located(mobileLocator);
        } else {
            return Target.the(targetName).located(webLocator);
        }
    }

    public static boolean isMobile() {
        EnvironmentVariables variables = SystemEnvironmentVariables.createEnvironmentVariables();
        String environment = variables.getProperty("environment", "default");
        String driver = variables.getProperty("webdriver.driver", "chrome");
        return "mobile".equalsIgnoreCase(environment) || "appium".equalsIgnoreCase(driver);
    }
}
