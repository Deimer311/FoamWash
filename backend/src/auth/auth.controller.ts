  // src/auth/auth.controller.ts
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

  const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    maxAge,
  });

  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}

    // POST /api/auth/register
    @Post('register')
    async register(@Body() dto: RegisterDto, @Res() res: Response) {
      const result = await this.authService.register(dto);

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

    // POST /api/auth/login
    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto, @Res() res: Response) {
      const result = await this.authService.login(dto);

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

    // POST /api/auth/logout
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request, @Res() res: Response) {
      const user = (req as any).user;
      await this.authService.logout(user.id);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.json({ success: true, message: 'Sesión cerrada' });
    }

    // GET /api/auth/me
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: Request) {
      const user = (req as any).user;
      const data = await this.authService.getMe(user.id);
      return { success: true, data };
    }

    // POST /api/auth/request-password-reset
    @Post('request-password-reset')
    async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
      const result = await this.authService.requestPasswordReset(dto);
      return { success: true, ...result };
    }

    // POST /api/auth/verify-reset-code
    @Post('verify-reset-code')
    async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
      const result = await this.authService.verifyResetCode(dto.token);
      return { success: true, ...result };
    }

    // POST /api/auth/reset-password
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
      const result = await this.authService.resetPassword(dto);
      return { success: true, ...result };
    }
  }