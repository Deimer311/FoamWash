import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        estado: true,
        rol_Id_Rol: true,
      },
      
    });
  }

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.usuario.findUnique({
      where: { Correo: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dto.password, salt);

    return this.prisma.usuario.create({
      data: {
        Nombre: dto.Nombre,
        Correo: dto.email,
        password_hash: hash,
        Telefono: dto.Telefono,
        rol_Id_Rol: dto.rol_Id_Rol || 3,
        estado: 'activo',
      },
    });
  }

  async login(dto: LoginDto) {
    // 1. Buscamos al usuario (usando Correo que es como está en tu Prisma)
    const user = await this.prisma.usuario.findUnique({
      where: { Correo: dto.email },
      include: { rol: true } // Opcional: para traer el nombre del rol si tienes la relación
    });

    // 2. Validamos credenciales
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Creamos un payload más completo para el token
    const payload = { 
      id: user.Id_Usuario, 
      email: user.Correo,
      role: user.rol_Id_Rol // O el nombre del rol si lo tienes
    };

    // 4. Devolvemos el formato exacto que espera tu nuevo Controller
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.Id_Usuario,
        nombre: user.Nombre,
        email: user.Correo,
        role: user.rol_Id_Rol
      }
    };
  }
}