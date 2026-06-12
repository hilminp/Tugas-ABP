import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../consultation/providers/consultation_provider.dart';
import '../../../core/theme/colors.dart';

class NotificationTab extends StatefulWidget {
  const NotificationTab({super.key});

  @override
  State<NotificationTab> createState() => _NotificationTabState();
}

class _NotificationTabState extends State<NotificationTab> {
  Set<String> _unreadNotificationIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadNotifications();
    });
  }

  Future<void> _loadNotifications() async {
    final provider = Provider.of<ConsultationProvider>(context, listen: false);
    await provider.fetchNotifications();
    
    if (mounted) {
      setState(() {
        _unreadNotificationIds = provider.notifications
            .where((n) => !n.isSeen)
            .map((n) => n.id)
            .toSet();
      });
      // Mark seen in backend and update counts
      await provider.markAllNotificationsAsSeen();
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    final String timeString = "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";

    if (difference.inDays == 0 && now.day == dateTime.day) {
      return "Hari ini, $timeString";
    } else if (difference.inDays == 1 || (difference.inDays == 0 && now.day - dateTime.day == 1)) {
      return "Kemarin, $timeString";
    } else {
      final months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return "${dateTime.day} ${months[dateTime.month - 1]} ${dateTime.year}, $timeString";
    }
  }

  IconData _getIcon(String type, String title) {
    if (type == 'friendship') {
      if (title.toLowerCase().contains('terima') || title.toLowerCase().contains('acc')) {
        return Icons.person_add_alt_1_outlined;
      } else if (title.toLowerCase().contains('tolak')) {
        return Icons.person_off_outlined;
      }
      return Icons.people_outline;
    } else if (type == 'session') {
      if (title.toLowerCase().contains('selesai')) {
        return Icons.event_available_outlined;
      }
      return Icons.calendar_today_outlined;
    }
    return Icons.notifications_none_outlined;
  }

  Color _getIconColor(String type, String title) {
    if (type == 'friendship') {
      if (title.toLowerCase().contains('terima') || title.toLowerCase().contains('acc')) {
        return AppColors.success;
      } else if (title.toLowerCase().contains('tolak')) {
        return AppColors.error;
      }
      return AppColors.accent;
    } else if (type == 'session') {
      if (title.toLowerCase().contains('selesai')) {
        return Colors.blueGrey;
      }
      return AppColors.primary;
    }
    return AppColors.primary;
  }

  Color _getIconBgColor(String type, String title) {
    return _getIconColor(type, title).withValues(alpha: 0.1);
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ConsultationProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textDark),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Notifikasi',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.primary),
            onPressed: _loadNotifications,
          )
        ],
      ),
      body: provider.isLoading && provider.notifications.isEmpty
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : RefreshIndicator(
              onRefresh: _loadNotifications,
              color: AppColors.primary,
              child: provider.notifications.isEmpty
                  ? ListView(
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                        const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.notifications_none_outlined, size: 72, color: AppColors.textLight),
                              SizedBox(height: 16),
                              Text(
                                'Belum Ada Notifikasi',
                                style: TextStyle(
                                  color: AppColors.textDark,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 6),
                              Text(
                                'Setiap pemberitahuan jadwal & status konsultasi\nakan muncul di sini.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: AppColors.textMedium,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: provider.notifications.length,
                      itemBuilder: (context, index) {
                        final notification = provider.notifications[index];
                        final isNew = _unreadNotificationIds.contains(notification.id);
                        final icon = _getIcon(notification.type, notification.title);
                        final iconColor = _getIconColor(notification.type, notification.title);
                        final iconBgColor = _getIconBgColor(notification.type, notification.title);

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isNew ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: InkWell(
                              onTap: () {
                                // Tap interaction can be added if we want to navigate to detail
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Left Icon
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: iconBgColor,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        icon,
                                        color: iconColor,
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    // Middle Content
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            notification.title,
                                            style: TextStyle(
                                              color: AppColors.textDark,
                                              fontWeight: isNew ? FontWeight.bold : FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notification.message,
                                            style: const TextStyle(
                                              color: AppColors.textMedium,
                                              fontSize: 13,
                                              height: 1.3,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            _formatDateTime(notification.createdAt),
                                            style: const TextStyle(
                                              color: AppColors.textLight,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Right Unread Dot
                                    if (isNew)
                                      Container(
                                        width: 8,
                                        height: 8,
                                        margin: const EdgeInsets.only(left: 8, top: 4),
                                        decoration: const BoxDecoration(
                                          color: AppColors.primary,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
