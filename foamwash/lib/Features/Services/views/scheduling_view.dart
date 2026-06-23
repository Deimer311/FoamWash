import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/controllers/scheduling_controller.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';
import 'package:foamwash/Features/Services/widgets/service_card.dart';

// Vista principal de agendamiento para usuarios autenticados.
// Construye el catalogo de servicios dinamicamente consumiendo el API a traves de FutureBuilder.
// Implementa el ciclo de vida completo de visualizacion, solicitud (SchedulingController) y deslogueo (ApiService).
class SchedulingView extends StatefulWidget {
  const SchedulingView({Key? key}) : super(key: key);

  @override
  State<SchedulingView> createState() => _SchedulingViewState();
}

class _SchedulingViewState extends State<SchedulingView> {
  final SchedulingController _controller = SchedulingController();
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
            _buildSearchBar(),
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
                  'Menú principal',
                  style: TextStyle(color: Colors.white70),
                )
              ],
            ),
          ),
          // ── Mismo orden y nombres que el header web (Inicio, Cotizar, Agendar) ──
          ListTile(
            leading: const Icon(Icons.home_outlined, color: AppTheme.primaryBlue),
            title: const Text('Inicio', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/home');
            },
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined, color: AppTheme.primaryBlue),
            title: const Text('Cotizar', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/cotizador');
            },
          ),
          ListTile(
            selected: true,
            selectedTileColor: AppTheme.primaryBlue.withOpacity(0.08),
            leading: const Icon(Icons.build_outlined, color: AppTheme.primaryBlue),
            title: const Text('Agendar', style: TextStyle(fontWeight: FontWeight.w700)),
            // Ya estamos en la vista de Agendar: solo cierra el drawer.
            onTap: () => Navigator.pop(context),
          ),
          const Divider(),
          // ── Mismos accesos que el dropdown de avatar en el header web ──
          ListTile(
            leading: const Icon(Icons.person_outline, color: AppTheme.primaryBlue),
            title: const Text('Perfil', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/perfilCliente');
            },
          ),
          ListTile(
            leading: const Icon(Icons.event_note_outlined, color: AppTheme.primaryBlue),
            title: const Text('Mis Agendamientos', style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/agendamientos');
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout_rounded, color: Color(0xFFFF6B6B)),
            title: const Text(
              'Cerrar Sesión',
              style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFFFF6B6B)),
            ),
            onTap: () async {
              Navigator.pop(context);
              await context.read<AuthProvider>().logout();
              if (mounted) {
                // Redirige al guest view tras cerrar sesión
                Navigator.pushNamedAndRemoveUntil(context, '/guest', (route) => false);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return Container(
      color: AppTheme.appBarDark,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'FoamWashCL',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Row(
            children: [
              Consumer<CartProvider>(
                builder: (context, cart, child) {
                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_cart, color: Colors.white, size: 26),
                        onPressed: () {
                          Navigator.pushNamed(context, '/cart');
                        },
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      if (cart.itemCount > 0)
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.redAccent,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              cart.itemCount.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
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
              IconButton(
                icon: const Icon(Icons.menu, color: Colors.white, size: 28),
                onPressed: () {
                  _scaffoldKey.currentState?.openDrawer();
                },
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 16),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Colors.grey, size: 20),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Buscar servicios',
          hintStyle: const TextStyle(color: AppTheme.greyText, fontSize: 14),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 2),
          ),
        ),
      ),
    );
  }

  Widget _buildServicesList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 16.0),
          child: Text(
            'Nuestros Servicios',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppTheme.darkText,
            ),
            textAlign: TextAlign.center,
          ),
        ),
        Expanded(
          child: Consumer<ServicesProvider>(
            builder: (context, provider, child) {
              if (provider.isLoading) {
                return const Center(
                  child: CircularProgressIndicator(color: AppTheme.primaryBlue),
                );
              } else if (provider.error != null) {
                return Center(
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
                );
              } else if (provider.services.isEmpty) {
                return const Center(
                  child: Text(
                    'No hay servicios disponibles en este momento.',
                    style: TextStyle(color: AppTheme.greyText),
                  ),
                );
              }

              final services = provider.services;
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                itemCount: services.length,
                itemBuilder: (context, index) {
                  return ServiceCard(
                    service: services[index],
                    isGuest: false,
                    controller: _controller,
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}