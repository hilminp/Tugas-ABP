import 'package:flutter/material.dart';
import '../../auth/models/user_model.dart';
import '../models/consultation_session_model.dart';
import '../services/consultation_service.dart';

class ConsultationProvider with ChangeNotifier {
  final ConsultationService _consultationService = ConsultationService();

  List<UserModel> _psychologists = [];
  Map<String, String> _friendStatuses = {};
  List<ConsultationSessionModel> _myBookedSessions = [];
  List<ConsultationSessionModel> _psychoSessions = [];
  List<ConsultationSessionModel> _availableSessions = [];
  List<dynamic> _incomingRequests = [];
  List<dynamic> _reviews = [];
  double _averageRating = 0.0;
  int _totalReviews = 0;
  int _sessionNotificationsCount = 0;
  int _friendNotificationsCount = 0;

  bool _isLoading = false;
  String? _errorMessage;

  List<UserModel> get psychologists => _psychologists;
  Map<String, String> get friendStatuses => _friendStatuses;
  List<ConsultationSessionModel> get myBookedSessions => _myBookedSessions;
  List<ConsultationSessionModel> get psychoSessions => _psychoSessions;
  List<ConsultationSessionModel> get availableSessions => _availableSessions;
  List<dynamic> get incomingRequests => _incomingRequests;
  List<dynamic> get reviews => _reviews;
  double get averageRating => _averageRating;
  int get totalReviews => _totalReviews;
  int get sessionNotificationsCount => _sessionNotificationsCount;
  int get friendNotificationsCount => _friendNotificationsCount;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Set loading
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // Load psychologists
  Future<void> fetchPsychologists({String? category, bool refresh = true}) async {
    _isLoading = true;
    _errorMessage = null;
    if (refresh) {
      _psychologists = [];
    }
    notifyListeners();

    try {
      final result = await _consultationService.getPsychologists(
        category: category,
        offset: refresh ? 0 : _psychologists.length,
      );
      final List<UserModel> list = result['data'];
      if (refresh) {
        _psychologists = list;
      } else {
        _psychologists.addAll(list);
      }
    } catch (e) {
      _errorMessage = 'Gagal memuat psikolog.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch friend statuses
  Future<void> fetchFriendStatuses() async {
    try {
      _friendStatuses = await _consultationService.getFriendStatuses();
      notifyListeners();
    } catch (_) {}
  }

  // Request pertemanan/konsultasi
  Future<Map<String, dynamic>> connectPsychologist(int id, {String? category}) async {
    _setLoading(true);
    final result = await _consultationService.connectPsychologist(id, category: category);
    _setLoading(false);
    
    if (result['message'] != null) {
      // Re-fetch statuses to update UI
      await fetchFriendStatuses();
    }
    return result;
  }

  // Get incoming requests (for psychologists)
  Future<void> fetchIncomingRequests() async {
    _isLoading = true;
    notifyListeners();
    try {
      _incomingRequests = await _consultationService.getIncomingFriendRequests();
    } catch (e) {
      _errorMessage = 'Gagal memuat permintaan pertemanan.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Accept request
  Future<Map<String, dynamic>> acceptRequest(int requesterId) async {
    _setLoading(true);
    final result = await _consultationService.acceptFriendRequest(requesterId);
    _setLoading(false);
    if (result['message'] != null) {
      // Remove from local list
      _incomingRequests.removeWhere((req) => req['user_id'] == requesterId);
      notifyListeners();
    }
    return result;
  }

  // Reject request
  Future<Map<String, dynamic>> rejectRequest(int requesterId) async {
    _setLoading(true);
    final result = await _consultationService.rejectFriendRequest(requesterId);
    _setLoading(false);
    if (result['message'] != null) {
      // Remove from local list
      _incomingRequests.removeWhere((req) => req['user_id'] == requesterId);
      notifyListeners();
    }
    return result;
  }

  // Fetch my booked sessions (User)
  Future<void> fetchMyBookedSessions() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _myBookedSessions = await _consultationService.getMyBookedSessions();
    } catch (e) {
      _errorMessage = 'Gagal memuat jadwal sesi.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch available sessions for psychologist
  Future<void> fetchAvailableSessions(int psychologistId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _availableSessions = await _consultationService.getAvailableSessions(psychologistId);
    } catch (e) {
      _availableSessions = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch psychologist sessions (own schedule)
  Future<void> fetchPsychologistSessions() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _psychoSessions = await _consultationService.getPsychologistSessions();
    } catch (e) {
      _errorMessage = 'Gagal memuat jadwal sesi.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Book session
  Future<Map<String, dynamic>> bookSession(int sessionId) async {
    _setLoading(true);
    final result = await _consultationService.bookSession(sessionId);
    _setLoading(false);
    return result;
  }

  // Create session schedule (Psychologist)
  Future<Map<String, dynamic>> createSessionSchedule(String date, String time) async {
    _setLoading(true);
    final result = await _consultationService.createSession(date, time);
    _setLoading(false);
    if (result['success']) {
      await fetchPsychologistSessions();
    }
    return result;
  }

  // Approve session request (Psychologist)
  Future<Map<String, dynamic>> approveSession(int sessionId) async {
    _setLoading(true);
    final result = await _consultationService.approveSession(sessionId);
    _setLoading(false);
    if (result['success']) {
      await fetchPsychologistSessions();
    }
    return result;
  }

  // Start session (Psychologist)
  Future<Map<String, dynamic>> startSession(int sessionId) async {
    _setLoading(true);
    final result = await _consultationService.startSession(sessionId);
    _setLoading(false);
    if (result['success']) {
      await fetchPsychologistSessions();
    }
    return result;
  }

  // End session (Psychologist)
  Future<Map<String, dynamic>> endSession(int sessionId) async {
    _setLoading(true);
    final result = await _consultationService.endSession(sessionId);
    _setLoading(false);
    if (result['success']) {
      await fetchPsychologistSessions();
    }
    return result;
  }

  // Cancel/Delete session
  Future<Map<String, dynamic>> cancelSession(int sessionId) async {
    _setLoading(true);
    final result = await _consultationService.cancelSession(sessionId);
    _setLoading(false);
    if (result['success']) {
      _myBookedSessions.removeWhere((s) => s.id == sessionId);
      _psychoSessions.removeWhere((s) => s.id == sessionId);
      notifyListeners();
    }
    return result;
  }

  // Submit Review (Client)
  Future<Map<String, dynamic>> submitReview(int psychologistId, int rating, String comment) async {
    _setLoading(true);
    final result = await _consultationService.submitReview(psychologistId, rating, comment);
    _setLoading(false);
    return result;
  }

  // Fetch Reviews (Psychologist)
  Future<void> fetchPsychologistReviews() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _consultationService.fetchReviews();
    if (result['success']) {
      _reviews = result['reviews'];
      _averageRating = double.tryParse(result['average_rating'].toString()) ?? 0.0;
      _totalReviews = int.tryParse(result['total_reviews'].toString()) ?? 0;
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch Notification Counts (Both)
  Future<void> fetchNotificationCounts() async {
    try {
      _sessionNotificationsCount = await _consultationService.getSessionNotificationCount();
      _friendNotificationsCount = await _consultationService.getFriendNotificationCount();
      notifyListeners();
    } catch (_) {}
  }

  // Mark Session Notifications Seen
  Future<void> markSessionNotificationsAsSeen() async {
    try {
      await _consultationService.markSessionNotificationsSeen();
      _sessionNotificationsCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  // Mark Friend Requests Seen
  Future<void> markFriendNotificationsAsSeen() async {
    try {
      await _consultationService.markFriendNotificationsSeen();
      _friendNotificationsCount = 0;
      notifyListeners();
    } catch (_) {}
  }
}
