import 'package:flutter/material.dart';

class AdminFooter extends StatefulWidget {
  final int ordeneHoy;
  final int ordensPendientes;
  final int empleadosActivos;
  final String ingresosMes;

  const AdminFooter({
    super.key,
    this.ordeneHoy = 6,
    this.ordensPendientes = 18,
    this.empleadosActivos = 3,
    this.ingresosMes = '\$4.200.000',
  });

  @override
  State<AdminFooter> createState() => _AdminFooterState();
}

class _AdminFooterState extends State<AdminFooter> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 3.0, end: 10.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;

    const Color darkSlate = Color(0xFF0F172A);
    const Color statusBg = Color(0xFF1E293B);
    const Color borderSlate = Color(0xFF334155);
    const Color textMuted = Color(0xFF94A3B8);
    const Color textLight = Color(0xFFF1F5F9);
    const Color textSoftBlue = Color(0xFF60A5FA);

    return Container(
      width: double.infinity,
      color: darkSlate,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ─── Top Bar: System Status ───
          Container(
            color: statusBg,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: isDesktop
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Expanded(child: _buildStatusItem(
                        icon: Icons.check_circle_outline_rounded,
                        gradientColors: [const Color(0xFF10B981), const Color(0xFF059669)],
                        title: 'Estado del Sistema',
                        subtitle: 'Operational — todos los módulos activos',
                        pulse: true,
                      )),
                      Expanded(child: _buildStatusItem(
                        icon: Icons.access_time_rounded,
                        gradientColors: [const Color(0xFF3B82F6), const Color(0xFF2563EB)],
                        title: 'Última sincronización',
                        subtitle: 'Hace menos de 1 minuto',
                        pulse: false,
                      )),
                      Expanded(child: _buildStatusItem(
                        icon: Icons.lock_outline_rounded,
                        gradientColors: [const Color(0xFF8B5CF6), const Color(0xFF6D28D9)],
                        title: 'Sesión Segura',
                        subtitle: 'Conectado como Administrador',
                        pulse: false,
                      )),
                    ],
                  )
                : Column(
                    children: [
                      _buildStatusItem(
                        icon: Icons.check_circle_outline_rounded,
                        gradientColors: [const Color(0xFF10B981), const Color(0xFF059669)],
                        title: 'Estado del Sistema',
                        subtitle: 'Operational — todos los módulos activos',
                        pulse: true,
                      ),
                      const SizedBox(height: 12),
                      _buildStatusItem(
                        icon: Icons.access_time_rounded,
                        gradientColors: [const Color(0xFF3B82F6), const Color(0xFF2563EB)],
                        title: 'Última sincronización',
                        subtitle: 'Hace menos de 1 minuto',
                        pulse: false,
                      ),
                      const SizedBox(height: 12),
                      _buildStatusItem(
                        icon: Icons.lock_outline_rounded,
                        gradientColors: [const Color(0xFF8B5CF6), const Color(0xFF6D28D9)],
                        title: 'Sesión Segura',
                        subtitle: 'Conectado como Administrador',
                        pulse: false,
                      ),
                    ],
                  ),
          ),

          // ─── Main Grid Layout (4 columns or stacked) ───
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
            child: isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: _buildBrandCol()),
                      const SizedBox(width: 32),
                      Expanded(flex: 2, child: _buildNavCol(context)),
                      const SizedBox(width: 32),
                      Expanded(flex: 2, child: _buildMetricsCol()),
                      const SizedBox(width: 32),
                      Expanded(flex: 2, child: _buildActionsCol(context)),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildBrandCol(),
                      const SizedBox(height: 32),
                      _buildNavCol(context),
                      const SizedBox(height: 32),
                      _buildMetricsCol(),
                      const SizedBox(height: 32),
                      _buildActionsCol(context),
                    ],
                  ),
          ),

          // Divider
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              height: 1,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.transparent, borderSlate, Colors.transparent],
                ),
              ),
            ),
          ),

          // ─── Copyright Bottom Bar ───
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: isDesktop
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildCopyrightText(),
                      _buildColombiaText(),
                    ],
                  )
                : Column(
                    children: [
                      _buildCopyrightText(),
                      const SizedBox(height: 10),
                      _buildColombiaText(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusItem({
    required IconData icon,
    required List<Color> gradientColors,
    required String title,
    required String subtitle,
    required bool pulse,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: gradientColors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF1F5F9),
                ),
              ),
              Row(
                children: [
                  if (pulse) ...[
                    AnimatedBuilder(
                      animation: _pulseAnimation,
                      builder: (context, child) {
                        return Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: const Color(0xFF34D399),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF34D399).withOpacity(0.6),
                                blurRadius: _pulseAnimation.value,
                                spreadRadius: _pulseAnimation.value / 3,
                              )
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: 6),
                  ],
                  Expanded(
                    child: Text(
                      subtitle,
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 12,
                        color: pulse ? const Color(0xFF34D399) : const Color(0xFF94A3B8),
                        fontWeight: pulse ? FontWeight.w600 : FontWeight.normal,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBrandCol() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.asset(
                  'assets/LogoFW.jpeg',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Text(
                      'FW',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'FoamWash',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.25)),
                  ),
                  child: const Text(
                    'Admin Panel',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF60A5FA),
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          'Centro de control operativo. Gestiona órdenes, personal y reportes desde un solo lugar con visibilidad en tiempo real.',
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 12.5,
            color: Color(0xFF94A3B8),
            height: 1.6,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: const Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Versión del sistema',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  Text(
                    'v2.4.1',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF60A5FA),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Entorno',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  Text(
                    'Production',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF34D399),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNavCol(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Navegación'),
        _buildNavLinkItem('Panel', Icons.grid_view_rounded, '/admin_dashboard', context),
        _buildNavLinkItem('Agenda', Icons.calendar_today_rounded, '/admin_agenda', context),
        _buildNavLinkItem('Empleados', Icons.badge_outlined, '/admin_empleados', context),
        _buildNavLinkItem('Reportes', Icons.bar_chart_rounded, '/admin_reportes', context),
        _buildNavLinkItem('Perfil', Icons.person_outline_rounded, '/perfilAdmin', context),
      ],
    );
  }

  Widget _buildNavLinkItem(String text, IconData icon, String route, BuildContext context) {
    final bool isCurrent = ModalRoute.of(context)?.settings.name == route;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: InkWell(
        onTap: () {
          if (!isCurrent) {
            Navigator.pushReplacementNamed(context, route);
          }
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: isCurrent ? const Color(0xFF3B82F6).withOpacity(0.08) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isCurrent ? const Color(0xFF60A5FA) : const Color(0xFF4A6FA5),
                size: 16,
              ),
              const SizedBox(width: 10),
              Text(
                text,
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13.5,
                  fontWeight: FontWeight.w500,
                  color: isCurrent ? const Color(0xFF60A5FA) : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricsCol() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Métricas en Vivo'),
        _buildMetricRow('📋', 'Órdenes hoy', '${widget.ordeneHoy}', const Color(0xFF3B82F6)),
        _buildMetricRow('⏳', 'Órdenes pendientes', '${widget.ordensPendientes}', const Color(0xFFF59E0B)),
        _buildMetricRow('👥', 'Empleados activos', '${widget.empleadosActivos}', const Color(0xFF10B981)),
        _buildMetricRow('💰', 'Ingresos del mes', widget.ingresosMes, const Color(0xFF8B5CF6)),
      ],
    );
  }

  Widget _buildMetricRow(String emoji, String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 14)),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 12.5,
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionsCol(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildColTitle('Acciones Rápidas'),
        _buildQuickActionBtn(
          context: context,
          label: 'Ver Reportes completos',
          icon: Icons.bar_chart_rounded,
          route: '/admin_reportes',
          highlight: true,
        ),
        _buildQuickActionBtn(
          context: context,
          label: 'Nueva orden',
          icon: Icons.add_circle_outline_rounded,
          route: '/admin_agenda',
          highlight: false,
        ),
        _buildQuickActionBtn(
          context: context,
          label: 'Gestionar empleados',
          icon: Icons.people_outline_rounded,
          route: '/admin_empleados',
          highlight: false,
        ),
        const SizedBox(height: 12),
        // Horario Operativo Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('🕐', style: TextStyle(fontSize: 14)),
                  SizedBox(width: 6),
                  Text(
                    'Horario Operativo',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFF1F5F9),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 4),
              Text(
                'Lun – Sáb: 8:00 AM – 6:00 PM',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 12,
                  color: Color(0xFF94A3B8),
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Soporte Admin: 24 / 7',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionBtn({
    required BuildContext context,
    required String label,
    required IconData icon,
    required String route,
    required bool highlight,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
            side: BorderSide(
              color: highlight ? const Color(0xFF3B82F6).withOpacity(0.35) : const Color(0xFF334155),
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            backgroundColor: highlight
                ? const Color(0xFF3B82F6).withOpacity(0.1)
                : const Color(0xFF1E293B),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          onPressed: () {
            Navigator.pushReplacementNamed(context, route);
          },
          child: Row(
            children: [
              Icon(
                icon,
                color: highlight ? const Color(0xFF60A5FA) : const Color(0xFF4A6FA5),
                size: 16,
              ),
              const SizedBox(width: 10),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: highlight ? const Color(0xFF60A5FA) : const Color(0xFF94A3B8),
                ),
              ),
              if (highlight) ...[
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'Nuevo',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 8.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF3B82F6),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColTitle(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Color(0xFFF1F5F9),
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: 36,
          height: 3,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
            ),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildCopyrightText() {
    final int currentYear = DateTime.now().year;
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: const TextStyle(
          fontFamily: 'Kanit',
          fontSize: 12.5,
          color: Color(0xFF64748B),
        ),
        children: [
          TextSpan(text: '© $currentYear '),
          const TextSpan(
            text: 'FoamWash',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF60A5FA),
            ),
          ),
          const TextSpan(text: ' · Panel de Administración · Todos los derechos reservados.'),
        ],
      ),
    );
  }

  Widget _buildColombiaText() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          'Hecho con ❤️ en Colombia',
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 12,
            color: Color(0xFF64748B),
          ),
        ),
        const SizedBox(width: 14),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFF334155)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Text(
            'FW-ADMIN v2.4.1',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Color(0xFF4A6FA5),
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }
}
