// jest.config.js
// ============================================================
// Configuración unificada de Jest para TODAS las pruebas
// (Unitarias, de Calidad e Integración)
// ============================================================
const path = require('path');

// Asegurar que durante las pruebas NUNCA se toque la base de datos MySQL
process.env.DATABASE_URL = 'file:./prisma/test.db';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  // Redirigir las importaciones de @prisma/client al cliente SQLite generado
  moduleNameMapper: {
    '^@prisma/client$': path.join(__dirname, 'node_modules/.prisma/test-client'),
  },
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/pruebas e2e/'
  ],
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
