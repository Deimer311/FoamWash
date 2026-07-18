import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const users = await p.usuario.findMany({
    select: { Id_Usuario: true, Nombre: true, Correo: true, estado: true },
    take: 10
  });
  console.log('Usuarios encontrados:', users.length);
  console.log(JSON.stringify(users, null, 2));
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await p.$disconnect();
}
