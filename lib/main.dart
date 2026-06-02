import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Comun/Index.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import 'package:foamwash/Features/auth_login/register_screen.dart';
import 'package:foamwash/Features/Services/views/guest_view.dart';
import 'package:foamwash/Features/Services/views/scheduling_view.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/auth_login/providers/auth_provider.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Admin/views/admin_agenda_view.dart';
import 'package:foamwash/Features/Admin/views/admin_empleados_view.dart';
import 'package:foamwash/Features/Admin/views/admin_usuarios_view.dart';
import 'package:foamwash/Features/Admin/views/admin_reportes_view.dart';
import 'package:foamwash/Features/Admin/providers/empleados_provider.dart';
import 'package:foamwash/Features/Admin/providers/usuarios_provider.dart';

import 'package:foamwash/Features/auth_login/data/data_sources/auth_remote_data_source.dart';
import 'package:foamwash/Features/auth_login/data/repositories/auth_repository.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

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
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const IndexScreen(),
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
          '/admin_reportes': (context) => AdminReportesView(),
        },
      ),
    );
  }
}

