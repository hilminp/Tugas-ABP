import 'package:flutter/material.dart';
import '../services/chatbot_service.dart';

class ChatbotProvider with ChangeNotifier {
  final ChatbotService _chatbotService = ChatbotService();

  List<Map<String, dynamic>> _messages = [];
  List<String> _options = [];
  bool _isLoading = false;

  List<Map<String, dynamic>> get messages => _messages;
  List<String> get options => _options;
  bool get isLoading => _isLoading;

  // Start chat
  Future<void> startChat() async {
    _isLoading = true;
    _messages = [];
    _options = [];
    notifyListeners();

    try {
      final result = await _chatbotService.startChat();
      _messages.add({
        'role': 'assistant',
        'content': result['text'] ?? 'Halo! Aku Sahabat Mental.',
      });
      final List<dynamic> opts = result['options'] ?? [];
      _options = opts.map((o) => o.toString()).toList();
    } catch (_) {
      _messages.add({
        'role': 'assistant',
        'content': 'Gagal terhubung dengan Sahabat Mental. Silakan coba lagi nanti.',
      });
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Send message
  Future<void> sendMessage(String text) async {
    _messages.add({
      'role': 'user',
      'content': text,
    });
    _isLoading = true;
    _options = [];
    notifyListeners();

    try {
      final result = await _chatbotService.sendChat(text);
      _messages.add({
        'role': 'assistant',
        'content': result['text'] ?? '',
      });
      final List<dynamic> opts = result['options'] ?? [];
      _options = opts.map((o) => o.toString()).toList();
    } catch (_) {
      _messages.add({
        'role': 'assistant',
        'content': 'Maaf, terjadi masalah saat memproses pesan Anda.',
      });
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Reset chat
  Future<void> resetChat() async {
    _isLoading = true;
    _messages = [];
    _options = [];
    notifyListeners();

    try {
      final result = await _chatbotService.resetChat();
      _messages.add({
        'role': 'assistant',
        'content': result['text'] ?? 'Halo! Aku Sahabat Mental.',
      });
      final List<dynamic> opts = result['options'] ?? [];
      _options = opts.map((o) => o.toString()).toList();
    } catch (_) {
      _messages.add({
        'role': 'assistant',
        'content': 'Gagal mengatur ulang percakapan.',
      });
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
