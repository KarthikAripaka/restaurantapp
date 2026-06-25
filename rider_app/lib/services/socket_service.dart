import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/constants.dart';
import '../models/order.dart';
import '../providers/orders_provider.dart';
import '../utils/audio_helper.dart' as audio_helper;

class SocketService extends ChangeNotifier {
  io.Socket? _webSocket; // Direct Web Socket fallback
  bool _isConnected = false;
  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  StreamSubscription? _assignedSubscription;
  StreamSubscription? _statusSubscription;
  StreamSubscription? _statusConnectionSubscription;

  bool get isConnected => _isConnected;

  SocketService() {
    _initNotifications();
    _initStatusListener();
  }

  void _initStatusListener() {
    if (kIsWeb) return;
    
    // Sync connection status with background service state
    _statusConnectionSubscription =
        FlutterBackgroundService().on('connection_status').listen((event) {
      if (event != null && event['connected'] != null) {
        _isConnected = event['connected'];
        notifyListeners();
      }
    });
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
    if (kIsWeb) return;
    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'dfc_rider_notifications_channel_v3',
        'Delivery Assignments',
        channelDescription: 'Notifications for newly assigned orders and status updates',
        importance: Importance.max,
        priority: Priority.high,
        playSound: true,
        sound: RawResourceAndroidNotificationSound('buzzer'),
        enableVibration: true,
      );

      const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails details = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _notificationsPlugin.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: details,
      );
    } catch (e) {
      debugPrint('Error showing notification: $e');
    }
  }

  void playBuzzerSound() {
    if (kIsWeb) {
      audio_helper.playBuzzer();
    } else {
      // Vibrate mobile device
      HapticFeedback.vibrate();
      Future.delayed(const Duration(milliseconds: 300), () {
        HapticFeedback.vibrate();
      });
    }
  }

  void playCancelSound() {
    if (kIsWeb) {
      audio_helper.playCancel();
    } else {
      HapticFeedback.heavyImpact();
    }
  }

  void connect(String riderId, OrdersProvider ordersProvider) {
    if (kIsWeb) {
      _connectWeb(riderId, ordersProvider);
      return;
    }

    debugPrint('🔌 Connecting socket client using background service for Rider ID: $riderId');

    // Notify background service to connect
    FlutterBackgroundService().invoke('update_credentials', {'riderId': riderId});

    // Listen for order-assigned events from background service
    _assignedSubscription?.cancel();
    _assignedSubscription =
        FlutterBackgroundService().on('order-assigned').listen((data) {
      if (data == null) return;
      try {
        final order = Order.fromJson(data);
        ordersProvider.addAssignedOrder(order);

        // Vibrate/play audio locally while the app is active
        playBuzzerSound();
      } catch (e) {
        debugPrint('Error parsing forwarded order-assigned: $e');
      }
    });

    // Listen for order-status-update events from background service
    _statusSubscription?.cancel();
    _statusSubscription =
        FlutterBackgroundService().on('order-status-update').listen((data) {
      if (data == null) return;
      try {
        final orderJson = data['order'];
        final status = data['status'];
        if (orderJson == null) return;

        final order = Order.fromJson(orderJson);
        ordersProvider.syncOrder(order);

        if (status == 'cancelled') {
          playCancelSound();
        }
      } catch (e) {
        debugPrint('Error parsing forwarded order-status-update: $e');
      }
    });
  }

  void _connectWeb(String riderId, OrdersProvider ordersProvider) {
    if (_webSocket != null) {
      _webSocket!.disconnect();
    }

    _webSocket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(2000)
          .build(),
    );

    _webSocket!.onConnect((_) {
      debugPrint('🔌 Web Socket connected: ${_webSocket!.id}');
      _isConnected = true;
      notifyListeners();
      _webSocket!.emit('join-rider', riderId);
    });

    _webSocket!.onDisconnect((reason) {
      debugPrint('🔌 Web Socket disconnected: $reason');
      _isConnected = false;
      notifyListeners();
    });

    _webSocket!.on('order-assigned', (data) {
      try {
        final order = Order.fromJson(data);
        ordersProvider.addAssignedOrder(order);
        playBuzzerSound();
      } catch (e) {
        debugPrint('Error parsing order-assigned: $e');
      }
    });

    _webSocket!.on('order-status-update', (data) {
      try {
        final orderJson = data['order'];
        final status = data['status'];
        if (orderJson == null) return;

        final order = Order.fromJson(orderJson);
        ordersProvider.syncOrder(order);

        if (status == 'cancelled') {
          playCancelSound();
        }
      } catch (e) {
        debugPrint('Error parsing order-status-update: $e');
      }
    });
  }

  void disconnect() {
    if (kIsWeb) {
      if (_webSocket != null) {
        _webSocket!.disconnect();
        _webSocket = null;
        _isConnected = false;
        notifyListeners();
      }
      return;
    }

    // Tell the background service to disconnect the socket and log out
    FlutterBackgroundService().invoke('logout');
    
    _assignedSubscription?.cancel();
    _assignedSubscription = null;
    _statusSubscription?.cancel();
    _statusSubscription = null;
    
    _isConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    disconnect();
    _statusConnectionSubscription?.cancel();
    super.dispose();
  }
}
