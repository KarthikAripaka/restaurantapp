import 'package:flutter/material.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class AppConstants {
  // Can be configured here for production deployment (e.g. Render URLs)
  static String get baseUrl => 'https://dfc-2lm7.onrender.com/api';

  static String get socketUrl => 'https://dfc-2lm7.onrender.com';
}
