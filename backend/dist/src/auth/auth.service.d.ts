import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    private generateTokenPair;
    register(dto: RegisterDto): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: {
            id: number;
            nombre: string;
            correo: string;
            rol: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: {
            id: number;
            nombre: string;
            correo: string;
            rol: string;
            foto_perfil: string;
        };
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
    getMe(userId: number): Promise<{
        rol: {
            Rol: string;
            Id_Rol: number;
        };
        tipo_de_documento: {
            idTipo_de_Documento: number;
            nombre_del_documento: string;
        };
        Id_Usuario: number;
        N_Documento: string | null;
        Correo: string | null;
        Nombre: string | null;
        Telefono: string | null;
        Direccion: string | null;
        estado: import(".prisma/client").$Enums.usuario_estado | null;
        rol_Id_Rol: number | null;
        tipo_de_documento_id_tipo_de_documento: number | null;
        last_login: Date | null;
        fecha_registro: Date | null;
        token_created_at: Date | null;
        token_expires_at: Date | null;
        foto_perfil: string | null;
    }>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        message: string;
    }>;
    verifyResetCode(token: string): Promise<{
        valid: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
