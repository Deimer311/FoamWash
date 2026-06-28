export declare function sendResetCode(correo: string, codigo: string): Promise<void>;
export interface ReservationDetails {
    id: string;
    fecha: string;
    hora: string;
    direccion: string;
    total: number;
}
export declare function sendServiceConfirmationEmail(correo: string, details: ReservationDetails): Promise<void>;
export declare function sendWelcomeEmail(correo: string, nombre: string): Promise<void>;
export declare function sendCancellationEmail(correo: string, details: {
    id: string;
    fecha: string;
    motivo: string;
}): Promise<void>;
export declare function sendServiceUpdateEmail(correo: string, details: {
    id: string;
    estado: string;
}): Promise<void>;
