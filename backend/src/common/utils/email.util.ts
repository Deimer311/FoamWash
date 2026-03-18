// src/common/utils/email.util.ts
// ============================================================
// Reemplaza src/utils/email.utils.js
// ============================================================
import * as nodemailer from 'nodemailer';

export async function sendResetCode(correo: string, codigo: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Foam Wash" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: '🔐 Código de recuperación - Foam Wash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recuperación de contraseña</h2>
        <p>Tu código de recuperación es:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${codigo}</span>
        </div>
        <p style="color: #6b7280;">Este código expira en <strong>15 minutos</strong>.</p>
        <p style="color: #6b7280;">Si no solicitaste este código, ignora este correo.</p>
      </div>
    `,
  });
}
