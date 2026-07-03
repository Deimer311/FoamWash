// =============================================================================
// ARCHIVO  : cotizador.dart (Cliente)
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Pantalla de cotización para clientes AUTENTICADOS.
//            Replica el flujo de CotizacionesCliente.jsx:
//            HeaderCliente + CotizacionScreen embebida con navegación correcta.
// =============================================================================

import 'package:flutter/material.dart';
import 'package:foamwash/Features/Cotizacion/Cotizacion.dart';

/// Pantalla de cotización para el cliente autenticado.
/// Envuelve [CotizacionScreen] con el header de cliente y los callbacks
/// correctos para la navegación interna del dashboard de cliente.
class ClienteCotizadorScreen extends StatelessWidget {
  final VoidCallback? onBackToHome;
  final VoidCallback? onGoToServicios;
  final VoidCallback? onGoPerfil;

  const ClienteCotizadorScreen({
    Key? key,
    this.onBackToHome,
    this.onGoToServicios,
    this.onGoPerfil,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CotizacionScreen(
      onBackToHome:    onBackToHome,
      onGoToServicios: onGoToServicios,
      // El cliente ya está autenticado, no necesita ir al login desde aquí.
      // Si por alguna razón pierde la sesión, lo redirigimos al home.
      onGoToLogin: onBackToHome,
    );
  }
}
