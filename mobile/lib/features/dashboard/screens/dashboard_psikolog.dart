import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../consultation/providers/consultation_provider.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/chat_room_screen.dart';
import '../../../core/theme/colors.dart';
import '../../../core/network/api_client.dart';
import 'edit_profile_screen.dart';
import '../../feed/screens/feed_tab.dart';
import '../../feed/providers/feed_provider.dart';

class DashboardPsikolog extends StatefulWidget {
  const DashboardPsikolog({super.key});

  @override
  State<DashboardPsikolog> createState() => _DashboardPsikologState();
}

class _DashboardPsikologState extends State<DashboardPsikolog> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _loadData() {
    Provider.of<FeedProvider>(context, listen: false).fetchPosts();
    Provider.of<ConsultationProvider>(context, listen: false).fetchIncomingRequests();
    Provider.of<ConsultationProvider>(context, listen: false).fetchPsychologistSessions();
    Provider.of<ChatProvider>(context, listen: false).fetchChats();
    Provider.of<ConsultationProvider>(context, listen: false).fetchPsychologistReviews();
    Provider.of<ConsultationProvider>(context, listen: false).fetchNotificationCounts();
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    final tabs = [
      const FeedTab(showCreatePostHeader: false),
      const IncomingRequestsTab(),
      const ScheduleManagementTab(),
      const PsychologistChatsTab(),
      const PsychologistProfileTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/images/LogoFinal.png', width: 28, height: 28),
            const SizedBox(width: 8),
            const Text(
              'Psikolog',
              style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: -0.5),
            ),
            const SizedBox(width: 8),
            if (user?.isVerified == true)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'TERVERIFIKASI',
                  style: TextStyle(color: AppColors.success, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'PENDING VERIFIKASI',
                  style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
          ],
        ),
        backgroundColor: AppColors.background,
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12.0),
              child: IconButton(
                icon: const Icon(Icons.refresh, color: AppColors.primary),
                onPressed: _loadData,
              ),
            ),
          ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: tabs,
      ),
      bottomNavigationBar: Consumer<ConsultationProvider>(
        builder: (context, consProvider, child) {
          final friendNotifs = consProvider.friendNotificationsCount;
          final sessionNotifs = consProvider.sessionNotificationsCount;
          final totalNotifs = friendNotifs + sessionNotifs;

          return BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
              if (index == 1) {
                Provider.of<ConsultationProvider>(context, listen: false).markFriendNotificationsAsSeen();
              } else if (index == 2) {
                Provider.of<ConsultationProvider>(context, listen: false).markSessionNotificationsAsSeen();
              }
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: AppColors.textLight,
            backgroundColor: Colors.white,
            elevation: 20,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.forum_outlined),
                activeIcon: Icon(Icons.forum),
                label: 'Feed',
              ),
              BottomNavigationBarItem(
                icon: friendNotifs > 0
                    ? Badge(
                        label: Text('$friendNotifs'),
                        child: const Icon(Icons.people_outline),
                      )
                    : const Icon(Icons.people_outline),
                activeIcon: friendNotifs > 0
                    ? Badge(
                        label: Text('$friendNotifs'),
                        child: const Icon(Icons.people),
                      )
                    : const Icon(Icons.people),
                label: 'Permintaan',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.calendar_month_outlined),
                activeIcon: Icon(Icons.calendar_month),
                label: 'Jadwal Sesi',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.chat_bubble_outline),
                activeIcon: Icon(Icons.chat_bubble),
                label: 'Konsultasi',
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
// TAB 1: PERMINTAAN PERTEMANAN KONSULTASI MASUK
// ----------------------------------------------------
class IncomingRequestsTab extends StatelessWidget {
  const IncomingRequestsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final consProvider = Provider.of<ConsultationProvider>(context);

