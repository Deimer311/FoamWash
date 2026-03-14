import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // Captura todo tipo de errores
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error capturado por GlobalFilter:');
      console.error(exception);
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    // 1. Si es un error de NestJS (HttpException)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resContent: any = exception.getResponse();
      message = resContent.message || resContent;
      errorCode = resContent.code || 'HTTP_ERROR';
    } 
    
    // 2. Manejo de errores específicos de MySQL (sustituye tu lógica de err.code.startsWith('ER_'))
    else if (exception.code && typeof exception.code === 'string' && exception.code.startsWith('ER_')) {
      switch (exception.code) {
        case 'ER_DUP_ENTRY':
          statusCode = HttpStatus.CONFLICT;
          errorCode = 'RES_CONFLICT';
          message = 'Ya existe un registro con esos datos';
          break;
        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = 'VAL_INVALID_INPUT';
          message = 'Referencia inválida a otro registro';
          break;
        default:
          message = 'Error de base de datos';
          errorCode = 'DB_ERROR';
      }
    }

    // 3. Estructura de respuesta consistente
    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message[0] : message, // Maneja errores de validación de Nest
      },
    };

    // Agregar stack trace solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      (errorResponse.error as any).stack = exception.stack;
    }

    response.status(statusCode).json(errorResponse);
  }
}