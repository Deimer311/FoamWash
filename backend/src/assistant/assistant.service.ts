import { Inject, Injectable, Logger } from '@nestjs/common';
import { ILlmProvider } from './interfaces/llm-provider.interface';
import { ROUTES_CATALOG } from './routes.catalog';
import { AssistantResponse } from './interfaces/assistant-response.interface';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    @Inject('ILlmProvider')
    private readonly llmProvider: ILlmProvider,
  ) {}

  async processCommand(message: string): Promise<AssistantResponse> {
    const systemPrompt = `
Eres el asistente de voz inteligente de FoamWash, un servicio de lavado de mobiliario (colchones, sofás, sillas, alfombras, etc.) en Bogotá y alrededores.
Tu tarea es analizar la consulta o comando de voz del usuario y clasificarla para guiarlo a través de la aplicación.
Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla con el siguiente esquema, sin explicaciones ni markdown:

Esquema de respuesta JSON:
{
  "action": "NAVIGATE" | "ANSWER" | "CONFIRM_CRITICAL_ACTION",
  "targetPath": string | null,
  "spokenMessage": string,
  "screenSummary": string | null
}

Reglas de Negocio:
1. Clasifica la intención del usuario:
   - 'NAVIGATE': Si el usuario expresa el deseo de ver, ir o navegar a una pantalla específica del catálogo.
   - 'ANSWER': Si es una consulta informativa general, aclaración de dudas, precios, etc., y no requiere cambiar de vista.
   - 'CONFIRM_CRITICAL_ACTION': Si el usuario quiere navegar o realizar una acción hacia una ruta que está marcada como crítica (donde isCritical = true).
2. 'targetPath': Debe corresponder exactamente al campo 'path' de la ruta encontrada en el catálogo. Si la acción es 'ANSWER', pon null.
3. 'spokenMessage': Mensaje claro, conciso y natural en español que se leerá al usuario por voz.
4. 'screenSummary': Para 'NAVIGATE' o 'CONFIRM_CRITICAL_ACTION', debe ser un breve resumen o descripción adaptada para personas con discapacidad visual basada en el campo 'screenDescription' del catálogo. Si la acción es 'ANSWER', resume la respuesta brevemente.

Catálogo de rutas disponibles en FoamWash:
${JSON.stringify(ROUTES_CATALOG, null, 2)}
`;

    try {
      this.logger.log(`Procesando comando con LLM: "${message}"`);
      const response = await this.llmProvider.generateStructuredResponse<AssistantResponse>(
        systemPrompt,
        message,
        { type: 'object' },
      );

      if (response && response.action) {
        if (response.targetPath) {
          const matchedRoute = ROUTES_CATALOG.find((r) => r.path === response.targetPath);
          if (matchedRoute?.isCritical) {
            response.action = 'CONFIRM_CRITICAL_ACTION';
          }
        }
        return response;
      }
      throw new Error('Respuesta estructurada inválida.');
    } catch (error: any) {
      this.logger.error(`Error con LLM: ${error.message || error}. Aplicando fallback.`);
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string): AssistantResponse {
    const lowerMessage = message.toLowerCase();

    // 1. Pago / Pasarela
    if (lowerMessage.includes('pagar') || lowerMessage.includes('pago') || lowerMessage.includes('tarjeta') || lowerMessage.includes('checkout') || lowerMessage.includes('pasarela')) {
      return {
        action: 'CONFIRM_CRITICAL_ACTION',
        targetPath: '/pasarela-pago',
        spokenMessage: '¿Deseas proceder a la pasarela de pago? Esta es una zona de transacción crítica.',
        screenSummary: 'Pantalla de facturación y pasarela de pago seguro. Requiere confirmación de datos de tarjeta o método de pago para completar la transacción.',
      };
    }

    // 2. Agendamiento
    if (lowerMessage.includes('agendar') || lowerMessage.includes('cita') || lowerMessage.includes('reserva') || lowerMessage.includes('turno') || lowerMessage.includes('cotizar') || lowerMessage.includes('cotización')) {
      return {
        action: 'NAVIGATE',
        targetPath: '/agendamiento',
        spokenMessage: 'Te estoy llevando a la sección para programar tu cita.',
        screenSummary: 'Formulario y selector de fechas para agendar una cita. Permite seleccionar fecha, hora, tipo de vehículo y servicios a programar.',
      };
    }

    // 3. Servicios
    if (lowerMessage.includes('servicio') || lowerMessage.includes('lavado') || lowerMessage.includes('precio') || lowerMessage.includes('catálogo')) {
      return {
        action: 'NAVIGATE',
        targetPath: '/servicios',
        spokenMessage: 'Abriendo el catálogo de servicios de FoamWash.',
        screenSummary: 'Sección del catálogo de servicios. Lista de tipos de lavado, precios, duraciones y detalles de limpieza para muebles, sofás y colchones.',
      };
    }

    // 4. Inicio / Home
    if (lowerMessage.includes('inicio') || lowerMessage.includes('home') || lowerMessage.includes('principal') || lowerMessage.includes('bienvenida')) {
      return {
        action: 'NAVIGATE',
        targetPath: '/',
        spokenMessage: 'Volviendo a la página de inicio.',
        screenSummary: 'Pantalla principal de bienvenida de Foam Wash. Muestra la introducción del lavado de muebles, botones de inicio de sesión y acceso directo a servicios.',
      };
    }

    return {
      action: 'ANSWER',
      targetPath: null,
      spokenMessage: 'Disculpa, no logré entender tu solicitud. ¿Podrías repetirla o intentar de otra manera?',
      screenSummary: 'Asistente de voz listo para escuchar comandos relacionados con servicios, agendamiento de citas o pagos.',
    };
  }
}
