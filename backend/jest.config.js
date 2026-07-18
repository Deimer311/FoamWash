// jest.config.js
// ============================================================
// Configuración unificada de Jest para TODAS las pruebas
// (Unitarias, de Calidad e Integración)
// ============================================================
const path = require('path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  // Ejecuta cualquier archivo que termine en .spec.ts en cualquier carpeta
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // Timeout generoso para las operaciones de base de datos
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: {
        strictPropertyInitialization: false,
      },
    },
  },
  // Reporter global unificado
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: '🚿 FoamWash — Reporte Global de Pruebas',
        publicPath: path.join(__dirname, 'test-reports'),
        filename: process.env.JEST_HTML_REPORTERS_FILE_NAME || 'foamwash-global-report.html',
        expand: true,
        openReport: false,
        darkTheme: true,
        includeFailureMsg: true,
        inlineSource: true, // Importante: incrusta todo en un solo HTML para poder traducirlo
        logoImgPath: undefined,
        hideIcon: false
      },
    ],
  ],
};
