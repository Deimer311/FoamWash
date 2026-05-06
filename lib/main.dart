import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Comun/Index.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import 'package:foamwash/Features/auth_login/register_screen.dart';
import 'package:foamwash/Features/Services/views/guest_view.dart';
import 'package:foamwash/Features/Services/views/scheduling_view.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/auth_login/providers/auth_provider.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Admin/views/admin_agenda_view.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkAuthStatus()),
        ChangeNotifierProvider(create: (_) => ServicesProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorSchemeSeed: Colors.blue,
        ),
        home: const IndexScreen(),
        routes: {
          '/login': (context) => LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const IndexScreen(),
          '/guest': (context) => const GuestView(),
          '/scheduling': (context) => const SchedulingView(),
          '/admin_dashboard': (context) => const AdminDashboardView(),
          '/admin_agenda': (context) => const AdminAgendaView(),
        },
      ),
    );
  }
}

