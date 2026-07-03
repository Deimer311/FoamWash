import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Services/widgets/service_card.dart';
import 'package:foamwash/Features/Services/widgets/footer_widget.dart';

/// Vista pública del catálogo de servicios para invitados sin sesión.
/// Se adapta a orientación vertical (Portrait) y horizontal (Landscape),
/// adoptando el diseño de la web de escritorio en modo horizontal.
class GuestView extends StatefulWidget {
  const GuestView({Key? key}) : super(key: key);

  @override
  State<GuestView> createState() => _GuestViewState();
}

class _GuestViewState extends State<GuestView> {
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

  // ─── Drawer Premium Estilo Web ────────────────────────────────────────────
  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF080C1E),
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'FoamWash',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
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
              icon: Icons.login_rounded,
              label: 'Iniciar Sesión',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/login');
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
          color: isActive ? const Color(0xFF0099FF) : Colors.white60,
          size: 20,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? Colors.white : Colors.white70,
            fontSize: 14,
          ),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        onTap: onTap,
      ),
    );
  }

  // ─── AppBar Premium Sincronizado con ServicesHeader.jsx ───────────────────
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

          // Sección Derecha: Botón Iniciar Sesión (Landscape) o Avatar Person (Portrait)
          if (isLandscape)
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A56FF), Color(0xFF7C3AED)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1A56FF).withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/login'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: const Icon(Icons.login_rounded, size: 14),
                label: const Text(
                  'Iniciar Sesión',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            )
          else
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/login'),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                    width: 1.5,
                  ),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  color: Colors.white70,
                  size: 20,
                ),
              ),
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
              // Distribución en Grid de Columnas estilo Web para Landscape
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
                      isGuest: true,
                    ),
                    childCount: filteredServices.length,
                  ),
                ),
              )
            else
              // Distribución vertical en Portrait
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ServiceCard(
                      service: filteredServices[index],
                      isGuest: true,
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