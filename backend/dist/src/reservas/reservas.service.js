"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_util_1 = require("../common/utils/email.util");
const notifications_service_1 = require("../notifications/notifications.service");
let ReservasService = class ReservasService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async findAll() {
        return this.prisma.reserva.findMany({
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
                observacion: { select: { Observaciones: true, estado: true } },
                empleado: { select: { Nombre: true } },
                servicios: true,
            },
            orderBy: [{ fecha: 'desc' }],
        });
    }
    async findByEstado(estado) {
        return this.prisma.reserva.findMany({
            where: { Estado: estado },
            include: {
                cliente: { select: { Nombre: true, Telefono: true } },
            },
            orderBy: [{ fecha: 'asc' }],
        });
    }
    async findOne(id) {
        const reserva = await this.prisma.reserva.findUnique({
            where: { ID_Reserva: id },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
                empleado: { select: { Nombre: true } },
                servicios: true,
                observacion: true,
            },
        });
        if (!reserva)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return reserva;
    }
    async asignarEmpleadoAutomatico(fecha) {
        const empleadosActivos = await this.prisma.usuario.findMany({
            where: {
                rol_Id_Rol: 2,
                estado: 'activo',
            },
            select: {
                Id_Usuario: true,
                Nombre: true,
                empleado: { select: { dias_laborales: true } }
            },
        });
        if (empleadosActivos.length === 0)
            return null;
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaReserva = dias[fecha.getDay()];
        const empleadosDisponibles = empleadosActivos.filter(emp => {
            if (!emp.empleado || emp.empleado.length === 0)
                return true;
            const diasLaborales = (emp.empleado[0].dias_laborales || '')
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!diasLaborales)
                return true;
            return diasLaborales.includes(diaReserva);
        });
        if (empleadosDisponibles.length === 0)
            return null;
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        const cargaPorEmpleado = await Promise.all(empleadosDisponibles.map(async (emp) => {
            const cantidad = await this.prisma.reserva.count({
                where: {
                    empleado_Id_Usuario: emp.Id_Usuario,
                    fecha: { gte: fechaInicio, lte: fechaFin },
                    Estado: { notIn: ['Cancelado'] },
                },
            });
            return { empId: emp.Id_Usuario, reservasEnElDia: cantidad };
        }));
        cargaPorEmpleado.sort((a, b) => a.reservasEnElDia - b.reservasEnElDia);
        return cargaPorEmpleado[0].empId;
    }
    async create(data) {
        let fechaISO = undefined;
        if (data.fecha) {
            const soloFecha = data.fecha.split('T')[0];
            fechaISO = new Date(`${soloFecha}T00:00:00.000Z`);
        }
        let horaISO = undefined;
        if (data.Hora && data.Hora.match(/^\d{2}:\d{2}$/)) {
            const horaStr = data.Hora.split(':')[0];
            const horaNum = parseInt(horaStr, 10);
            if (horaNum < 8 || horaNum > 17) {
                throw new common_1.BadRequestException('La hora de reserva debe estar dentro del horario laboral (08:00 a 17:00).');
            }
            horaISO = new Date(`1970-01-01T${data.Hora}:00.000Z`);
        }
        if (fechaISO && horaISO) {
            const fechaHoraReserva = new Date(fechaISO);
            fechaHoraReserva.setUTCHours(horaISO.getUTCHours(), horaISO.getUTCMinutes(), 0, 0);
            const ahora = new Date();
            const ahoraColombia = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
            const reservaColombia = new Date(fechaHoraReserva.getTime() - (5 * 60 * 60 * 1000));
            if (reservaColombia < ahoraColombia) {
                throw new common_1.BadRequestException('No se pueden crear reservas en el pasado.');
            }
        }
        const observacionData = data.observacion_Id_Observaciones
            ? { connect: { Id_Observaciones: data.observacion_Id_Observaciones } }
            : { create: { Observaciones: data.Informacion_adicional ?? '', estado: 'Pendiente' } };
        let empleadoId = data.empleado_Id_Usuario ?? null;
        if (!empleadoId && fechaISO) {
            empleadoId = await this.asignarEmpleadoAutomatico(fechaISO);
        }
        const reserva = await this.prisma.reserva.create({
            data: {
                Estado: data.Estado ?? 'Pendiente',
                fecha: fechaISO,
                Hora: horaISO,
                Informacion_adicional: data.Informacion_adicional,
                cliente: { connect: { Id_Usuario: data.Id_Usuario } },
                empleado: empleadoId
                    ? { connect: { Id_Usuario: empleadoId } }
                    : undefined,
                observacion: observacionData,
                servicios: data.servicios && data.servicios.length > 0
                    ? { connect: data.servicios.map(s => ({ Id_Servicio: s.Id_Servicio })) }
                    : undefined,
            },
            include: {
                empleado: { select: { Nombre: true, Id_Usuario: true } },
                cliente: true,
                servicios: true,
            },
        });
        try {
            await this.notificationsService.sendToTopic('topic_admin', 'Nueva Reserva Creada', `Reserva #${reserva.ID_Reserva} para el cliente ${reserva.cliente.Nombre}.`, { type: 'nueva_reserva', reservaId: reserva.ID_Reserva.toString() });
        }
        catch (e) {
            console.log('Error enviando push notification:', e);
        }
        if (empleadoId) {
            try {
                await this.notificationsService.sendToTopic(`user_${empleadoId}`, 'Nueva Cita Asignada', `Tienes una nueva reserva #${reserva.ID_Reserva} asignada automáticamente.`, { type: 'nueva_reserva', reservaId: reserva.ID_Reserva.toString() });
            }
            catch (e) {
                console.log('Error enviando push notification al empleado:', e);
            }
        }
        let total = 0;
        if (data.servicios && data.servicios.length > 0) {
            const servicioIds = data.servicios.map(s => s.Id_Servicio);
            const serviciosDb = await this.prisma.servicio.findMany({
                where: { Id_Servicio: { in: servicioIds } },
            });
            total = data.servicios.reduce((sum, reqSvc) => {
                const dbSvc = serviciosDb.find(s => s.Id_Servicio === reqSvc.Id_Servicio);
                return sum + (dbSvc ? Number(dbSvc.Precio) * (reqSvc.cantidad || 1) : 0);
            }, 0);
        }
        if (reserva.cliente && reserva.cliente.Correo) {
            const dateFormatter = new Intl.DateTimeFormat('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'UTC'
            });
            const timeFormatter = new Intl.DateTimeFormat('es-CO', {
                hour: '2-digit', minute: '2-digit',
                timeZone: 'UTC'
            });
            await (0, email_util_1.sendServiceConfirmationEmail)(reserva.cliente.Correo, {
                id: `PED-${reserva.ID_Reserva}`,
                fecha: reserva.fecha ? dateFormatter.format(new Date(reserva.fecha)) : 'Fecha no especificada',
                hora: reserva.Hora ? timeFormatter.format(new Date(reserva.Hora)) : 'Hora no especificada',
                direccion: reserva.cliente.Direccion || 'No especificada',
                total: total
            }).catch(err => console.error('Error al enviar correo de confirmación:', err));
        }
        return {
            success: true,
            data: {
                ...reserva,
                empleado_asignado: reserva.empleado?.Nombre ?? 'Sin asignar',
            },
        };
    }
    async update(id, data) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return this.prisma.reserva.update({ where: { ID_Reserva: id }, data });
    }
    async updateEstado(id, estado) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        const updatedReserva = await this.prisma.reserva.update({
            where: { ID_Reserva: id },
            data: { Estado: estado },
            include: {
                cliente: true,
                servicios: true,
                empleado: true,
            }
        });
        if (estado === 'Confirmado' && updatedReserva.cliente && updatedReserva.cliente.Correo) {
            const total = updatedReserva.servicios.reduce((sum, s) => sum + Number(s.Precio || 0), 0);
            const dateFormatter = new Intl.DateTimeFormat('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'America/Bogota'
            });
            const timeFormatter = new Intl.DateTimeFormat('es-CO', {
                hour: '2-digit', minute: '2-digit',
                timeZone: 'America/Bogota'
            });
            await (0, email_util_1.sendServiceConfirmationEmail)(updatedReserva.cliente.Correo, {
                id: `PED-${updatedReserva.ID_Reserva}`,
                fecha: dateFormatter.format(new Date(updatedReserva.fecha)),
                hora: timeFormatter.format(new Date(updatedReserva.Hora)),
                direccion: updatedReserva.cliente.Direccion || 'No especificada',
                total: total
            }).catch(err => console.error('Error al enviar correo de confirmación (empleado):', err));
        }
        else if (['En Camino', 'En Progreso', 'Completado'].includes(estado) && updatedReserva.cliente && updatedReserva.cliente.Correo) {
            await (0, email_util_1.sendServiceUpdateEmail)(updatedReserva.cliente.Correo, {
                id: `PED-${updatedReserva.ID_Reserva}`,
                estado: estado,
            }).catch(err => console.error('Error al enviar correo de actualización de estado:', err));
        }
        try {
            await this.notificationsService.sendToTopic(`user_${updatedReserva.cliente.Id_Usuario}`, 'Actualización de tu Reserva', `El estado de tu reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`, { type: 'actualizacion_reserva', reservaId: updatedReserva.ID_Reserva.toString(), estado });
        }
        catch (e) { }
        if (updatedReserva.empleado) {
            try {
                await this.notificationsService.sendToTopic(`user_${updatedReserva.empleado.Id_Usuario}`, 'Actualización de Reserva', `El estado de la reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`, { type: 'actualizacion_reserva', reservaId: updatedReserva.ID_Reserva.toString(), estado });
            }
            catch (e) { }
        }
        return updatedReserva;
    }
    async cancelarReserva(id, motivo) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        const updatedReserva = await this.prisma.reserva.update({
            where: { ID_Reserva: id },
            data: { Estado: 'Cancelado' },
            include: { cliente: true, empleado: true }
        });
        if (updatedReserva.cliente && updatedReserva.cliente.Correo) {
            const dateFormatter = new Intl.DateTimeFormat('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'America/Bogota'
            });
            const { sendCancellationEmail } = await Promise.resolve().then(() => require('../common/utils/email.util'));
            await sendCancellationEmail(updatedReserva.cliente.Correo, {
                id: `PED-${updatedReserva.ID_Reserva}`,
                fecha: dateFormatter.format(new Date(updatedReserva.fecha)),
                motivo: motivo
            }).catch(err => console.error('Error al enviar correo de cancelación:', err));
        }
        try {
            await this.notificationsService.sendToTopic('topic_admin', 'Reserva Cancelada', `La reserva #${updatedReserva.ID_Reserva} ha sido cancelada.`, { type: 'reserva_cancelada', reservaId: updatedReserva.ID_Reserva.toString() });
        }
        catch (e) { }
        if (updatedReserva.empleado) {
            try {
                await this.notificationsService.sendToTopic(`user_${updatedReserva.empleado.Id_Usuario}`, 'Reserva Cancelada', `Se ha cancelado la reserva #${updatedReserva.ID_Reserva} que tenías asignada.`, { type: 'reserva_cancelada', reservaId: updatedReserva.ID_Reserva.toString() });
            }
            catch (e) { }
        }
        return updatedReserva;
    }
    async remove(id) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return this.prisma.reserva.delete({ where: { ID_Reserva: id } });
    }
    async findByCliente(clienteId) {
        return this.prisma.reserva.findMany({
            where: { Id_Usuario: clienteId },
            include: { servicios: true, observacion: true },
            orderBy: { fecha: 'desc' },
        });
    }
};
exports.ReservasService = ReservasService;
exports.ReservasService = ReservasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReservasService);
//# sourceMappingURL=reservas.service.js.map