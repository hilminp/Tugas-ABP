import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../providers/payment_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/theme/colors.dart';

class MidtransPaymentScreen extends StatefulWidget {
  final String snapToken;
  final String orderId;

  const MidtransPaymentScreen({
    super.key,
    required this.snapToken,
    required this.orderId,
  });

  @override
  State<MidtransPaymentScreen> createState() => _MidtransPaymentScreenState();
}

class _MidtransPaymentScreenState extends State<MidtransPaymentScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    
    // Construct the checkout URL (Sandbox vs Production)
    // We default to sandbox for safety and matching Laravel's env setup
    final checkoutUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/${widget.snapToken}';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });

            // Check if the URL indicates finish or redirect to dashboard/callback
            if (url.contains('dashboard') || url.contains('finish') || url.contains('success')) {
              _handlePaymentSuccess();
            }
          },
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.contains('dashboard') || request.url.contains('finish') || request.url.contains('success')) {
              _handlePaymentSuccess();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(checkoutUrl));
  }

  void _handlePaymentSuccess() async {
    // Show success/loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(width: 20),
            Expanded(child: Text('Memverifikasi pembayaran Anda...')),
          ],
        ),
      ),
    );

    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final upgraded = await paymentProvider.upgradeUser(authProvider);

    if (mounted) {
      Navigator.pop(context); // Pop verification dialog
      Navigator.pop(context, upgraded); // Return back with upgraded status to previous screen
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(upgraded 
              ? 'Selamat! Akun Anda telah berhasil di-upgrade ke Premium.' 
              : 'Pembayaran terdeteksi, namun verifikasi gagal. Silakan hubungi admin.'),
          backgroundColor: upgraded ? AppColors.success : AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pembayaran Premium', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: AppColors.textDark),
        actions: [
          // Simulate Payment Button for testing on Localhost without real credit card / API keys
          IconButton(
            icon: const Icon(Icons.check_circle_outline, color: AppColors.success),
            tooltip: 'Simulasi Bayar Sukses',
            onPressed: _handlePaymentSuccess,
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: AppColors.primary,
              ),
            ),
        ],
      ),
    );
  }
}
