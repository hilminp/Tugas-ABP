import '../../../core/network/api_client.dart';

class PaymentService {
  final ApiClient _client = ApiClient();

  // Get Midtrans snap token
  Future<Map<String, dynamic>> getSnapToken(double amount) async {
    try {
      final response = await _client.post('/payment/token', data: {
        'amount': amount,
      });
      return response.data; // { status: 'success', snap_token: '...', order_id: '...' }
    } catch (e) {
      rethrow;
    }
  }

  // Verify success payment and update account to Premium
  Future<Map<String, dynamic>> verifySuccess() async {
    try {
      final response = await _client.post('/payment/success');
      return response.data; // { status: 'success', message: '...', user: {...} }
    } catch (e) {
      rethrow;
    }
  }
}
