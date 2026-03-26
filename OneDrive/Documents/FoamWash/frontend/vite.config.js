/**
 * ARCHIVO DE CONFIGURACIÓN DE VITE PARA EL PROYECTO FOAMWASH-REACT
 * La nomenclatura de este proyecto es GAMMA, lo que significa que es una versión
 * en desarrollo y puede contener características experimentales o cambios significativos
 * en comparación con versiones anteriores. Este archivo de configuración está diseñado para
 * optimizar el proceso de desarrollo y construcción de la aplicación React utilizando Vite.
 * Vite es una herramienta de construcción rápida que aprovecha las capacidades modernas del navegador
 * para mejorar la experiencia de desarrollo. En este archivo, se configuran aspectos como la resolución
 * de módulos, la configuración del servidor de desarrollo, y las opciones de construcción para garantizar
 * un flujo de trabajo eficiente y una aplicación optimizada.
 */

import { defineConfig } from "vite";// Importa la función defineConfig de Vite para definir la configuración del proyecto
import react from "@vitejs/plugin-react";// Importa el plugin de React para Vite, que permite la integración de React en el proyecto

// Exporta la configuración de Vite utilizando defineConfig
export default defineConfig({
  plugins: [react()],// Agrega el plugin de React a la configuración de Vite
  server:{
    port: 3000, // Configura el puerto del servidor de desarrollo a 3000
  },
  esbuild:{
    include: /\.(js|jsx|ts|tsx)$/,// Configura esbuild para incluir archivos con extensiones .js, .jsx, .ts y .tsx
    exclude: [],// No se excluyen archivos específicos en esta configuración
    loader: 'jsx',// Configura el cargador de esbuild para manejar archivos JSX
  },
  optimizeDeps:{
    esbuildOptions:{
      loader:{
        '.js':'jsx',// Configura esbuild para tratar los archivos .js como JSX, lo que es útil para proyectos React
      },
    },
  },
})
