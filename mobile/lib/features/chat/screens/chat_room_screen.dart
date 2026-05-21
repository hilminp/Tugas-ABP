import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/theme/colors.dart';
import '../../../core/network/api_client.dart';

class ChatRoomScreen extends StatefulWidget {
  final int friendId;
  final String friendName;

  const ChatRoomScreen({
    super.key,
    required this.friendId,
    required this.friendName,
  });

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollingTimer;
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMessages();
      // Setup periodic polling to simulate live chat on local environment (every 4 seconds)
      _pollingTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
        if (mounted) {
          Provider.of<ChatProvider>(context, listen: false).refreshMessages(widget.friendId);
        }
      });
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadMessages() {
    Provider.of<ChatProvider>(context, listen: false).fetchMessages(widget.friendId);
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 100,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty && _selectedImage == null) return;

    _messageController.clear();
    final image = _selectedImage;
    setState(() {
      _selectedImage = null;
    });

    final provider = Provider.of<ChatProvider>(context, listen: false);
    final result = await provider.sendMessage(widget.friendId, text.isNotEmpty ? text : null, image);
    
    if (!result['success'] && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Gagal mengirim pesan.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
    _scrollToBottom();
  }

  void _simulateImageAttachment() {
    // Simulate image picking
    setState(() {
      _selectedImage = File('/dummy_path/attachment_image.png');
    });
    
    // Quick dialogue info
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Simulasi gambar disematkan. Tekan kirim untuk mengunggah.'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);
    final myUser = Provider.of<AuthProvider>(context).user;

    // Trigger scroll on new messages
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.friendName, style: const TextStyle(color: AppColors.textDark, fontSize: 16, fontWeight: FontWeight.bold)),
            Text(
              chatProvider.isLocked ? 'Konsultasi Terkunci' : 'Konsultasi Aktif',
              style: TextStyle(
                color: chatProvider.isLocked ? AppColors.error : AppColors.success,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: AppColors.textDark),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textMedium),
            onPressed: _loadMessages,
          ),
        ],
      ),
      body: Column(
        children: [
          // Locked warning banner
          if (chatProvider.isLocked)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              color: const Color(0xFFFEF2F2),
              child: Row(
                children: [
                  const Icon(Icons.lock_outline, color: AppColors.error, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      chatProvider.lockMessage.isNotEmpty 
                          ? chatProvider.lockMessage 
                          : 'Sesi konsultasi terkunci. Lakukan penjadwalan sesi konsultasi terlebih dahulu.',
                      style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),

          // Messages List
          Expanded(
            child: chatProvider.isLoadingMessages && chatProvider.messages.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : RefreshIndicator(
                    onRefresh: () async => _loadMessages(),
                    color: AppColors.primary,
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16.0),
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemCount: chatProvider.messages.length,
                      itemBuilder: (ctx, index) {
                        final msg = chatProvider.messages[index];
                        final isMe = msg.senderId == myUser?.id;
                        
                        return Align(
                          alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.72,
                            ),
                            margin: const EdgeInsets.only(bottom: 12.0),
                            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                            decoration: BoxDecoration(
                              color: isMe ? AppColors.primary : Colors.white,
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(16),
                                topRight: const Radius.circular(16),
                                bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
                                bottomRight: isMe ? Radius.zero : const Radius.circular(16),
                              ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.02),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  )
                                ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // If image attachment exists
                                if (msg.image != null) ...[
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.network(
                                      // Local/Remote storage URL resolving helper
                                      msg.image!.startsWith('http') 
                                          ? msg.image! 
                                          : '${ApiClient.defaultStorageUrl}/${msg.image}',
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        height: 150,
                                        color: Colors.grey[200],
                                        alignment: Alignment.center,
                                        child: const Icon(Icons.broken_image_outlined, color: AppColors.textMedium),
                                      ),
                                    ),
                                  ),
                                  if (msg.body != null) const SizedBox(height: 8),
                                ],
                                if (msg.body != null)
                                  Text(
                                    msg.body!,
                                    style: TextStyle(
                                      color: isMe ? Colors.white : AppColors.textDark,
                                      fontSize: 14,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),

          // Attached Image Preview
          if (_selectedImage != null)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.grey[100],
              child: Row(
                children: [
                  const Icon(Icons.image, color: AppColors.primary),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text('attachment_image.png (Simulasi Gambar)', style: TextStyle(fontSize: 12, color: AppColors.textMedium)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.error),
                    onPressed: () => setState(() => _selectedImage = null),
                  ),
                ],
              ),
            ),

          // Input field or lock overlay
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 20, top: 12),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary),
                  onPressed: chatProvider.isLocked ? null : _simulateImageAttachment,
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    enabled: !chatProvider.isLocked,
                    decoration: InputDecoration(
                      hintText: chatProvider.isLocked ? 'Konsultasi terkunci...' : 'Ketik pesan konsultasi...',
                      fillColor: AppColors.background,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: chatProvider.isLocked ? Colors.grey[300] : AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: chatProvider.isLocked ? null : _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
