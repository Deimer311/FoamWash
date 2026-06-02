import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Services/widgets/service_card.dart';
import 'package:foamwash/Features/Services/widgets/footer_widget.dart';

// Vista publica del catalogo de servicios para invitados sin sesion.
// Ejecuta peticiones HTTP GET y restringe operaciones de escritura POST en la base de datos.
class GuestView extends StatefulWidget {
  const GuestView({Key? key}) : super(key: key);

  @override
  State<GuestView> createState() => _GuestViewState();
}

class _GuestViewState extends State<GuestView> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServicesProvider>().fetchServices();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.backgroundWhite,
      drawer: _buildDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: _buildServicesList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const DrawerHeader(
            decoration: BoxDecoration(
              color: AppTheme.appBarDark,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  'FoamWash',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Modo Invitado',
                  style: TextStyle(color: Colors.white70),
                )
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.request_quote, color: AppTheme.primaryBlue),
            title: const Text('Cotizar', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.home, color: AppTheme.primaryBlue),
            title: const Text('Home', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/home');
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.login, color: AppTheme.primaryBlue),
            title: const Text('Iniciar Sesión', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/login');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return Container(
      color: AppTheme.appBarDark,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: [
          // ── Logo FW (badge cuadrado redondeado, igual al web) ──
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: AppTheme.buttonGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(
              child: Text(
                'FW',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // ── Título FoamWash^CL ──
          RichText(
            text: const TextSpan(
              children: [
                TextSpan(
                  text: 'FoamWash',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.2,
                  ),
                ),
                TextSpan(
                  text: 'CL',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF93C5FD), // azul claro como en el web
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),

          const Spacer(),

          // ── Icono menu hamburguesa ──
          GestureDetector(
            onTap: () => _scaffoldKey.currentState?.openDrawer(),
            child: Container(
              padding: const EdgeInsets.all(6),
              child: const Icon(Icons.menu_rounded,
                  color: Colors.white70, size: 24),
            ),
          ),
          const SizedBox(width: 10),

          // ── Avatar circular (igual al web) ──
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.10),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.25),
                width: 1.5,
              ),
            ),
            child: const Icon(
              Icons.person_rounded,
              color: Colors.white70,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
      child: TextField(
        style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: AppTheme.darkText),
        decoration: InputDecoration(
          hintText: 'Buscar servicios: muebles, colchones, tapicería, carros...',
          hintStyle: const TextStyle(
              fontFamily: 'Kanit',
              color: AppTheme.greyText,
              fontSize: 13,
              fontWeight: FontWeight.w400),
          // Icono de búsqueda al final (igual que el web)
          suffixIcon: const Padding(
            padding: EdgeInsets.only(right: 14),
            child: Icon(Icons.search_rounded,
                color: AppTheme.greyText, size: 20),
          ),
          suffixIconConstraints:
              const BoxConstraints(minWidth: 44, minHeight: 44),
          filled: true,
          fillColor: const Color(0xFFF8FAFF),
          contentPadding:
              const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(40),
            borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(40),
            borderSide:
                const BorderSide(color: AppTheme.primaryBlue, width: 1.8),
          ),
        ),
      ),
    );
  }


  Widget _buildServicesList() {
    return Consumer<ServicesProvider>(
      builder: (context, provider, child) {
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
                    // Subtítulo con bullets, igual al web
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 0,
                      children: const [
                        Text('Profesionales certificados',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF94A3B8),
                            )),
                        Text(' · ',
                            style: TextStyle(
                                fontSize: 12, color: AppTheme.greyText)),
                        Text('Productos ecológicos',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF94A3B8),
                            )),
                        Text(' · ',
                            style: TextStyle(
                                fontSize: 12, color: AppTheme.greyText)),
                        Text('Garantía de satisfacción',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF94A3B8),
                            )),
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
                        onPressed: () {
                          provider.fetchServices();
                        },
                        child: const Text('Reintentar'),
                      )
                    ],
                  ),
                ),
              )
            else if (provider.services.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Text(
                    'No hay servicios disponibles en este momento.',
                    style: TextStyle(color: AppTheme.greyText),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ServiceCard(
                      service: provider.services[index],
                      isGuest: true,
                    ),
                    childCount: provider.services.length,
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