    return consProvider.isLoading && consProvider.incomingRequests.isEmpty
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : consProvider.incomingRequests.isEmpty
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, size: 48, color: AppColors.textLight),
                      SizedBox(height: 12),
                      Text(
                        'Belum ada permintaan konsultasi masuk.',
                        style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              )
            : RefreshIndicator(
                onRefresh: () async {
                  Provider.of<ConsultationProvider>(context, listen: false).fetchIncomingRequests();
                },
                color: AppColors.primary,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: consProvider.incomingRequests.length,
                  itemBuilder: (ctx, idx) {
                    final req = consProvider.incomingRequests[idx];
                    final requester = req['requester'];
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      color: Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: AppColors.secondary.withValues(alpha: 0.5),
                                  child: const Icon(Icons.person, color: AppColors.primary),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        requester['name'] ?? 'User Anonim',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textDark),
                                      ),
                                      Text(
                                        'Akun: ${requester['role'] ?? 'anonim'}',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textLight),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Text('Keluhan/Kategori:', style: TextStyle(fontSize: 12, color: AppColors.textLight, fontWeight: FontWeight.bold)),
                            Text(
                              req['category'] ?? 'Tidak ditentukan',
                              style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                            ),
                            const SizedBox(height: 14),
                            
                            // Accept/Reject action buttons
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: AppColors.error),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () async {
                                      final res = await consProvider.rejectRequest(req['user_id']);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text(res['message'] ?? 'Permintaan ditolak.')),
                                        );
                                      }
                                    },
                                    child: const Text('Tolak', style: TextStyle(color: AppColors.error)),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.success,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () async {
                                      final res = await consProvider.acceptRequest(req['user_id']);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text(res['message'] ?? 'Permintaan diterima.'),
                                            backgroundColor: AppColors.success,
                                          ),
                                        );
                                        // Refresh active chats since pertemanan is accepted
                                        Provider.of<ChatProvider>(context, listen: false).fetchChats();
                                      }
                                    },
                                    child: const Text('Terima', style: TextStyle(color: Colors.white)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
  }
}

// ----------------------------------------------------
// TAB 2: MANAJEMEN JADWAL SESI & AKTIVASI CHAT
// ----------------------------------------------------
class ScheduleManagementTab extends StatefulWidget {
  const ScheduleManagementTab({super.key});

  @override
  State<ScheduleManagementTab> createState() => _ScheduleManagementTabState();
}

class _ScheduleManagementTabState extends State<ScheduleManagementTab> {
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();

  @override
  void dispose() {
    _dateController.dispose();
    _timeController.dispose();
    super.dispose();
  }

