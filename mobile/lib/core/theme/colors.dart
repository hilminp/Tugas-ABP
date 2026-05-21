import 'package:flutter/material.dart';

class AppColors {
  // Brand color scheme from Curhatin web
  static const Color primary = Color(0xFFA46477);      // Signature Deep Rose
  static const Color background = Color(0xFFFFF8F8);   // Soft Blush Background
  static const Color accent = Color(0xFFDB7391);       // Vibrant Rose
  static const Color cardBg = Color(0xFFFFF0F3);       // Light Pink Card Background
  static const Color secondary = Color(0xFFEAD5D9);    // Scrollbar / Subtle pink border
  static const Color textDark = Color(0xFF3D2535);     // Dark Plum text
  static const Color textMedium = Color(0xFF8A7480);   // Grayish Plum text
  static const Color textLight = Color(0xFFC4B4BC);    // Light Grayish Plum text
  
  static const Color success = Color(0xFF10B981);      // Emerald green
  static const Color warning = Color(0xFFF59E0B);      // Orange amber
  static const Color error = Color(0xFFEF4444);        // Bright red
  
  // Gradients matching web
  static const Gradient primaryGradient = LinearGradient(
    colors: [
      Color(0xFFDB7391),
      Color(0xFF9F4F72),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient auroraGradient = RadialGradient(
    colors: [
      Color(0xFFFCE9EC),
      Color(0xFFFDB2C7),
      Color(0xFFFFF8F8),
    ],
    center: Alignment.center,
    radius: 1.0,
  );
}
