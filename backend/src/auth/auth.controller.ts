  // src/auth/auth.controller.ts
  // ============================================================
  // Controlador de autenticación con soporte dual:
  // - Web (navegador): usa cookies HttpOnly
  // - App móvil (Capacitor): usa Authorization header Bearer token
  //
  // Cómo detecta si es móvil:
  // La app móvil envía el header "x-client-type: mobile" en cada petición.
  // El frontend web NO envía ese header, por lo que el backend sabe
  // automáticamente qué tipo de cliente está haciendo la petición.
  // ============================================================
  import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
  } from '@nestjs/common';
  import { Response, Request } from 'express';
  import { AuthService } from './auth.service';
  import {
    RegisterDto,
    LoginDto,
    RequestPasswordResetDto,
    VerifyResetCodeDto,
    ResetPasswordDto,
  } from './dto/auth.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';

  // ── Configuración de cookies para el navegador web ────────────
  // httpOnly: true → la cookie no es accesible desde JavaScript (seguridad XSS)
  // secure: true → solo se envía por HTTPS
  // sameSite: 'none' → necesario para cross-domain (Netlify ↔ Railway)
  const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    maxAge,
  });

  // ── Helper: detectar si la petición viene de la app móvil ─────
  // La app móvil (Capacitor) debe enviar el header "x-client-type: mobile"
  // en todas sus peticiones para que el backend lo detecte correctamente
  const isMobileClient = (req: Request): boolean => {
    return req.headers['x-client-type'] === 'mobile';
  };

  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}

    // ── POST /api/auth/register ───────────────────────────────
    // Registra un nuevo usuario en el sistema
    // Web: guarda tokens en cookies HttpOnly
    // Móvil: devuelve tokens en el body JSON para guardar en localStorage
    @Post('register')
    async register(@Body() dto: RegisterDto, @Req() req: Request, @Res() res: Response) {
      const result = await this.authService.register(dto);

      if (isMobileClient(req)) {
        // ── Respuesta para app móvil ──────────────────────────
        // No usamos cookies — el cliente guarda el token en localStorage
        // y lo enviará en el header Authorization: Bearer <token>
        return res.status(201).json({
          success: true,
          message: 'Usuario registrado exitosamente',
          access_token: result.tokens.accessToken,
          refresh_token: result.tokens.refreshToken,
          data: result.user,
        });
      }

      // ── Respuesta para navegador web ──────────────────────────
      // Guardamos los tokens en cookies HttpOnly (más seguro para web)
      res.cookie('accessToken', result.tokens.accessToken, cookieOptions(15 * 60 * 1000));
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        data: result.user,
      });
    }

    // ── POST /api/auth/login ──────────────────────────────────
    // Inicia sesión con email y contraseña
    // Web: guarda tokens en cookies HttpOnly
    // Móvil: devuelve tokens en el body JSON
    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
      const result = await this.authService.login(dto);

      if (isMobileClient(req)) {
        // ── Respuesta para app móvil ──────────────────────────
        // El cliente Capacitor recibe el token y lo guarda en localStorage
        return res.status(200).json({
          success: true,
          message: 'Login exitoso',
          access_token: result.tokens.accessToken,
          refresh_token: result.tokens.refreshToken,
          data: result.user,
        });
      }

      // ── Respuesta para navegador web ──────────────────────────
      // Cookies HttpOnly — el navegador las maneja automáticamente
      res.cookie('accessToken', result.tokens.accessToken, cookieOptions(15 * 60 * 1000));
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        data: result.user,
      });
    }

    // ── POST /api/auth/logout ─────────────────────────────────
    // Cierra la sesión del usuario
    // Web: elimina las cookies
    // Móvil: el cliente debe eliminar el token de localStorage
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request, @Res() res: Response) {
      const user = (req as any).user;
      await this.authService.logout(user.id);

      if (isMobileClient(req)) {
        // ── Logout móvil ──────────────────────────────────────
        // Solo confirmamos el logout — el cliente elimina el token de localStorage
        return res.json({ success: true, message: 'Sesión cerrada' });
      }

      // ── Logout web ────────────────────────────────────────────
      // Eliminamos las cookies del navegador
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.json({ success: true, message: 'Sesión cerrada' });
    }

    // ── GET /api/auth/me ──────────────────────────────────────
    // Devuelve los datos del usuario autenticado
    // Funciona igual para web y móvil — el JwtAuthGuard acepta ambos métodos
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: Request) {
      const user = (req as any).user;
      const data = await this.authService.getMe(user.id);
      return { success: true, data };
    }

    // ── POST /api/auth/request-password-reset ─────────────────
    // Solicita un código de recuperación de contraseña por email
    @Post('request-password-reset')
    async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
      const result = await this.authService.requestPasswordReset(dto);
      return { success: true, ...result };
    }

    // ── POST /api/auth/verify-reset-code ──────────────────────
    // Verifica que el código de recuperación sea válido
    @Post('verify-reset-code')
    async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
      const result = await this.authService.verifyResetCode(dto.token);
      return { success: true, ...result };
    }

    // ── POST /api/auth/reset-password ─────────────────────────
    // Cambia la contraseña usando el código de recuperación verificado
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
      const result = await this.authService.resetPassword(dto);
      return { success: true, ...result };
    }
  }