  void _showCreateScheduleDialog(BuildContext context) {
    _dateController.text = DateTime.now().toString().split(' ').first;
    _timeController.text = '09:00:00';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Buat Slot Jadwal Sesi', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _dateController,
              decoration: const InputDecoration(
                labelText: 'Tanggal Sesi (YYYY-MM-DD)',
                prefixIcon: Icon(Icons.calendar_today, color: AppColors.primary),
              ),
              keyboardType: TextInputType.datetime,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _timeController,
              decoration: const InputDecoration(
                labelText: 'Waktu Sesi (HH:MM:SS)',
                prefixIcon: Icon(Icons.access_time, color: AppColors.primary),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMedium)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (_dateController.text.trim().isEmpty || _timeController.text.trim().isEmpty) return;
              
              Navigator.pop(ctx);
              
              final provider = Provider.of<ConsultationProvider>(context, listen: false);
              final res = await provider.createSessionSchedule(
                _dateController.text.trim(),
                _timeController.text.trim(),
              );

              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(res['message'] ?? 'Jadwal sesi dibuat.'),
                    backgroundColor: res['success'] ? AppColors.success : AppColors.error,
                  ),
                );
              }
            },
            child: const Text('Simpan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final consProvider = Provider.of<ConsultationProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateScheduleDialog(context),
        backgroundColor: AppColors.primary,
        tooltip: 'Tambah Slot Jadwal',
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: consProvider.isLoading && consProvider.psychoSessions.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : consProvider.psychoSessions.isEmpty
              ? const Center(
                  child: Text('Tidak ada slot jadwal sesi ditemukan.', style: TextStyle(color: AppColors.textMedium)),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    Provider.of<ConsultationProvider>(context, listen: false).fetchPsychologistSessions();
                  },
                  color: AppColors.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: consProvider.psychoSessions.length,
                    itemBuilder: (ctx, idx) {
                      final session = consProvider.psychoSessions[idx];
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        color: Colors.white,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Sesi #${session.id}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textDark),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: session.status == 'available'
                                          ? Colors.green[50]
                                          : session.status == 'pending_approval'
                                              ? Colors.amber[50]
                                              : session.status == 'booked'
                                                  ? Colors.blue[50]
                                                  : Colors.grey[100],
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      session.status.replaceAll('_', ' ').toUpperCase(),
                                      style: TextStyle(
                                        color: session.status == 'available'
                                            ? Colors.green
                                            : session.status == 'pending_approval'
                                                ? Colors.amber
                                                : session.status == 'booked'
                                                    ? Colors.blue
                                                    : Colors.grey,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_month, size: 16, color: AppColors.textLight),
                                  const SizedBox(width: 8),
                                  Text('${session.sessionDate} pada ${session.sessionTime}', style: const TextStyle(color: AppColors.textMedium, fontSize: 13)),
                                ],
                              ),
                              if (session.user != null) ...[
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.person_outline, size: 16, color: AppColors.textLight),
                                    const SizedBox(width: 8),
                                    Text('Pasien: ${session.user!.name}', style: const TextStyle(color: AppColors.textDark, fontSize: 13, fontWeight: FontWeight.w500)),
                                  ],
                                ),
                              ],
                              const SizedBox(height: 12),
                              
                              // Schedule Action controls
                              Row(
                                children: [
                                  // Cancel session schedule
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppColors.error),
                                    onPressed: () async {
                                      final res = await consProvider.cancelSession(session.id);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text(res['message'] ?? 'Sesi dihapus.')),
                                        );
                                      }
                                    },
                                  ),
                                  const Spacer(),
                                  
                                  // Pending approval -> confirm/approve booking
                                  if (session.status == 'pending_approval')
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                      onPressed: () async {
                                        final res = await consProvider.approveSession(session.id);
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text(res['message'] ?? 'Sesi dikonfirmasi.'), backgroundColor: AppColors.success),
                                          );
                                        }
                                      },
                                      child: const Text('Konfirmasi Sesi', style: TextStyle(color: Colors.white, fontSize: 12)),
                                    )
                                  
                                  // Booked (approved) -> start chat consultation session
                                  else if (session.status == 'booked') ...[
                                    if (session.startedAt == null)
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                        onPressed: () async {
                                          final res = await consProvider.startSession(session.id);
                                          if (context.mounted && res['success']) {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) => ChatRoomScreen(
                                                  friendId: session.userId!,
                                                  friendName: session.user?.name ?? 'Pasien',
                                                ),
                                              ),
                                            );
                                          }
                                        },
                                        child: const Text('Mulai Chat Sesi', style: TextStyle(color: Colors.white, fontSize: 12)),
                                      )
                                    else ...[
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white, side: const BorderSide(color: AppColors.primary), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => ChatRoomScreen(
                                                friendId: session.userId!,
                                                friendName: session.user?.name ?? 'Pasien',
                                              ),
                                            ),
                                          );
                                        },
                                        child: const Text('Buka Chat', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                        onPressed: () async {
                                          final res = await consProvider.endSession(session.id);
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text(res['message'] ?? 'Sesi berakhir.'), backgroundColor: AppColors.error),
                                            );
                                          }
                                        },
                                        child: const Text('Akhiri Sesi', style: TextStyle(color: Colors.white, fontSize: 12)),
                                      ),
                                    ]
                                  ]
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

