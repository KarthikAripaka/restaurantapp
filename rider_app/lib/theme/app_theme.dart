import 'package:flutter/material.dart';

class AppColors {
  static const Color cream50 = Color(0xFFFDFBF7);
  static const Color cream100 = Color(0xFFF5F2EB);
  static const Color cream200 = Color(0xFFEBE7D9);

  static const Color ink900 = Color(0xFF1A1816);
  static const Color ink700 = Color(0xFF403C38);
  static const Color ink600 = Color(0xFF5C5752);
  static const Color ink500 = Color(0xFF7F7770);
  static const Color ink400 = Color(0xFFA69E96);

  static const Color brandRed = Color(0xFFE2131C);
  static const Color brandOrange = Color(0xFFF7780E);
  static const Color brandGreen = Color(0xFF5B9E0F);

  static const Color white = Colors.white;
  static const Color cardBorder = Color(0x121A1816); // 7% opacity ink900
  static const Color shadowColor = Color(0x0A000000);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [brandRed, brandOrange],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [brandGreen, Color(0xFF7CB825)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient alertGradient = LinearGradient(
    colors: [brandRed, Color(0xFF950C14)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.cream50,
      colorScheme: const ColorScheme.light(
        primary: AppColors.brandRed,
        secondary: AppColors.brandOrange,
        surface: AppColors.white,
        error: AppColors.brandRed,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.ink900,
      ),
      fontFamily: 'Inter',
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.cardBorder, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: AppColors.ink400, fontSize: 14),
        labelStyle: const TextStyle(color: AppColors.ink600, fontSize: 14, fontWeight: FontWeight.w500),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0x1A1A1816)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.brandOrange, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.brandRed),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cream100, // Styled soft neat background color
        elevation: 0.5,
        iconTheme: IconThemeData(color: AppColors.ink900),
        titleTextStyle: TextStyle(color: AppColors.ink900, fontSize: 18, fontWeight: FontWeight.bold),
        centerTitle: false,
      ),
    );
  }
}
