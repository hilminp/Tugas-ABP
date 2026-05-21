import '../../../core/network/api_client.dart';

class ChatbotService {
  final ApiClient _client = ApiClient();

  // Start chatbot session
  Future<Map<String, dynamic>> startChat() async {
    try {
      final response = await _client.get('/chat/start');
      return response.data; // { text: String, options: List }
    } catch (e) {
      rethrow;
    }
  }

  // Send message to chatbot
  Future<Map<String, dynamic>> sendChat(String message) async {
    try {
      final response = await _client.post('/chat/next', data: {
        'message': message,
      });
      return response.data; // { text: String, options: List }
    } catch (e) {
      rethrow;
    }
  }

  // Reset chat
  Future<Map<String, dynamic>> resetChat() async {
    try {
      final response = await _client.post('/chat/reset');
      return response.data; // { text: String, options: List }
    } catch (e) {
      rethrow;
    }
  }
}