// ----------------------------------------------------
// TAB 3: PSIKOLOG CHATS LIST
// ----------------------------------------------------
class PsychologistChatsTab extends StatelessWidget {
  const PsychologistChatsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);

    return chatProvider.isLoadingChats && chatProvider.chats.isEmpty
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : chatProvider.chats.isEmpty
            ? const Center(
                child: Text('Belum ada konsultasi aktif.', style: TextStyle(color: AppColors.textMedium)),
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
                        child: const Icon(Icons.person, color: AppColors.primary),
                      ),
                      title: Text(friend.name, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textDark)),
                      subtitle: const Text('Pasien Konsultasi', style: TextStyle(fontSize: 12, color: AppColors.textLight)),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.textMedium),
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
// TAB 4: PROFILE PSIKOLOG
// ----------------------------------------------------
class PsychologistProfileTab extends StatelessWidget {
  const PsychologistProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            elevation: 1,
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    backgroundImage: user?.profileImage != null && user!.profileImage!.isNotEmpty
                        ? NetworkImage(user.profileImage!.startsWith('http')
                            ? user.profileImage!
                            : '${ApiClient.defaultStorageUrl}/${user.profileImage}')
                        : null,
                    child: user?.profileImage == null || user!.profileImage!.isEmpty
                        ? const Icon(Icons.face, size: 40, color: AppColors.primary)
                        : null,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Nama Psikolog',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? 'psikolog@curhatin.com',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                  ),
                  const SizedBox(height: 12),
                  Chip(
                    backgroundColor: AppColors.accent.withValues(alpha: 0.1),
                    side: BorderSide.none,
                    label: Text(
                      (user?.spesialisasi ?? 'spesialisasi').replaceAll('_', ' ').toUpperCase(),
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.accent),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Settings Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            elevation: 1,
            color: Colors.white,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.edit_outlined, color: AppColors.primary),
                  title: const Text('Edit Profil', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600)),
                  trailing: const Icon(Icons.chevron_right, color: AppColors.textMedium),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Reviews Card
          Consumer<ConsultationProvider>(
            builder: (context, consProvider, child) {
              final reviews = consProvider.reviews;
              final avgRating = consProvider.averageRating;
              final totalReviews = consProvider.totalReviews;

              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                elevation: 1,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ulasan & Penilaian Pasien',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                avgRating.toStringAsFixed(1),
                                style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.primary),
                              ),
                              const Text('/ 5.0', style: TextStyle(fontSize: 12, color: AppColors.textLight)),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: List.generate(5, (index) {
                                    return Icon(
                                      index < avgRating.round() ? Icons.star : Icons.star_border,
                                      color: Colors.amber,
                                      size: 20,
                                    );
                                  }),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Berdasarkan $totalReviews ulasan dari pasien',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      if (reviews.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12.0),
                          child: Center(
                            child: Text(
                              'Belum ada ulasan yang diterima.',
                              style: TextStyle(color: AppColors.textLight, fontSize: 13),
                            ),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: reviews.length,
                          separatorBuilder: (context, index) => const Divider(height: 16),
                          itemBuilder: (ctx, idx) {
                            final review = reviews[idx];
                            final rating = int.tryParse(review['rating'].toString()) ?? 0;
                            final comment = review['comment'] ?? '';
                            final isAnon = review['is_anonymous'] == true ||
                                           review['is_anonymous'] == 1 ||
                                           review['is_anonymous'] == '1';
                            
                            final patientName = isAnon 
                                ? 'Pasien Anonim' 
                                : (review['patient']?['name'] ?? 'Pasien');
                            final patientPhoto = isAnon 
                                ? null 
                                : review['patient']?['profile_image'];

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 14,
                                      backgroundColor: AppColors.secondary.withValues(alpha: 0.5),
                                      backgroundImage: patientPhoto != null && patientPhoto.isNotEmpty
                                          ? NetworkImage(patientPhoto.startsWith('http')
                                              ? patientPhoto
                                              : '${ApiClient.defaultStorageUrl}/$patientPhoto')
                                          : null,
                                      child: patientPhoto == null
                                          ? const Icon(Icons.person, size: 14, color: AppColors.primary)
                                          : null,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      patientName,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textDark),
                                    ),
                                    const Spacer(),
                                    Row(
                                      children: List.generate(5, (index) {
                                        return Icon(
                                          index < rating ? Icons.star : Icons.star_border,
                                          color: Colors.amber,
                                          size: 14,
                                        );
                                      }),
                                    ),
                                  ],
                                ),
                                if (comment.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    comment,
                                    style: const TextStyle(fontSize: 12, color: AppColors.textMedium, height: 1.3),
                                  ),
                                ],
                              ],
                            );
                          },
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 32),

          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () {
              authProvider.logout();
            },
            icon: const Icon(Icons.logout),
            label: const Text('Keluar dari Akun', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
