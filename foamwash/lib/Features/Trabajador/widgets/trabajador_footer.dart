import 'package:flutter/material.dart';

class TrabajadorFooter extends StatefulWidget {
  final VoidCallback? onGoAgenda;
  final VoidCallback? onGoPerfil;
  final Map<String, int> kpiSnapshot;

  const TrabajadorFooter({
    super.key,
    this.onGoAgenda,
    this.onGoPerfil,
    this.kpiSnapshot = const {
      'serviciosHoy': 0,
      'serviciosSemana': 0,
      'completados': 0,
      'pendientes': 0,
    },
  });

  @override
  State<TrabajadorFooter> createState() => _TrabajadorFooterState();
}

class _TrabajadorFooterState extends State<TrabajadorFooter> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentYear = DateTime.now().year;
    final width = MediaQuery.of(context).size.width;
    final isWide = width >= 800;

    // KPI Values
    final serviciosHoy = widget.kpiSnapshot['serviciosHoy'] ?? 0;
    final serviciosSemana = widget.kpiSnapshot['serviciosSemana'] ?? 0;
    final completados = widget.kpiSnapshot['completados'] ?? 0;
    final pendientes = widget.kpiSnapshot['pendientes'] ?? 0;

    return Container(
      width: double.infinity,
      color: const Color(0xFF0F172A),
      child: Column(
        children: [
          // ── SECCIÓN SUPERIOR: ESTADO DEL SISTEMA ──
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              border: Border(
                bottom: BorderSide(color: Color(0x1A94A3B8), width: 1),
              ),
            ),
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: isWide
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildSystemStateItem(),
                          _buildLastSyncItem(),
                          _buildActiveSessionItem(),
                        ],
                      )
                    : Column(
                        children: [
                          _buildSystemStateItem(),
                          const SizedBox(height: 16),
                          _buildLastSyncItem(),
                          const SizedBox(height: 16),
                          _buildActiveSessionItem(),
                        ],
                      ),
              ),
            ),
          ),

          // ── SECCIÓN PRINCIPAL DEL FOOTER ──
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 40 : 20,
              vertical: 40,
            ),
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: isWide
                    ? Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Columna 1: Logo & Info
                          Expanded(flex: 3, child: _buildLogoCol(currentYear)),
                          const SizedBox(width: 40),
                          // Columna 2: Navegación
                          Expanded(flex: 2, child: _buildNavCol()),
                          const SizedBox(width: 40),
                          // Columna 3: Métricas
                          Expanded(
                            flex: 3,
                            child: _buildMetricsCol(
                              serviciosHoy: serviciosHoy,
                              serviciosSemana: serviciosSemana,
                              completados: completados,
                              pendientes: pendientes,
                            ),
                          ),
                          const SizedBox(width: 40),
                          // Columna 4: Horario & Contacto
                          Expanded(flex: 3, child: _buildInfoCol()),
                        ],
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLogoCol(currentYear),
                          const SizedBox(height: 32),
                          _buildNavCol(),
                          const SizedBox(height: 32),
                          _buildMetricsCol(
                            serviciosHoy: serviciosHoy,
                            serviciosSemana: serviciosSemana,
                            completados: completados,
                            pendientes: pendientes,
                          ),
                          const SizedBox(height: 32),
                          _buildInfoCol(),
                        ],
                      ),
              ),
            ),
          ),

          // ── LÍNEA SEPARADORA DE COPYRIGHT ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Container(
              height: 1,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.transparent, Color(0xFF334155), Colors.transparent],
                ),
              ),
            ),
          ),

          // ── COPYRIGHT ──
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 40 : 20,
              vertical: 24,
            ),
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: isWide
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildCopyrightText(currentYear),
                          _buildMadeInColombia(),
                        ],
                      )
                    : Column(
                        children: [
                          _buildCopyrightText(currentYear),
                          const SizedBox(height: 12),
                          _buildMadeInColombia(),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── ELEMENTOS DE ESTADO DEL SISTEMA ──
  Widget _buildSystemStateItem() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withOpacity(0.3 * _pulseController.value),
                    blurRadius: 8,
                    spreadRadius: 2 * _pulseController.value,
                  )
                ],
              ),
              child: const Center(
                child: Icon(Icons.check, color: Colors.white, size: 18),
              ),
            );
          },
        ),
        const SizedBox(width: 12),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sistema Operativo',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFF10B981),
              ),
            ),
            SizedBox(height: 2),
            Text(
              'Todos los servicios activos',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildLastSyncItem() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
            ),
          ),
          child: const Center(
            child: Icon(Icons.sync_rounded, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Última sincronización',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF1F5F9),
              ),
            ),
            SizedBox(height: 2),
            Text(
              'Hace menos de 1 minuto',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildActiveSessionItem() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
            ),
          ),
          child: const Center(
            child: Icon(Icons.person_outline_rounded, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sesión Activa',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF1F5F9),
              ),
            ),
            SizedBox(height: 2),
            Text(
              'Conectado como Empleado',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        )
      ],
    );
  }

  // ── COLUMNAS DEL CUERPO DEL FOOTER ──
  Widget _buildLogoCol(int currentYear) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                image: const DecorationImage(
                  image: AssetImage('assets/LogoFW.jpeg'),
                  fit: BoxFit.cover,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3B82F6).withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'FoamWash',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF60A5FA),
                  ),
                ),
                Text(
                  'PANEL EMPLEADO',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF60A5FA),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            )
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          'Gestiona tus servicios diarios, revisa tu agenda y mantén el control de todas tus asignaciones desde un solo lugar.',
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 13.5,
            color: Color(0xFF94A3B8),
            height: 1.6,
          ),
        ),
        const SizedBox(height: 20),
        // Info de versión
        _buildInfoTag('Versión del sistema', 'v2.4.1', const Color(0xFF60A5FA)),
        const SizedBox(height: 8),
        _buildInfoTag('Entorno', 'Production', const Color(0xFF10B981)),
      ],
    );
  }

  Widget _buildInfoTag(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11.5,
              color: Color(0xFF94A3B8),
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11.5,
              color: valueColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavCol() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Navegación', const Color(0xFF3B82F6)),
        const SizedBox(height: 16),
        _buildNavLink('Agenda', Icons.calendar_today_rounded, widget.onGoAgenda),
        const SizedBox(height: 4),
        _buildNavLink('Perfil', Icons.person_outline_rounded, widget.onGoPerfil),
      ],
    );
  }

  Widget _buildNavLink(String label, IconData icon, VoidCallback? onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 14, color: const Color(0xFF4A6FA5)),
            const SizedBox(width: 10),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 13.5,
                fontWeight: FontWeight.w500,
                color: Color(0xFF94A3B8),
              ),
            ),
            const Spacer(),
            const Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF4A6FA5)),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricsCol({
    required int serviciosHoy,
    required int serviciosSemana,
    required int completados,
    required int pendientes,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Métricas', const Color(0xFF10B981)),
        const SizedBox(height: 16),
        _buildMetricRow('Servicios hoy', serviciosHoy.toString(), '📋', const Color(0xFF3B82F6)),
        const SizedBox(height: 10),
        _buildMetricRow('Esta semana', serviciosSemana.toString(), '📅', const Color(0xFF8B5CF6)),
        const SizedBox(height: 10),
        _buildMetricRow('Completados', completados.toString(), '✅', const Color(0xFF10B981)),
        const SizedBox(height: 10),
        _buildMetricRow('Pendientes', pendientes.toString(), '⏳', const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildMetricRow(String label, String value, String emoji, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 12.5,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 16,
              color: color,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCol() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Información', const Color(0xFF60A5FA)),
        const SizedBox(height: 16),
        // Horario Operativo
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155), width: 1),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('🕐', style: TextStyle(fontSize: 16)),
                  SizedBox(width: 8),
                  Text(
                    'Horario Operativo',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFF1F5F9),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10),
              Text(
                'Lun - Sáb: 8:00 AM - 6:00 PM',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Soporte Admin: 24 / 7',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11.5,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Contacto de Emergencia
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155), width: 1),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('📞', style: TextStyle(fontSize: 16)),
                  SizedBox(width: 8),
                  Text(
                    'Contacto de Emergencia',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFF1F5F9),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10),
              Text(
                'Admin: 314 436 8571',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Email: admin@foamwash.com',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildColTitle(String title, Color barColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFFF1F5F9),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: 40,
          height: 3,
          decoration: BoxDecoration(
            color: barColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ],
    );
  }

  // ── COPYRIGHT Y TEXTOS DE PIE ──
  Widget _buildCopyrightText(int currentYear) {
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: const TextStyle(
          fontFamily: 'Kanit',
          fontSize: 13,
          color: Color(0xFF94A3B8),
        ),
        children: [
          TextSpan(text: '© $currentYear '),
          const TextSpan(
            text: 'FoamWash',
            style: TextStyle(
              color: Color(0xFF60A5FA),
              fontWeight: FontWeight.w700,
            ),
          ),
          const TextSpan(text: ' · Panel de Empleados · Todos los derechos reservados.'),
        ],
      ),
    );
  }

  Widget _buildMadeInColombia() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          'Hecho con ❤️ en Colombia',
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 12,
            color: Color(0xFF94A3B8),
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFF334155), width: 1),
          ),
          child: const Text(
            'FW-ADMIN v2.4.1',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 10.5,
              color: Color(0xFF60A5FA),
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}
