import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Services/data/models/service_model.dart';

class CartItem {
  final ServiceModel service;
  int quantity;

  CartItem({required this.service, this.quantity = 1});

  Map<String, dynamic> toJson() => {
    'service': service.toJson(),
    'quantity': quantity,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
    service: ServiceModel.fromJson(json['service']),
    quantity: json['quantity'] ?? 1,
  );
}

class CartProvider extends ChangeNotifier {
  final Map<String, CartItem> _items = {};

  CartProvider() {
    _loadCart();
  }

  Map<String, CartItem> get items => _items;

  int get itemCount => _items.length;

  double get totalPrice {
    var total = 0.0;
    _items.forEach((key, cartItem) {
      double price = double.tryParse(cartItem.service.precio) ?? 0.0;
      total += price * cartItem.quantity;
    });
    return total;
  }

  void addService(ServiceModel service) {
    if (!_items.containsKey(service.idServicio.toString())) {
      _items.putIfAbsent(
        service.idServicio.toString(),
        () => CartItem(service: service),
      );
      _saveCart();
      notifyListeners();
    }
  }

  void removeService(String serviceId) {
    _items.remove(serviceId);
    _saveCart();
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _saveCart();
    notifyListeners();
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartList = _items.values.map((item) => jsonEncode(item.toJson())).toList();
    await prefs.setStringList('user_cart', cartList);
  }

  Future<void> _loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartList = prefs.getStringList('user_cart');
    if (cartList != null) {
      for (var itemStr in cartList) {
        try {
          final item = CartItem.fromJson(jsonDecode(itemStr));
          _items[item.service.idServicio.toString()] = item;
        } catch (e) {
          // Ignorar errores de parseo
        }
      }
      notifyListeners();
    }
  }
}
