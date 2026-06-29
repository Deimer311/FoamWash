import com.android.build.gradle.BaseExtension

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    plugins.withId("com.android.library") {
        extensions.configure<BaseExtension> {
            if (namespace.isNullOrEmpty()) {
                namespace = project.group.toString().takeIf { it.isNotBlank() } 
                            ?: "com.example.${project.name.replace("-", ".")}"
            }
        }
    }
    plugins.withId("com.android.application") {
        extensions.configure<BaseExtension> {
            if (namespace.isNullOrEmpty()) {
                namespace = project.group.toString().takeIf { it.isNotBlank() } 
                            ?: "com.example.${project.name.replace("-", ".")}"
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
