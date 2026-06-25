import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/order.dart';

class OrdersProvider extends ChangeNotifier {
  List<Order> _activeOrders = [];
  List<Order> _historyOrders = [];
  bool _isLoading = false;
  final Set<String> _newOrderIds = {};
  Timer? _pollingTimer;

  List<Order> get activeOrders => _activeOrders;
  List<Order> get historyOrders => _historyOrders;
  bool get isLoading => _isLoading;
  Set<String> get newOrderIds => _newOrderIds;

  Future<void> fetchActive(String token) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/rider/orders?view=active'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List ordersList = body['data']['orders'] ?? [];
        _activeOrders = ordersList.map((o) => Order.fromJson(o)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching active orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchHistory(String token) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/rider/orders?view=history'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List ordersList = body['data']['orders'] ?? [];
        _historyOrders = ordersList.map((o) => Order.fromJson(o)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching history orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void addAssignedOrder(Order order) {
    if (_activeOrders.any((o) => o.id == order.id)) return;
    _activeOrders.add(order);
    _newOrderIds.add(order.id);
    notifyListeners();
  }

  void syncOrder(Order order) {
    final stillActive = ['ready', 'out_for_delivery'].contains(order.status);
    if (stillActive) {
      final index = _activeOrders.indexWhere((o) => o.id == order.id);
      if (index != -1) {
        _activeOrders[index] = order;
      } else {
        _activeOrders.add(order);
      }
    } else {
      _activeOrders.removeWhere((o) => o.id == order.id);
    }
    notifyListeners();
  }

  void acknowledgeNew(String id) {
    if (_newOrderIds.contains(id)) {
      _newOrderIds.remove(id);
      notifyListeners();
    }
  }

  void startPolling(String token) {
    _pollingTimer?.cancel();
    // Poll every 3 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      fetchActiveBackground(token);
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> fetchActiveBackground(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/rider/orders?view=active'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List ordersList = body['data']['orders'] ?? [];
        _activeOrders = ordersList.map((o) => Order.fromJson(o)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching active orders in background: $e');
    }
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }

  Future<Map<String, dynamic>> startDelivery(String id, String token) async {
    try {
      final response = await http.patch(
        Uri.parse('${AppConstants.baseUrl}/rider/orders/$id/start'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final updatedOrder = Order.fromJson(body['data']['order']);
        syncOrder(updatedOrder);
        return {'success': true, 'order': updatedOrder};
      } else {
        return {'success': false, 'message': body['message'] ?? 'Could not start delivery'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  Future<Map<String, dynamic>> finishOrder(String id, String token) async {
    try {
      final response = await http.patch(
        Uri.parse('${AppConstants.baseUrl}/rider/orders/$id/finish'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final updatedOrder = Order.fromJson(body['data']['order']);
        _activeOrders.removeWhere((o) => o.id == id);
        _historyOrders.insert(0, updatedOrder);
        notifyListeners();
        return {'success': true, 'order': updatedOrder};
      } else {
        return {'success': false, 'message': body['message'] ?? 'Could not finish order'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }
}
