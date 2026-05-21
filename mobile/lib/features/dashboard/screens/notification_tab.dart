import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';

class NotificationTab extends StatelessWidget {
  const NotificationTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textDark),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: const Text('Notifikasi', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600)),
        ),
        backgroundColor: AppColors.background,
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.notifications_none, size: 64, color: AppColors.textLight),
              SizedBox(height: 16),
              Text(
                'Belum ada notifikasi baru.',
                style: TextStyle(color: AppColors.textMedium, fontSize: 14),
              ),
            ],
          ),
        ),
      );
  }
}
