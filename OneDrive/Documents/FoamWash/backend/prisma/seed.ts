// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tipos = ['Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte'];

  for (const nombre of tipos) {
    await prisma.tipoDeDocumento.upsert({
      where: { nombre_del_documento: nombre },
      update: {},
      create: { nombre_del_documento: nombre },
    });
  }
  console.log('✅ Tipos de documento sembrados');
}

main().catch(console.error).finally(() => prisma.$disconnect());