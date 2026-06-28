import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<Response<any, Record<string, any>>>;
    login(dto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMe(req: Request): Promise<{
        success: boolean;
        data: {
            tipo_de_documento: {
                idTipo_de_Documento: number;
                nombre_del_documento: string;
            };
            rol: {
                Id_Rol: number;
                Rol: string;
            };
            Id_Usuario: number;
            Nombre: string | null;
            Telefono: string | null;
            N_Documento: string | null;
            Direccion: string | null;
            Correo: string | null;
            estado: import(".prisma/client").$Enums.usuario_estado | null;
            rol_Id_Rol: number | null;
            tipo_de_documento_id_tipo_de_documento: number | null;
            last_login: Date | null;
            fecha_registro: Date | null;
            token_created_at: Date | null;
            token_expires_at: Date | null;
            foto_perfil: string | null;
        };
    }>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        message: string;
        success: boolean;
    }>;
    verifyResetCode(dto: VerifyResetCodeDto): Promise<{
        valid: boolean;
        message: string;
        success: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
        success: boolean;
    }>;
}
