import 'package:flutter/material.dart';
import '../services/payment_service.dart';
import '../../auth/providers/auth_provider.dart';

class PaymentProvider with ChangeNotifier {
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  // Request Snap Token
  Future<Map<String, dynamic>> getUpgradeToken(double amount) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _paymentService.getSnapToken(amount);
      return result;
    } catch (_) {
      return {'status': 'error', 'message': 'Gagal mengambil token pembayaran.'};
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Verify and upgrade user status
  Future<bool> upgradeUser(AuthProvider authProvider) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _paymentService.verifySuccess();
      if (result['status'] == 'success') {
        // Trigger auto login/refresh profile to update user info
        await authProvider.tryAutoLogin();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
