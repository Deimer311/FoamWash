import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';
import 'package:foamwash/Features/Cart/views/checkout_step1_view.dart';

class CartView extends StatefulWidget {
  const CartView({Key? key}) : super(key: key);

  @override
  State<CartView> createState() => _CartViewState();
}

class _CartViewState extends State<CartView> {
  void _handleCheckout(CartProvider cartProvider) {
    if (cartProvider.items.isEmpty) return;

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CheckoutStep1View()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrito de Servicios'),
        backgroundColor: AppTheme.appBarDark,
        foregroundColor: Colors.white,
      ),
      backgroundColor: AppTheme.backgroundWhite,
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, child) {
          if (cartProvider.items.isEmpty) {
            return const Center(
              child: Text(
                'Tu carrito está vacío',
                style: TextStyle(fontSize: 18, color: AppTheme.greyText),
              ),
            );
          }

          final cartItems = cartProvider.items.values.toList();

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: cartItems.length,
                  itemBuilder: (context, index) {
                    final item = cartItems[index];
                    return Card(
                      color: AppTheme.cardWhite,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: item.service.imagenUrl != null && item.service.imagenUrl!.startsWith('http')
                              ? Image.network(
                                  item.service.imagenUrl!,
                                  width: 50,
                                  height: 50,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(Icons.cleaning_services),
                                )
                              : Image.asset(
                                  'assets/fondo.png',
                                  width: 50,
                                  height: 50,
                                  fit: BoxFit.cover,
                                ),
                        ),
                        title: Text(item.service.nombreServicio, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('\$${item.service.precio}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                          onPressed: () {
                            cartProvider.removeService(item.service.idServicio.toString());
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, -5),
                    )
                  ],
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total:',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '\$${cartProvider.totalPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () => _handleCheckout(cartProvider),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryBlue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Text(
                          'Siguiente',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
