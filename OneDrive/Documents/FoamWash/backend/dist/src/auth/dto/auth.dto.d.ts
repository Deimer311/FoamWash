export declare class RegisterDto {
    nombre: string;
    correo: string;
    password: string;
    telefono?: string;
    direccion?: string;
    tipoDocumentoId?: number;
    role?: string;
}
export declare class LoginDto {
    correo: string;
    password: string;
}
export declare class RequestPasswordResetDto {
    correo: string;
}
export declare class VerifyResetCodeDto {
    token: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
