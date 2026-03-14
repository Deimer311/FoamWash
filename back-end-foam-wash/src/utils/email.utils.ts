import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendResetCode(email: string, code: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@foamwash.com',
    to: email,
    subject: 'Código de recuperación de contraseña',
    html: `
      <h2>Recuperación de Contraseña</h2>
      <p>Tu código de recuperación es: <strong>${code}</strong></p>
      <p>Este código expira en 15 minutos.</p>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@foamwash.com',
    to: email,
    subject: 'Verifica tu correo',
    html: `
      <h2>Verificación de Correo</h2>
      <p>Haz clic en el enlace para verificar tu correo:</p>
      <a href="${verificationUrl}">Verificar correo</a>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
