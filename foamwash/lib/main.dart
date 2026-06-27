import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/core/services/fcm_service.dart';
import 'package:foamwash/Features/Comun/Index.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import 'package:foamwash/Features/Autenticacion/register_screen.dart';
import 'package:foamwash/Features/Services/views/guest_view.dart';
import 'package:foamwash/Features/Services/views/scheduling_view.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Admin/views/admin_agenda_view.dart';
import 'package:foamwash/Features/Admin/views/admin_empleados_view.dart';
import 'package:foamwash/Features/Admin/views/admin_usuarios_view.dart';
import 'package:foamwash/Features/Admin/views/admin_reportes_view.dart';
import 'package:foamwash/Features/Admin/views/admin_servicios_view.dart';
import 'package:foamwash/Features/Admin/providers/empleados_provider.dart';
import 'package:foamwash/Features/Admin/providers/usuarios_provider.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';
import 'package:foamwash/Features/Cart/views/cart_view.dart';
import 'package:foamwash/Features/Services/views/agendamientos_view.dart';

import 'package:foamwash/Features/Autenticacion/data/data_sources/auth_remote_data_source.dart';
import 'package:foamwash/Features/Cotizacion/Cotizacion.dart';
import 'package:foamwash/Features/Cliente/views/perfil_cliente_edit.dart';
import 'package:foamwash/Features/Trabajador/views/perfil_trabajador_edit.dart';
import 'package:foamwash/Features/Admin/views/perfil_admin_edit.dart';
import 'package:foamwash/Features/Trabajador/views/agenda_trabajador.dart';
import 'package:foamwash/Features/Admin/views/empleados_crud.dart';
import 'package:foamwash/Features/Admin/views/usuarios_crud.dart';
import 'package:foamwash/Features/Autenticacion/data/repositories/auth_repository.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Cliente/views/perfil_cliente.dart';
import 'package:foamwash/Features/Trabajador/views/perfil_trabajador.dart';
import 'package:foamwash/Features/Admin/views/perfil_admin.dart';
import 'package:foamwash/Api/api_constants.dart';

import 'package:shared_preferences/shared_preferences.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Mensaje de FCM recibido en segundo plano: ${message.messageId}");
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyRouteObserver extends RouteObserver<PageRoute<dynamic>> {
  Future<void> _saveRoute(String routeName) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (routeName == '/' || routeName == '/home' || routeName == '/login' || routeName == '/register' || routeName == '/guest') {
        await prefs.remove('last_route');
      } else {
        await prefs.setString('last_route', routeName);
      }
    } catch (_) {}
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    if (route.settings.name != null) _saveRoute(route.settings.name!);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (newRoute?.settings.name != null) _saveRoute(newRoute!.settings.name!);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    if (previousRoute?.settings.name != null) _saveRoute(previousRoute!.settings.name!);
  }
}

final RouteObserver<PageRoute> routeObserver = MyRouteObserver();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await FCMService.initialize(navigatorKey);
  } catch (e) {
    print('Error al inicializar Firebase/FCM: $e');
  }

  String? initialRoute;
  try {
    final secureStorageService = SecureStorageService();
    final token = await secureStorageService.read('token');
    if (token != null && token.isNotEmpty) {
      final prefs = await SharedPreferences.getInstance();
      initialRoute = prefs.getString('last_route');
    }
  } catch (_) {}

  runApp(MyApp(initialRoute: initialRoute));
}

class MyApp extends StatelessWidget {
  final String? initialRoute;
  const MyApp({super.key, this.initialRoute});

  @override
  Widget build(BuildContext context) {
    // Instanciamos las dependencias (puedes usar GetIt en el futuro para esto)
    final secureStorageService = SecureStorageService();
    final authDataSource = AuthRemoteDataSource();
    final authRepository = AuthRepository(
      remoteDataSource: authDataSource,
      secureStorageService: secureStorageService,
    );

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(repository: authRepository)..checkAuthStatus(),
        ),
        ChangeNotifierProvider(create: (_) => ServicesProvider()),
        ChangeNotifierProvider(create: (_) => EmpleadosProvider()),
        ChangeNotifierProvider(create: (_) => UsuariosProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        navigatorKey: navigatorKey,
        navigatorObservers: [routeObserver],
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: initialRoute,
        home: initialRoute == null ? const IndexScreen() : null,
        routes: {
          '/login': (context) => LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const IndexScreen(),
          '/guest': (context) => const GuestView(),
          '/scheduling': (context) => const SchedulingView(),
          '/admin_dashboard': (context) => const AdminDashboardView(),
          '/admin_agenda': (context) => const AdminAgendaView(),
          '/admin_empleados': (context) => const AdminEmpleadosView(),
          '/admin_usuarios': (context) => const AdminUsuariosView(),
          '/cotizador': (context) => CotizacionScreen(
            onBackToHome: () {
              if (Navigator.canPop(context)) {
                Navigator.pop(context);
              } else {
                Navigator.pushReplacementNamed(context, '/home');
              }
            },
            onGoToLogin: () => Navigator.pushNamed(context, '/login'),
          ),
          '/admin_servicios': (context) => const AdminServiciosView(),
          '/admin_reportes': (context) => const AdminReportesView(),
          '/empleado_agenda': (context) => const EmpleadoAgendaView(),
          '/cart': (context) => const CartView(),
          '/agendamientos': (context) => const AgendamientosView(),
          '/perfilCliente': (context) {
            final auth = Provider.of<AuthProvider>(context, listen: false);
            return PerfilClienteScreen(
              apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
              userId: auth.user?.idUsuario?.toString() ?? '',
              onEditarPerfil: () async {
                await Navigator.push(context, MaterialPageRoute(builder: (_) => PerfilClienteEditScreen(
                  apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
                  userId: auth.user?.idUsuario?.toString() ?? '',
                )));
              },
              onLogout: () {
                auth.logout();
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              },
              onBackToHome: () => Navigator.pop(context),
            );
          },
          '/perfilTrabajador': (context) {
            final auth = Provider.of<AuthProvider>(context, listen: false);
            return PerfilTrabajadorScreen(
              apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
              userId: auth.user?.idUsuario?.toString() ?? '',
              onEditarPerfil: () async {
                await Navigator.push(context, MaterialPageRoute(builder: (_) => PerfilTrabajadorEditScreen(
                  apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
                  userId: auth.user?.idUsuario?.toString() ?? '',
                )));
              },
              onLogout: () {
                auth.logout();
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              },
              onBackToHome: () => Navigator.pop(context),
            );
          },
          '/perfilAdmin': (context) {
            final auth = Provider.of<AuthProvider>(context, listen: false);
            return PerfilAdminScreen(
              apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
              userId: auth.user?.idUsuario?.toString() ?? '',
              onEditarPerfil: () async {
                await Navigator.push(context, MaterialPageRoute(builder: (_) => PerfilAdminEditScreen(
                  apiBaseUrl: ApiConstants.baseUrl.replaceAll('/api', ''),
                  userId: auth.user?.idUsuario?.toString() ?? '',
                )));
              },
              onLogout: () {
                auth.logout();
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              },
              onBackToHome: () => Navigator.pop(context),
            );
          },
        },
      ),
    );
  }
}

