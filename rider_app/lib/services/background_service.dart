import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'package:flutter/foundation.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/constants.dart';
import '../models/order.dart';

Future<void> initializeBackgroundService() async {
  if (kIsWeb) return;
  if (!Platform.isAndroid && !Platform.isIOS && !Platform.isMacOS) return;

  final service = FlutterBackgroundService();

  const AndroidNotificationChannel serviceChannel = AndroidNotificationChannel(
    'dfc_rider_service_channel',
    'DFC Rider Service',
    description: 'Keeps DFC Rider active in the background for real-time delivery alerts.',
    importance: Importance.low,
  );

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  if (Platform.isAndroid) {
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(serviceChannel);
  }

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: true,
      isForegroundMode: true,
      notificationChannelId: 'dfc_rider_service_channel',
      initialNotificationTitle: 'DFC Rider Service Active',
      initialNotificationContent: 'Waiting for orders...',
      foregroundServiceTypes: [AndroidForegroundType.dataSync],
    ),
    iosConfiguration: IosConfiguration(
      autoStart: true,
      onForeground: (service) {},
      onBackground: (service) => false,
    ),
  );
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();

  final FlutterLocalNotificationsPlugin notificationsPlugin = FlutterLocalNotificationsPlugin();
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings initializationSettings = InitializationSettings(
    android: initializationSettingsAndroid,
  );
  await notificationsPlugin.initialize(settings: initializationSettings);

  io.Socket? socket;
  String? currentRiderId;

  void connectSocket(String riderId) {
    if (socket != null) {
      socket!.disconnect();
      socket = null;
    }

    debugPrint('🔌 Background Service connecting for Rider ID: $riderId');

    socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableReconnection()
          .setReconnectionAttempts(9999)
          .setReconnectionDelay(2000)
          .build(),
    );

    socket!.onConnect((_) {
      debugPrint('🔌 Background Socket connected successfully: ${socket!.id}');
      socket!.emit('join-rider', riderId);
      
      service.invoke('connection_status', {'connected': true});
      
      if (service is AndroidServiceInstance) {
        service.setForegroundNotificationInfo(
          title: "DFC Rider Online",
          content: "Listening for new delivery assignments.",
        );
      }
    });

    socket!.onDisconnect((reason) {
      debugPrint('🔌 Background Socket disconnected: $reason');
      service.invoke('connection_status', {'connected': false});
      if (service is AndroidServiceInstance) {
        service.setForegroundNotificationInfo(
          title: "DFC Rider Offline",
          content: "Reconnecting to server...",
        );
      }
    });

    socket!.on('order-assigned', (data) async {
      try {
        final order = Order.fromJson(data);
        
        // Show native alert notification with buzzer sound
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

        const NotificationDetails details = NotificationDetails(
          android: androidDetails,
        );

        await notificationsPlugin.show(
          id: order.id.hashCode,
          title: '🛵 New Delivery Assigned!',
          body: 'Order ID: ${order.orderId} · Total: ₹${order.total}',
          notificationDetails: details,
        );

        // Forward to the active UI isolate if the app is currently running in the foreground
        service.invoke('order-assigned', data);
      } catch (e) {
        debugPrint('Error handling background order-assigned: $e');
      }
    });

    socket!.on('order-status-update', (data) async {
      try {
        final orderJson = data['order'];
        final status = data['status'];
        if (orderJson == null) return;
        final order = Order.fromJson(orderJson);

        if (status == 'cancelled') {
          const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
            'dfc_rider_notifications_channel_v3',
            'Delivery Assignments',
            channelDescription: 'Notifications for newly assigned orders and status updates',
            importance: Importance.max,
            priority: Priority.high,
            playSound: true,
            enableVibration: true,
          );

          const NotificationDetails details = NotificationDetails(
            android: androidDetails,
          );

          await notificationsPlugin.show(
            id: order.id.hashCode + 1,
            title: '⚠️ Delivery Cancelled',
            body: 'Order ${order.orderId} has been cancelled by the restaurant',
            notificationDetails: details,
          );
        }

        // Forward to UI isolate
        service.invoke('order-status-update', data);
      } catch (e) {
        debugPrint('Error handling background order-status-update: $e');
      }
    });
  }

  // Handle changes to credentials sent by UI
  service.on('update_credentials').listen((event) {
    if (event != null && event['riderId'] != null) {
      final String riderId = event['riderId'];
      if (currentRiderId != riderId) {
        currentRiderId = riderId;
        connectSocket(riderId);
      }
    }
  });

  // Handle force disconnect/signout
  service.on('logout').listen((event) {
    if (socket != null) {
      socket!.disconnect();
      socket = null;
    }
    currentRiderId = null;
    if (service is AndroidServiceInstance) {
      service.setForegroundNotificationInfo(
        title: "DFC Rider Offline",
        content: "Logged out. Waiting for login...",
      );
    }
  });

  // Bootstrap initial connection using cached credentials if user is already logged in
  try {
    final prefs = await SharedPreferences.getInstance();
    final cachedProfile = prefs.getString('dfc_rider_profile');
    if (cachedProfile != null) {
      final profile = jsonDecode(cachedProfile);
      final riderId = profile['_id'] ?? profile['id'];
      if (riderId != null) {
        currentRiderId = riderId;
        connectSocket(riderId);
      }
    }
  } catch (e) {
    debugPrint('Error initializing background credentials: $e');
  }
}
