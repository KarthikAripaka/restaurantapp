import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/constants.dart';
import '../models/order.dart';
import '../providers/orders_provider.dart';
// import '../utils/audio_helper.dart' as audio_helper;

class SocketService extends ChangeNotifier {
  io.Socket? _socket;
  bool _isConnected = false;
  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  bool get isConnected => _isConnected;

  SocketService() {
    _initNotifications();
  }

  Future<void> _initNotifications() async {
    if (kIsWeb) return;
    if (!Platform.isAndroid && !Platform.isIOS && !Platform.isMacOS) return;

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _notificationsPlugin.initialize(settings: initializationSettings);

    // Request permissions for Android 13+
    _notificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    // Disabled notifications as requested
    return;
  }

  void playBuzzerSound() {
    // Disabled buzzer sound per user request
    return;
  }

  void playCancelSound() {
    // Disabled cancel sound per user request
    return;
  }

  void connect(String riderId, OrdersProvider ordersProvider) {
    if (_socket != null) {
      disconnect();
    }

    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      debugPrint('🔌 Socket connected: ${_socket!.id}');
      _isConnected = true;
      notifyListeners();
      _socket!.emit('join-rider', riderId);
    });

    _socket!.onDisconnect((reason) {
      debugPrint('🔌 Socket disconnected: $reason');
      _isConnected = false;
      notifyListeners();
    });

    _socket!.on('order-assigned', (data) {
      try {
        final order = Order.fromJson(data);
        ordersProvider.addAssignedOrder(order);

        // Native System Notification
        showNotification(
          id: order.id.hashCode,
          title: '🛵 New Delivery Assigned!',
          body: 'Order ID: ${order.orderId} · Total: ₹${order.total}',
        );

        // Web Audio synthesized buzzer beeps
        playBuzzerSound();

        // Custom premium floating in-app Snackbar (Disabled per user request)
        /*
        scaffoldMessengerKey.currentState?.showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Text('🛵', style: TextStyle(fontSize: 24)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'New Delivery Assigned!',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                      ),
                      Text(
                        'Order ID: ${order.orderId} · Total: ₹${order.total.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 11, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFFF7780E),
            duration: const Duration(seconds: 6),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ),
        );
        */
      } catch (e) {
        debugPrint('Error parsing order-assigned socket event: $e');
      }
    });

    _socket!.on('order-status-update', (data) {
      try {
        final orderJson = data['order'];
        final status = data['status'];
        if (orderJson == null) return;

        final order = Order.fromJson(orderJson);
        ordersProvider.syncOrder(order);

        if (status == 'cancelled') {
          // Native System Notification
          showNotification(
            id: order.id.hashCode + 1,
            title: '⚠️ Delivery Cancelled',
            body: 'Order ${order.orderId} has been cancelled by the restaurant',
          );

          // Web Audio synthesized warning beeps
          playCancelSound();

          // Custom floating warning Snackbar (Disabled per user request)
          /*
          scaffoldMessengerKey.currentState?.showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Text('⚠️', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Delivery Cancelled',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                        ),
                        Text(
                          'Order ${order.orderId} was cancelled by the restaurant',
                          style: const TextStyle(fontSize: 11, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              backgroundColor: const Color(0xFFE2131C),
              duration: const Duration(seconds: 7),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
          */
        }
      } catch (e) {
        debugPrint('Error parsing order-status-update socket event: $e');
      }
    });
  }

  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket = null;
      _isConnected = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}
