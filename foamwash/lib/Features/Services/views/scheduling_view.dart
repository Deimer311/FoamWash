import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/controllers/scheduling_controller.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';
import 'package:foamwash/Features/Services/widgets/service_card.dart';
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Services/widgets/footer_widget.dart';

/// Vista principal de agendamiento para usuarios autenticados.
/// Adapta el diseño a modo responsive: Grid de servicios y links de navegación en cabecera
/// cuando está en modo horizontal (Landscape), alineándose con la versión web.
class SchedulingView extends StatefulWidget {
  const SchedulingView({Key? key}) : super(key: key);

  @override
  State<SchedulingView> createState() => _SchedulingViewState();
}

class _SchedulingViewState extends State<SchedulingView> {
  final SchedulingController _controller = SchedulingController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServicesProvider>().fetchServices();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showConfirmLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          '¿Cerrar sesión?',
          style: TextStyle(color: Colors.white, fontFamily: 'Kanit', fontWeight: FontWeight.bold),
        ),
        content: const Text(
          '¿Está seguro de que desea cerrar su sesión actual?',
          style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'Kanit'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54, fontFamily: 'Kanit')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(context); // Cerrar diálogo
              await context.read<AuthProvider>().logout();
              if (mounted) {
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              }
            },
            child: const Text('Cerrar Sesión', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.backgroundWhite,
      drawer: _buildDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(isLandscape),
            Expanded(
              child: _buildServicesList(isLandscape),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Drawer Estilo Web Premium ────────────────────────────────────────────
  Widget _buildDrawer() {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final isLogged = auth.isAuthenticated;
    final userName = user?.nombre ?? 'Modo Invitado';
    final userFoto = user?.fotoPerfil;

    return Drawer(
      backgroundColor: const Color(0xFF080C1E),
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(top: 40, bottom: 20, left: 20, right: 20),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (isLogged)
                        CircleAvatar(
                          backgroundColor: Colors.white24,
                          radius: 26,
                          backgroundImage: userFoto != null && userFoto.isNotEmpty
                              ? NetworkImage(userFoto.startsWith('http')
                                  ? userFoto
                                  : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                              : null,
                          child: (userFoto == null || userFoto.isEmpty)
                              ? const Icon(Icons.person, color: Colors.white70, size: 28)
                              : null,
                        )
                      else
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            gradient: const LinearGradient(colors: [Color(0xFF0066FF), Color(0xFF00B8FF)]),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                          ),
                        ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              userName,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (isLogged && user?.correo != null)
                              Text(
                                user!.correo,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontFamily: 'Kanit',
                                  color: Colors.white54,
                                  fontSize: 12,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildDrawerItem(
              icon: Icons.home_outlined,
              label: 'Inicio',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushReplacementNamed(context, '/home');
              },
            ),
            _buildDrawerItem(
              icon: Icons.description_outlined,
              label: 'Cotizar',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/cotizador');
              },
            ),
            _buildDrawerItem(
              icon: Icons.cleaning_services_outlined,
              label: 'Agendar',
              isActive: true,
              onTap: () => Navigator.pop(context),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Divider(color: Color(0x12FFFFFF)),
            ),
            _buildDrawerItem(
              icon: Icons.person_outline_rounded,
              label: 'Mi Perfil',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/perfilCliente');
              },
            ),
            _buildDrawerItem(
              icon: Icons.event_note_outlined,
              label: 'Mis Agendamientos',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/agendamientos');
              },
            ),
            _buildDrawerItem(
              icon: Icons.request_quote_outlined,
              label: 'Mis Cotizaciones',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/mis_cotizaciones');
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Divider(color: Color(0x12FFFFFF)),
            ),
            _buildDrawerItem(
              icon: Icons.logout_rounded,
              label: 'Cerrar Sesión',
              isActive: false,
              textColor: const Color(0xFFFF6B6B),
              iconColor: const Color(0xFFFF6B6B),
              onTap: () {
                Navigator.pop(context);
                _showConfirmLogoutDialog(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
    Color? textColor,
    Color? iconColor,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? const Color(0x2E0066FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: iconColor ?? (isActive ? const Color(0xFF0099FF) : Colors.white60),
          size: 20,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: textColor ?? (isActive ? Colors.white : Colors.white70),
            fontSize: 14,
          ),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        onTap: onTap,
      ),
    );
  }

  // ─── AppBar Premium Sincronizado con HeaderCliente.jsx ───────────────────
  Widget _buildAppBar(bool isLandscape) {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: Color(0xFF080C1E),
        border: Border(
          bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1),
        ),
      ),
      padding: EdgeInsets.symmetric(horizontal: isLandscape ? 40 : 16),
      child: Row(
        children: [
          // Botón hamburguesa (solo en Portrait)
          if (!isLandscape) ...[
            IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 12),
          ],

          // Logo e Identidad (FoamWashCL)
          GestureDetector(
            onTap: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(width: 8),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: 'FoamWash',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                      TextSpan(
                        text: 'CL',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0099FF),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Navegación central (solo en Landscape)
          if (isLandscape) ...[
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildNavButton(
                  icon: Icons.home_outlined,
                  label: 'Hogar',
                  isActive: false,
                  onTap: () => Navigator.pushReplacementNamed(context, '/home'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.description_outlined,
                  label: 'Cotización',
                  isActive: false,
                  onTap: () => Navigator.pushNamed(context, '/cotizador'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.cleaning_services_outlined,
                  label: 'Agendar',
                  isActive: true,
                  onTap: () {},
                ),
              ],
            ),
          ],

          const Spacer(),

          // Sección Derecha: Carrito y Avatar con Menú Desplegable
          Row(
            children: [
              Consumer<CartProvider>(
                builder: (context, cart, child) {
                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pushNamed(context, '/cart'),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      if (cart.itemCount > 0)
                        Positioned(
                          right: -6,
                          top: -6,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Color(0xFF1E3A8A),
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              cart.itemCount.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
              const SizedBox(width: 16),

              // Avatar con PopupMenuButton Dropdown
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  final user = auth.user;
                  final fotoUrl = fwFotoUrl(
                    user?.fotoPerfil,
                    ApiConstants.baseUrl.replaceAll('/api', ''),
                  );

                  return PopupMenuButton<String>(
                    offset: const Offset(0, 48),
                    color: const Color(0xFA0A0E26), // rgba(10,14,38,0.97)
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: Color(0x17FFFFFF), width: 1),
                    ),
                    elevation: 8,
                    onSelected: (value) {
                      if (value == 'perfil') {
                        Navigator.pushNamed(context, '/perfilCliente');
                      } else if (value == 'agendamientos') {
                        Navigator.pushNamed(context, '/agendamientos');
                      } else if (value == 'cotizaciones') {
                        Navigator.pushNamed(context, '/mis_cotizaciones');
                      } else if (value == 'logout') {
                        _showConfirmLogoutDialog(context);
                      }
                    },
                    itemBuilder: (BuildContext context) => [
                      PopupMenuItem<String>(
                        enabled: false,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.nombre ?? 'Cliente',
                                style: const TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              if (user?.correo != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  user!.correo,
                                  style: const TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 11,
                                    color: Colors.white54,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              const Divider(color: Color(0x12FFFFFF), height: 1),
                            ],
                          ),
                        ),
                      ),
                      _buildPopupItem(
                        value: 'perfil',
                        icon: Icons.person_outline_rounded,
                        label: 'Mi Perfil',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'agendamientos',
                        icon: Icons.event_note_outlined,
                        label: 'Mis Agendamientos',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'cotizaciones',
                        icon: Icons.description_outlined,
                        label: 'Mis Cotizaciones',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'logout',
                        icon: Icons.logout_rounded,
                        label: 'Cerrar sesión',
                        iconColor: const Color(0xFFFF6B6B),
                        isLogout: true,
                      ),
                    ],
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.2),
                          width: 1.5,
                        ),
                      ),
                      child: FWAvatar(
                        fotoUrl: fotoUrl,
                        size: 32,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(7),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0x2E0066FF) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white70, size: 14),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            if (isActive) ...[
              const SizedBox(height: 2),
              Container(
                width: 18,
                height: 2,
                decoration: BoxDecoration(
                  color: const Color(0xFF0099FF),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  PopupMenuItem<String> _buildPopupItem({
    required String value,
    required IconData icon,
    required String label,
    required Color iconColor,
    bool isLogout = false,
  }) {
    return PopupMenuItem<String>(
      value: value,
      height: 42,
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: iconColor, size: 14),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isLogout ? const Color(0xFFFF6B6B) : Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Buscador Estilo Web ──────────────────────────────────────────────────
  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 700),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.black.withOpacity(0.06), width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 2, 6, 2),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.toLowerCase();
                    });
                  },
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 14,
                    color: Color(0xFF333333),
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Buscar servicios: muebles, alfombras, colchones...',
                    hintStyle: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 13,
                      color: Color(0xFF94A3B8),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                  ),
                ),
              ),
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF1A56FF)],
                  ),
                ),
                child: const Icon(Icons.search_rounded, color: Colors.white, size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Listado / Grid de Servicios ──────────────────────────────────────────
  Widget _buildServicesList(bool isLandscape) {
    return Consumer<ServicesProvider>(
      builder: (context, provider, child) {
        // Filtrado local de servicios según la búsqueda
        final filteredServices = provider.services.where((s) {
          final query = _searchQuery.trim();
          if (query.isEmpty) return true;
          return s.nombreServicio.toLowerCase().contains(query) ||
              s.descripcion.toLowerCase().contains(query);
        }).toList();

        return CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: _buildSearchBar(),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: AppTheme.backgroundWhite,
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 20),
                child: Column(
                  children: [
                    const Text(
                      'Nuestros Servicios',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.darkText,
                        letterSpacing: -0.5,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 0,
                      children: const [
                        Text(
                          'Profesionales certificados',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                        Text(' · ', style: TextStyle(fontSize: 12, color: AppTheme.greyText)),
                        Text(
                          'Productos ecológicos',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                        Text(' · ', style: TextStyle(fontSize: 12, color: AppTheme.greyText)),
                        Text(
                          'Garantía de satisfacción',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (provider.isLoading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: CircularProgressIndicator(color: AppTheme.primaryBlue),
                ),
              )
            else if (provider.error != null)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                      const SizedBox(height: 16),
                      Text(
                        'Error al cargar los servicios\n${provider.error}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppTheme.greyText),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => provider.fetchServices(),
                        child: const Text('Reintentar'),
                      )
                    ],
                  ),
                ),
              )
            else if (filteredServices.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text(
                      'No se encontraron servicios que coincidan con tu búsqueda.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppTheme.greyText, fontFamily: 'Kanit'),
                    ),
                  ),
                ),
              )
            else if (isLandscape)
              // Grid de dos columnas para Landscape
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: ((MediaQuery.of(context).size.width - 60) / 2) / 495,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ServiceCard(
                      service: filteredServices[index],
                      isGuest: false,
                      controller: _controller,
                    ),
                    childCount: filteredServices.length,
                  ),
                ),
              )
            else
              // Lista vertical en Portrait
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ServiceCard(
                      service: filteredServices[index],
                      isGuest: false,
                      controller: _controller,
                    ),
                    childCount: filteredServices.length,
                  ),
                ),
              ),
            const SliverToBoxAdapter(
              child: AppFooter(),
            ),
          ],
        );
      },
    );
  }
}