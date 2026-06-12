import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chatbot_provider.dart';
import '../../payment/providers/payment_provider.dart';
import '../../payment/screens/midtrans_payment_screen.dart';
import '../../../core/theme/colors.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Load start chatbot message on open
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ChatbotProvider>(context, listen: false).startChat();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
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
    if (text.isEmpty) return;

    _messageController.clear();
    final provider = Provider.of<ChatbotProvider>(context, listen: false);
    await provider.sendMessage(text);
    _scrollToBottom();
  }

  void _handleOptionClick(String option) async {
    if (option == 'Lanjut ke Pembayaran') {
      _triggerPremiumCheckout();
    } else {
      final provider = Provider.of<ChatbotProvider>(context, listen: false);
      await provider.sendMessage(option);
      _scrollToBottom();
    }
  }

  void _triggerPremiumCheckout() async {
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

    // Standard upgrade price 50000 IDR
    final response = await paymentProvider.getUpgradeToken(50000);

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
          // Restart chat because user is now premium
          if (mounted) {
            Provider.of<ChatbotProvider>(context, listen: false).startChat();
          }
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
    final botProvider = Provider.of<ChatbotProvider>(context);

    // Trigger scroll to bottom on message updates
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.spa, color: AppColors.primary),
            SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sahabat Mental',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Dukungan AI 24/7',
                  style: TextStyle(color: AppColors.textMedium, fontSize: 11),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: AppColors.textDark),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textMedium),
            tooltip: 'Reset Obrolan',
            onPressed: () {
              botProvider.resetChat();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Message list
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: botProvider.messages.length,
              itemBuilder: (ctx, index) {
                final msg = botProvider.messages[index];
                final isBot = msg['role'] == 'assistant';

                return Align(
                  alignment: isBot
                      ? Alignment.centerLeft
                      : Alignment.centerRight,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    margin: const EdgeInsets.only(bottom: 12.0),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                    decoration: BoxDecoration(
                      color: isBot ? Colors.white : AppColors.primary,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isBot
                            ? Radius.zero
                            : const Radius.circular(16),
                        bottomRight: isBot
                            ? const Radius.circular(16)
                            : Radius.zero,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      msg['content'] ?? '',
                      style: TextStyle(
                        color: isBot ? AppColors.textDark : Colors.white,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Options widget (e.g. Upgrade Premium redirect option)
          if (botProvider.options.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: Wrap(
                spacing: 8.0,
                children: botProvider.options.map((option) {
                  final isUpgrade = option == 'Lanjut ke Pembayaran';
                  return ActionChip(
                    backgroundColor: isUpgrade
                        ? AppColors.accent
                        : Colors.white,
                    side: BorderSide(
                      color: isUpgrade ? AppColors.accent : AppColors.secondary,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    label: Text(
                      option,
                      style: TextStyle(
                        color: isUpgrade ? Colors.white : AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    onPressed: () => _handleOptionClick(option),
                  );
                }).toList(),
              ),
            ),

          // Loading indicator for Bot response
          if (botProvider.isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: AppColors.primary,
                    strokeWidth: 2,
                  ),
                ),
              ),
            ),

          // Input field
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: 20,
              top: 12,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Ketik pesan Anda...',
                      fillColor: AppColors.background,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
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
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
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
