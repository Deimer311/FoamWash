export declare function sendResetCode(correo: string, codigo: string): Promise<void>;
export interface ReservationDetails {
    id: string;
    fecha: string;
    hora: string;
    direccion: string;
    total: number;
}
export declare function sendServiceConfirmationEmail(correo: string, details: ReservationDetails): Promise<void>;
