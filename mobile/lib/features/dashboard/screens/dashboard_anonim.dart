import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../../feed/screens/feed_tab.dart';
import 'edit_profile_screen.dart';
import '../../feed/providers/feed_provider.dart';
import '../../consultation/providers/consultation_provider.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/chat_room_screen.dart';
import '../../chatbot/screens/chatbot_screen.dart';
import '../../payment/providers/payment_provider.dart';
import '../../payment/screens/midtrans_payment_screen.dart';
import '../../../core/theme/colors.dart';
import '../../../core/network/api_client.dart';
import 'notification_tab.dart';

class DashboardAnonim extends StatefulWidget {
  const DashboardAnonim({super.key});

  @override
  State<DashboardAnonim> createState() => _DashboardAnonimState();
}

class _DashboardAnonimState extends State<DashboardAnonim> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }

  void _loadInitialData() {
    Provider.of<FeedProvider>(context, listen: false).fetchPosts();
    Provider.of<ConsultationProvider>(
      context,
      listen: false,
    ).fetchPsychologists(refresh: true);
    Provider.of<ConsultationProvider>(
      context,
      listen: false,
    ).fetchFriendStatuses();
    Provider.of<ChatProvider>(context, listen: false).fetchChats();
    Provider.of<ConsultationProvider>(
      context,
      listen: false,
    ).fetchMyBookedSessions();
    Provider.of<ConsultationProvider>(
      context,
      listen: false,
    ).fetchNotificationCounts();
  }

  // Trigger Midtrans upgrade flow
  void _triggerPremiumUpgrade() async {
    final paymentProvider = Provider.of<PaymentProvider>(
      context,
      listen: false,
    );

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(width: 20),
            Expanded(child: Text('Menghubungi server pembayaran...')),
          ],
        ),
      ),
    );

    final response = await paymentProvider.getUpgradeToken(
      15000,
    ); // Rp 15.000 for premium upgrade

    if (mounted) {
      Navigator.pop(context); // Close loading dialog
    }

    if (response['status'] == 'success') {
      final snapToken = response['snap_token'];
      final orderId = response['order_id'];

      if (mounted) {
        final success = await Navigator.push<bool>(
          context,
          MaterialPageRoute(
            builder: (_) =>
                MidtransPaymentScreen(snapToken: snapToken, orderId: orderId),
          ),
        );

        if (success == true) {
          _loadInitialData(); // reload
        }
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Gagal memproses pembayaran.'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    final tabs = [
      FeedTab(),
      const SearchPsikologTab(),
      const MessagesTab(),
      ProfileTab(onUpgradePressed: _triggerPremiumUpgrade),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/images/LogoFinal.png', width: 28, height: 28),
            const SizedBox(width: 8),
            const Text(
              'Curhatin',
              style: TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w800,
                fontSize: 22,
                letterSpacing: -0.5,
              ),
            ),
            if (user?.isPremium == true) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'PREMIUM',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: CircleAvatar(
              backgroundColor: AppColors.secondary.withValues(alpha: 0.3),
              radius: 18,
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: const Icon(
                  Icons.refresh,
                  color: AppColors.primary,
                  size: 20,
                ),
                onPressed: _loadInitialData,
              ),
            ),
          ),
          Consumer<ConsultationProvider>(
            builder: (context, consProvider, child) {
              final totalNotifs =
                  consProvider.friendNotificationsCount +
                  consProvider.sessionNotificationsCount;
              return IconButton(
                icon: totalNotifs > 0
                    ? Badge(
                        backgroundColor: Colors.red,
                        label: Text(
                          '$totalNotifs',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                          ),
                        ),
                        child: const Icon(
                          Icons.notifications_none,
                          color: AppColors.primary,
                        ),
                      )
                    : const Icon(
                        Icons.notifications_none,
                        color: AppColors.primary,
                      ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const NotificationTab()),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: IndexedStack(index: _currentIndex, children: tabs),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.accent,
        tooltip: 'Sahabat Mental AI',
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ChatbotScreen()),
          );
        },
        child: const Icon(Icons.spa, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
      bottomNavigationBar: Consumer<ConsultationProvider>(
        builder: (context, consProvider, child) {
          return BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: AppColors.textLight,
            backgroundColor: Colors.white,
            elevation: 20,
            selectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
            unselectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 11,
            ),
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.forum_outlined),
                activeIcon: Icon(Icons.forum),
                label: 'Feed',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.search_outlined),
                activeIcon: Icon(Icons.search),
                label: 'Cari Psikolog',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.mail_outline),
                activeIcon: Icon(Icons.mail),
                label: 'Pesan',
              ),

              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Profil',
              ),
            ],
          );
        },
      ),
    );
  }
}

