"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetCode = sendResetCode;
exports.sendServiceConfirmationEmail = sendServiceConfirmationEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendCancellationEmail = sendCancellationEmail;
exports.sendServiceUpdateEmail = sendServiceUpdateEmail;
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
async function sendResetCode(correo, codigo) {
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
async function sendServiceConfirmationEmail(correo, details) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    });
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Foam Wash" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: '🎉 ¡Tu pedido ha sido confirmado! - Foam Wash',
        html: `
      <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="padding: 40px 30px 20px; text-align: center;">
            <div style="width: 80px; height: 80px; background-color: #f3f0ff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              🎉
            </div>
            
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 10px;">¡Pedido confirmado!</h1>
            <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 30px;">ID: ${details.id}</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 20px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #334155;">
                <span style="display: inline-block; width: 24px;">📅</span> <strong>Fecha:</strong> <span style="color: #64748b;">${details.fecha}</span>
              </p>
              <p style="margin: 0 0 12px; font-size: 14px; color: #334155;">
                <span style="display: inline-block; width: 24px;">⏰</span> <strong>Hora:</strong> <span style="color: #64748b;">${details.hora}</span>
              </p>
              <p style="margin: 0; font-size: 14px; color: #334155;">
                <span style="display: inline-block; width: 24px;">📍</span> <strong>Dirección:</strong> <span style="color: #64748b;">${details.direccion}</span>
              </p>
            </div>

            <div style="background-color: #f5f3ff; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <span style="color: #4b5563; font-weight: 600;">Total</span>
              <span style="color: #6d28d9; font-size: 24px; font-weight: 800;">${formatter.format(details.total)}</span>
            </div>

            <a href="#" style="display: block; background-color: #6d28d9; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 12px; font-weight: bold; font-size: 16px; text-align: center;">
              ¡Listo!
            </a>
          </div>

        </div>
      </div>
    `,
    });
}
async function sendWelcomeEmail(correo, nombre) {
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
        subject: '¡Bienvenido a Foam Wash! 🚗✨',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
        <h2 style="color: #2563eb;">¡Hola ${nombre}, bienvenido a Foam Wash!</h2>
        <p>Tu registro se ha completado exitosamente.</p>
        <p style="color: #6b7280;">Estamos felices de tenerte con nosotros.</p>
      </div>
    `,
    });
}
async function sendCancellationEmail(correo, details) {
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
        subject: '⚠️ Reserva Cancelada - Foam Wash',
        html: `
      <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="padding: 40px 30px 20px; text-align: center;">
            <div style="width: 80px; height: 80px; background-color: #fef2f2; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #ef4444;">
              ⚠️
            </div>
            
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 10px;">Reserva Cancelada</h1>
            <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 30px;">ID: ${details.id}</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 20px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #334155;">
                <span style="display: inline-block; width: 24px;">📅</span> <strong>Fecha de reserva:</strong> <span style="color: #64748b;">${details.fecha}</span>
              </p>
              <p style="margin: 0; font-size: 14px; color: #334155;">
                <span style="display: inline-block; width: 24px;">📝</span> <strong>Motivo de cancelación:</strong> <br><br>
                <span style="color: #ef4444; font-weight: 500;">${details.motivo}</span>
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
              Lamentamos los inconvenientes. Si tienes alguna pregunta, puedes comunicarte con soporte.
            </p>
          </div>
        </div>
      </div>
    `,
    });
}
async function sendServiceUpdateEmail(correo, details) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    let color = '#3b82f6';
    let emoji = 'ℹ️';
    let mensaje = 'El estado de tu reserva ha sido actualizado.';
    if (details.estado === 'En Camino') {
        color = '#f59e0b';
        emoji = '🚗';
        mensaje = '¡Tu trabajador va en camino a tu dirección!';
    }
    else if (details.estado === 'En Progreso') {
        color = '#8b5cf6';
        emoji = '🧼';
        mensaje = '¡El servicio ha comenzado! Estamos trabajando en tu Servicio.';
    }
    else if (details.estado === 'Completado') {
        color = '#10b981';
        emoji = '✨';
        mensaje = '¡El servicio ha finalizado con éxito! Esperamos que lo disfrutes.';
    }
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Foam Wash" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: `${emoji} Actualización de tu Reserva - Foam Wash`,
        html: `
      <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="padding: 40px 30px 20px; text-align: center;">
            <div style="width: 80px; height: 80px; background-color: ${color}15; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: ${color};">
              ${emoji}
            </div>
            
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 10px;">Tu servicio está: ${details.estado}</h1>
            <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 30px;">ID de Reserva: ${details.id}</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 15px; color: #334155;">
                ${mensaje}
              </p>
            </div>
            
            <a href="#" style="display: block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 12px; font-weight: bold; font-size: 16px; text-align: center;">
              Ver Detalles en la App
            </a>
          </div>
        </div>
      </div>
    `,
    });
}
//# sourceMappingURL=email.util.js.map