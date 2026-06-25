import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/rider.dart';

class AuthProvider extends ChangeNotifier {
  Rider? _rider;
  String? _token;
  bool _isLoading = false;
  String? _error;

  Rider? get rider => _rider;
  String? get token => _token;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('dfc_rider_token');
    if (_token != null) {
      await fetchMe();
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/auth/rider/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        _token = body['token'];
        final riderData = body['data']['rider'];
        _rider = Rider.fromJson(riderData);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('dfc_rider_token', _token!);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = body['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Connection failed. Please check your network or API server.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _rider = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('dfc_rider_token');
    notifyListeners();
  }

  Future<void> fetchMe() async {
    if (_token == null) return;

    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/auth/rider/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final riderData = body['data']['rider'];
        _rider = Rider.fromJson(riderData);
        notifyListeners();
      } else if (response.statusCode == 401) {
        await logout();
      }
    } catch (e) {
      // Offline or network error - keep local session but print
      debugPrint('Error fetching rider profile: $e');
    }
  }
}
