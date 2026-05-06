import 'package:flutter/material.dart';
import 'package:foamwash/Features/Comun/service_model.dart';
import 'package:foamwash/Features/Services/services/api_service.dart';

class ServicesProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<ServiceModel> _services = [];
  bool _isLoading = false;
  String? _error;

  List<ServiceModel> get services => _services;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchServices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _services = await _apiService.fetchServices();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
