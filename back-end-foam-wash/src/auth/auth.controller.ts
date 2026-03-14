import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common'; // Agregamos UseGuards y Req
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  async findAll() {
    return this.authService.findAll();
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 👇 ESTO ES LO QUE TE FALTA PARA QUITAR EL 404
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    // El JwtAuthGuard se encarga de validar el token
    // y mete la info del usuario en req.user
    return req.user;
  }
}