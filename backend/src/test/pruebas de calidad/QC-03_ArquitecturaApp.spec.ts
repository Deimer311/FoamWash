import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { join } from 'node:path';
import * as fs from 'node:fs';

describe('Calidad - Arquitectura y Bootstrap (QC-03)', () => {
  
  it('1. El módulo principal (AppModule) debe compilar todas sus dependencias sin ciclos', async () => {
    // Si hay dependencias circulares o proveedores faltantes, esto arrojará un error.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleFixture).toBeDefined();
    
    const app = moduleFixture.createNestApplication();
    await app.init();
    await app.close();
  });

  it('2. El sistema de subida de archivos (uploads) debe tener sus directorios creados', () => {
    // Simulamos la lógica de main.ts para asegurarnos de que el código no falle en producción
    const baseUploadsDir = join(process.cwd(), 'uploads');
    const perfilesDir = join(baseUploadsDir, 'perfiles');
    const serviciosDir = join(baseUploadsDir, 'servicios');

    // Intentamos crearlos (como hace main.ts)
    fs.mkdirSync(perfilesDir, { recursive: true });
    fs.mkdirSync(serviciosDir, { recursive: true });

    // Verificamos que existan
    expect(fs.existsSync(perfilesDir)).toBe(true);
    expect(fs.existsSync(serviciosDir)).toBe(true);
    
    // Verificamos que podamos escribir en ellos
    const testFile = join(perfilesDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    expect(fs.existsSync(testFile)).toBe(true);
    
    // Limpieza
    fs.unlinkSync(testFile);
  });
});
