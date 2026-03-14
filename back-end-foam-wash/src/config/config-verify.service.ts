import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigVerifyService implements OnModuleInit {
  private readonly logger = new Logger('ConfigVerify');

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.verifyConfiguration();
  }

  verifyConfiguration() {
    this.logger.log('🔍 VERIFICANDO CONFIGURACIÓN DEL SISTEMA...');
    let allGood = true;

    // 1. VERIFICAR VARIABLES DE ENTORNO
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'PORT'];
    
    console.log('\n📋 Variables de Entorno:');
    console.log('─'.repeat(40));
    
    requiredEnvVars.forEach(varName => {
      const value = this.configService.get(varName);
      if (value) {
        console.log(`✅ ${varName.padEnd(12)}: Configurado`);
      } else {
        console.log(`❌ ${varName.padEnd(12)}: FALTA`);
        allGood = false;
      }
    });

    // 2. VERIFICAR ARCHIVOS DE CONSTANTES (Estructura NestJS)
    // En NestJS solemos usar archivos .ts en src/common/constants
    console.log('\n📋 Verificando archivos clave:');
    console.log('─'.repeat(40));

    const keyFiles = [
      'src/common/constants/roles.ts',
      'src/common/constants/errors.ts',
      'src/database/database.module.ts'
    ];

    keyFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`⚠️  ${file} (Recomendado crear)`);
      }
    });

    // RESULTADO FINAL
    console.log('\n' + '='.repeat(40));
    if (allGood) {
      this.logger.log('✅ ¡CONFIGURACIÓN BASE CORRECTA!');
    } else {
      this.logger.error('❌ FALTAN VARIABLES CRÍTICAS EN EL .ENV');
    }
    console.log('='.repeat(40) + '\n');
  }
}