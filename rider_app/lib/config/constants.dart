import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class AppConstants {
  // Can be configured here for production deployment (e.g. Render URLs)
  static String get baseUrl {
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://127.0.0.1:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  static String get socketUrl {
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://127.0.0.1:5000';
    }
    return 'http://localhost:5000';
  }
}