// ----------------------------------------------------
// TAB 2: CARI & PENJADWALAN PSIKOLOG
// ----------------------------------------------------
class SearchPsikologTab extends StatefulWidget {
  const SearchPsikologTab({super.key});

  @override
  State<SearchPsikologTab> createState() => _SearchPsikologTabState();
}

class _SearchPsikologTabState extends State<SearchPsikologTab> {
  String? _selectedCategory;
  final List<Map<String, String>> _categories = [
    {'key': '', 'label': 'Semua'},
    {'key': 'kesehatan_mental', 'label': 'Kesehatan Mental'},
    {'key': 'kecemasan_stres', 'label': 'Kecemasan & Stres'},
    {'key': 'depresi', 'label': 'Depresi'},
    {'key': 'karir_akademik', 'label': 'Karir & Akademik'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ConsultationProvider>(
        context,
        listen: false,
      ).fetchPsychologists();
    });
  }

  void _changeCategory(String? cat) {
    setState(() {
      _selectedCategory = cat;
    });
    Provider.of<ConsultationProvider>(
      context,
      listen: false,
    ).fetchPsychologists(category: cat);
  }

  void _promptConnect(BuildContext context, UserModel psiko) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Hubungi ${psiko.name}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tuliskan secara singkat keluhan atau alasan Anda ingin berkonsultasi:',
              style: TextStyle(fontSize: 13, color: AppColors.textMedium),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: InputDecoration(
                hintText: 'e.g. Masalah kecemasan kerja...',
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Batal',
              style: TextStyle(color: AppColors.textMedium),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = Provider.of<ConsultationProvider>(
                context,
                listen: false,
              );
              final res = await provider.connectPsychologist(
                psiko.id,
                category: reasonController.text.trim(),
              );

              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      res['message'] ?? 'Permintaan konsultasi dikirim.',
                    ),
                    backgroundColor: res['success'] != false
                        ? AppColors.success
                        : AppColors.error,
                  ),
                );
              }
            },
            child: const Text(
              'Ajukan Sesi',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _showBookSessionSheet(BuildContext context, UserModel psiko) async {
    final provider = Provider.of<ConsultationProvider>(context, listen: false);

    // Fetch available sessions for this psychologist
    await provider.fetchAvailableSessions(psiko.id);

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Consumer<ConsultationProvider>(
        builder: (context, consProvider, child) => Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Pilih Jadwal Sesi - ${psiko.name}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const Divider(),
              const SizedBox(height: 8),
              if (consProvider.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24.0),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (consProvider.availableSessions.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Center(
                    child: Text(
                      'Tidak ada sesi jadwal yang tersedia saat ini.',
                      style: TextStyle(
                        color: AppColors.textLight,
                        fontSize: 13,
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: consProvider.availableSessions.length,
                    itemBuilder: (ctx, idx) {
                      final session = consProvider.availableSessions[idx];
                      return ListTile(
                        leading: const Icon(
                          Icons.calendar_month,
                          color: AppColors.primary,
                        ),
                        title: Text(
                          '${session.sessionDate} pada ${session.sessionTime}',
                        ),
                        subtitle: const Text('Status: Tersedia untuk dipesan'),
                        trailing: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          onPressed: () async {
                            Navigator.pop(ctx);
                            final result = await consProvider.bookSession(
                              session.id,
                            );

                            if (context.mounted) {
                              showDialog(
                                context: context,
                                builder: (c) => AlertDialog(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  title: Text(
                                    result['success']
                                        ? 'Sukses Memesan!'
                                        : 'Gagal Memesan',
                                  ),
                                  content: Text(result['message'] ?? ''),
                                  actions: [
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                      ),
                                      onPressed: () {
                                        Navigator.pop(c);
                                        consProvider
                                            .fetchMyBookedSessions(); // Refresh booked list
                                      },
                                      child: const Text(
                                        'Tutup',
                                        style: TextStyle(color: Colors.white),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }
                          },
                          child: const Text(
                            'Pesan',
                            style: TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReviewDialog(BuildContext context, UserModel psiko) {
    int selectedRating = 5;
    final commentController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: Text(
            'Beri Ulasan - ${psiko.name}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Berikan penilaian Anda:',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starIndex = index + 1;
                  return IconButton(
                    onPressed: isSubmitting
                        ? null
                        : () {
                            setState(() {
                              selectedRating = starIndex;
                            });
                          },
                    icon: Icon(
                      starIndex <= selectedRating
                          ? Icons.star
                          : Icons.star_border,
                      color: Colors.amber,
                      size: 32,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 12),
              const Text(
                'Komentar (Opsional):',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: commentController,
                enabled: !isSubmitting,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Tulis ulasan Anda di sini...',
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              if (isSubmitting) ...[
                const SizedBox(height: 12),
                const Row(
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(AppColors.primary),
                      ),
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Mengirim rating...',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
              child: const Text(
                'Batal',
                style: TextStyle(color: AppColors.textMedium),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: Colors.grey[300],
              ),
              onPressed: isSubmitting
                  ? null
                  : () async {
                      setState(() => isSubmitting = true);
                      final provider = Provider.of<ConsultationProvider>(
                        context,
                        listen: false,
                      );
                      final res = await provider.submitReview(
                        psiko.id,
                        selectedRating,
                        commentController.text.trim(),
                      );
                      setState(() => isSubmitting = false);

                      if (context.mounted) {
                        Navigator.pop(ctx);
                        if (res['success'] != false) {
                          // Show thank you dialog on success
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (ctx) => AlertDialog(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              title: const Text(
                                'Terimakasih!',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: AppColors.primary,
                                ),
                              ),
                              content: const Text(
                                'Terimakasih telah memberi rating. Rating Anda sangat membantu.',
                                style: TextStyle(fontSize: 14),
                              ),
                              actions: [
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                  ),
                                  onPressed: () => Navigator.pop(ctx),
                                  child: const Text(
                                    'OK',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                          );
                        } else {
                          // Show error message
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                res['message'] ?? 'Gagal mengirim ulasan.',
                              ),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        }
                        // Refresh psychologists list
                        provider.fetchPsychologists();
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                  : const Text('Kirim', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final consProvider = Provider.of<ConsultationProvider>(context);
    final user = Provider.of<AuthProvider>(context).user;

    return Column(
      children: [
        // Horizontal categories
        Container(
          height: 48,
          margin: const EdgeInsets.only(top: 12, bottom: 8),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _categories.length,
            itemBuilder: (ctx, idx) {
              final cat = _categories[idx];
              final isSelected = (_selectedCategory ?? '') == cat['key'];

              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: FilterChip(
                  selected: isSelected,
                  backgroundColor: Colors.white,
                  selectedColor: AppColors.primary,
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.secondary,
                  ),
                  checkmarkColor: Colors.white,
                  label: Text(
                    cat['label']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textDark,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                      fontSize: 12,
                    ),
                  ),
                  onSelected: (bool selected) {
                    _changeCategory(cat['key']);
                  },
                ),
              );
            },
          ),
        ),

        // List of psychologists
        Expanded(
          child: consProvider.isLoading && consProvider.psychologists.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                )
              : consProvider.psychologists.isEmpty
              ? const Center(
                  child: Text(
                    'Tidak ada psikolog ditemukan.',
                    style: TextStyle(color: AppColors.textMedium),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: consProvider.psychologists.length,
                  itemBuilder: (ctx, idx) {
                    final psiko = consProvider.psychologists[idx];
                    final status =
                        consProvider.friendStatuses[psiko.id.toString()];

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      elevation: 1,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      color: Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 28,
                              backgroundColor: AppColors.secondary.withValues(
                                alpha: 0.5,
                              ),
                              backgroundImage: psiko.profileImage != null
                                  ? NetworkImage(
                                      psiko.profileImage!.startsWith('http')
                                          ? psiko.profileImage!
                                          : '${ApiClient.defaultStorageUrl}/${psiko.profileImage}',
                                    )
                                  : null,
                              child: psiko.profileImage == null
                                  ? const Icon(
                                      Icons.face,
                                      size: 28,
                                      color: AppColors.primary,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    psiko.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: AppColors.textDark,
                                    ),
                                  ),
                                  Text(
                                    (psiko.spesialisasi ?? 'Psikologi Umum')
                                        .replaceAll('_', ' ')
                                        .toUpperCase(),
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: AppColors.accent,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.star,
                                        color: Colors.amber,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        psiko.reviewsAvgRating != null
                                            ? psiko.reviewsAvgRating!
                                                  .toStringAsFixed(1)
                                            : '0.0',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textDark,
                                        ),
                                      ),
                                      Text(
                                        ' (${psiko.reviewsCount ?? 0} Ulasan)',
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textLight,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),

                                  // Action button based on connection status
                                  if (user?.isPremium != true)
                                    ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.grey[200],
                                        shadowColor: Colors.transparent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                      ),
                                      onPressed: () {
                                        final state = context
                                            .findAncestorStateOfType<
                                              _DashboardAnonimState
                                            >();
                                        state?._triggerPremiumUpgrade();
                                      },
                                      icon: const Icon(
                                        Icons.lock_outline,
                                        size: 14,
                                        color: AppColors.textMedium,
                                      ),
                                      label: const Text(
                                        'Upgrade Premium untuk Chat',
                                        style: TextStyle(
                                          color: AppColors.textMedium,
                                          fontSize: 11,
                                        ),
                                      ),
                                    )
                                  else if (status == 'accepted')
                                    Row(
                                      children: [
                                        Expanded(
                                          flex: 2,
                                          child: ElevatedButton.icon(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  AppColors.primary,
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                            ),
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) =>
                                                      ChatRoomScreen(
                                                        friendId: psiko.id,
                                                        friendName: psiko.name,
                                                      ),
                                                ),
                                              );
                                            },
                                            icon: const Icon(
                                              Icons.chat_bubble_outline,
                                              size: 16,
                                              color: Colors.white,
                                            ),
                                            label: const Text(
                                              'Chat',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          flex: 2,
                                          child: OutlinedButton.icon(
                                            style: OutlinedButton.styleFrom(
                                              side: const BorderSide(
                                                color: AppColors.accent,
                                              ),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                            ),
                                            onPressed: () =>
                                                _showBookSessionSheet(
                                                  context,
                                                  psiko,
                                                ),
                                            icon: const Icon(
                                              Icons.calendar_month,
                                              size: 16,
                                              color: AppColors.accent,
                                            ),
                                            label: const Text(
                                              'Jadwalkan',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: AppColors.accent,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        IconButton(
                                          style: IconButton.styleFrom(
                                            backgroundColor: Colors.amber[50],
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                              side: const BorderSide(
                                                color: Colors.amber,
                                              ),
                                            ),
                                            padding: EdgeInsets.zero,
                                          ),
                                          onPressed: () =>
                                              _showReviewDialog(context, psiko),
                                          icon: const Icon(
                                            Icons.star,
                                            color: Colors.amber,
                                            size: 20,
                                          ),
                                        ),
                                      ],
                                    )
                                  else if (status == 'pending')
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.amber[50],
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                      ),
                                      onPressed: null,
                                      child: const Text(
                                        'Menunggu Konfirmasi',
                                        style: TextStyle(
                                          color: Colors.amber,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    )
                                  else if (status == 'rejected')
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red[50],
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                      ),
                                      onPressed: () =>
                                          _promptConnect(context, psiko),
                                      child: const Text(
                                        'Kirim Ulang Permintaan',
                                        style: TextStyle(
                                          color: AppColors.error,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    )
                                  else
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                      ),
                                      onPressed: () =>
                                          _promptConnect(context, psiko),
                                      child: const Text(
                                        'Hubungkan Konsultasi',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

// ----------------------------------------------------
// TAB 3: DAFTAR CHAT / PESAN AKTIF
// ----------------------------------------------------
class MessagesTab extends StatelessWidget {
  const MessagesTab({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);

    return chatProvider.isLoadingChats && chatProvider.chats.isEmpty
        ? const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          )
        : chatProvider.chats.isEmpty
        ? const Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 48,
                    color: AppColors.textLight,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Belum ada chat aktif.\nAjukan konsultasi dengan psikolog di tab Cari Psikolog.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                  ),
                ],
              ),
            ),
          )
        : RefreshIndicator(
            onRefresh: () async => chatProvider.fetchChats(),
            color: AppColors.primary,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: chatProvider.chats.length,
              itemBuilder: (ctx, idx) {
                final friend = chatProvider.chats[idx];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.secondary.withValues(alpha: 0.5),
                    backgroundImage: friend.profileImage != null
                        ? NetworkImage(
                            friend.profileImage!.startsWith('http')
                                ? friend.profileImage!
                                : '${ApiClient.defaultStorageUrl}/${friend.profileImage}',
                          )
                        : null,
                    child: friend.profileImage == null
                        ? const Icon(Icons.person, color: AppColors.primary)
                        : null,
                  ),
                  title: Text(
                    friend.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                  ),
                  subtitle: Text(
                    friend.role == 'psikolog'
                        ? 'Psikolog Profesional'
                        : 'Teman Curhat',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),
                  trailing: const Icon(
                    Icons.chevron_right,
                    color: AppColors.textMedium,
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ChatRoomScreen(
                          friendId: friend.id,
                          friendName: friend.name,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          );
  }
}

// ----------------------------------------------------
// TAB 4: PROFILE USER
// ----------------------------------------------------
class ProfileTab extends StatelessWidget {
  final VoidCallback onUpgradePressed;

  const ProfileTab({super.key, required this.onUpgradePressed});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final consProvider = Provider.of<ConsultationProvider>(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // User Card
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 1,
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    backgroundImage:
                        user?.profileImage != null &&
                            user!.profileImage!.isNotEmpty
                        ? NetworkImage(
                            user.profileImage!.startsWith('http')
                                ? user.profileImage!
                                : '${ApiClient.defaultStorageUrl}/${user.profileImage}',
                          )
                        : null,
                    child:
                        user?.profileImage == null ||
                            user!.profileImage!.isEmpty
                        ? const Icon(
                            Icons.person,
                            size: 40,
                            color: AppColors.primary,
                          )
                        : null,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Anonim',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? 'anonim@curhatin.com',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMedium,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Chip(
                    backgroundColor: user?.isPremium == true
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : Colors.grey[100],
                    side: BorderSide.none,
                    label: Text(
                      user?.isPremium == true ? 'PREMIUM USER' : 'FREE USER',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: user?.isPremium == true
                            ? AppColors.primary
                            : AppColors.textMedium,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Settings Card
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 1,
            color: Colors.white,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(
                    Icons.edit_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text(
                    'Edit Profil',
                    style: TextStyle(
                      color: AppColors.textDark,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  trailing: const Icon(
                    Icons.chevron_right,
                    color: AppColors.textMedium,
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const EditProfileScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Upgrade Premium Card
          if (user?.isPremium != true)
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              elevation: 4,
              shadowColor: AppColors.accent.withValues(alpha: 0.2),
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(24),
                ),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.star, color: Colors.amber, size: 24),
                        SizedBox(width: 8),
                        Text(
                          'Upgrade ke Premium',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Dapatkan akses penuh chatbot tanpa batas harian, buat postingan curhat di feed, dan hubungi psikolog ahli!',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                      ),
                      onPressed: onUpgradePressed,
                      child: const Text(
                        'Upgrade Sekarang (Rp 15.000)',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Scheduled sessions summary list
          const Text(
            'Jadwal Konsultasi Mendatang',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 8),

          if (consProvider.myBookedSessions.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                'Belum ada jadwal sesi yang aktif.',
                style: TextStyle(color: AppColors.textMedium, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: consProvider.myBookedSessions.length,
              itemBuilder: (ctx, idx) {
                final session = consProvider.myBookedSessions[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    leading: const Icon(
                      Icons.event_note,
                      color: AppColors.accent,
                    ),
                    title: Text(session.psychologist?.name ?? 'Psikolog'),
                    subtitle: Text(
                      '${session.sessionDate} - ${session.sessionTime}\nStatus: ${session.status.replaceAll('_', ' ').toUpperCase()}',
                    ),
                    isThreeLine: true,
                    trailing: session.status == 'booked'
                        ? TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatRoomScreen(
                                    friendId: session.psychologistId,
                                    friendName:
                                        session.psychologist?.name ??
                                        'Psikolog',
                                  ),
                                ),
                              );
                            },
                            child: const Text('Mulai Chat'),
                          )
                        : null,
                  ),
                );
              },
            ),

          const SizedBox(height: 32),

          // Logout Button
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () {
              authProvider.logout();
            },
            icon: const Icon(Icons.logout),
            label: const Text(
              'Keluar dari Akun',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
