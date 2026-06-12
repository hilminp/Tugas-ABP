import '../../../core/network/api_client.dart';
import '../../auth/models/user_model.dart';
import '../models/consultation_session_model.dart';
import '../models/notification_model.dart';
import 'package:dio/dio.dart';

class ConsultationService {
  final ApiClient _client = ApiClient();

  // 1. Get Psychologists
  Future<Map<String, dynamic>> getPsychologists({String? category, int limit = 6, int offset = 0}) async {
    try {
      final queryParams = <String, dynamic>{'limit': limit, 'offset': offset};
      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      final response = await _client.get('/psychologists', queryParameters: queryParams);
      
      final List<dynamic> listData = response.data['data'] ?? [];
      final list = listData.map((x) => UserModel.fromJson(x as Map<String, dynamic>)).toList();
      
      return {
        'data': list,
        'has_more': response.data['has_more'] ?? false,
        'total': response.data['total'] ?? 0,
      };
    } catch (e) {
      rethrow;
    }
  }

  // 2. Get friendship statuses
  Future<Map<String, String>> getFriendStatuses() async {
    try {
      final response = await _client.get('/friend-statuses/psychologists');
      final Map<String, dynamic> statuses = response.data['statuses'] ?? {};
      return statuses.map((key, value) => MapEntry(key, value.toString()));
    } catch (e) {
      return {};
    }
  }

  // 3. Connect (friend request)
  Future<Map<String, dynamic>> connectPsychologist(int id, {String? category}) async {
    try {
      final data = category != null ? {'category': category} : null;
      final response = await _client.post('/friend/$id', data: data);
      return response.data;
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal menghubungi psikolog.',
      };
    } catch (e) {
      return {'success': false, 'message': 'Gagal memproses permohonan.'};
    }
  }

  // 4. Get incoming friend requests
  Future<List<dynamic>> getIncomingFriendRequests() async {
    try {
      final response = await _client.get('/friend-requests');
      return response.data['requests'] ?? [];
    } catch (e) {
      rethrow;
    }
  }

  // 5. Accept request
  Future<Map<String, dynamic>> acceptFriendRequest(int requesterId) async {
    try {
      final response = await _client.post('/friend/$requesterId/accept');
      return response.data;
    } on DioException catch (e) {
      return {'success': false, 'message': e.response?.data['message'] ?? 'Gagal menerima pertemanan.'};
    }
  }

  // 6. Reject request
  Future<Map<String, dynamic>> rejectFriendRequest(int requesterId) async {
    try {
      final response = await _client.post('/friend/$requesterId/reject');
      return response.data;
    } on DioException catch (e) {
      return {'success': false, 'message': e.response?.data['message'] ?? 'Gagal menolak pertemanan.'};
    }
  }

  // 7. Get my booked sessions (User)
  Future<List<ConsultationSessionModel>> getMyBookedSessions() async {
    try {
      final response = await _client.get('/my-booked-sessions');
      final List<dynamic> list = response.data['sessions'] ?? [];
      return list.map((json) => ConsultationSessionModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // 8. Get available sessions of psychologist (User)
  Future<List<ConsultationSessionModel>> getAvailableSessions(int psychologistId) async {
    try {
      final response = await _client.get('/consultation-sessions/psychologist/$psychologistId');
      final List<dynamic> list = response.data['sessions'] ?? [];
      return list.map((json) => ConsultationSessionModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // 9. Get psychologist sessions (Psychologist)
  Future<List<ConsultationSessionModel>> getPsychologistSessions() async {
    try {
      final response = await _client.get('/consultation-sessions');
      final List<dynamic> list = response.data['sessions'] ?? [];
      return list.map((json) => ConsultationSessionModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // 10. Book a session (User)
  Future<Map<String, dynamic>> bookSession(int sessionId) async {
    try {
      final response = await _client.post('/consultation-sessions/$sessionId/book');
      return {'success': true, 'message': response.data['message'], 'session': response.data['session']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal memesan sesi.',
      };
    }
  }

  // 11. Approve a session request (Psychologist)
  Future<Map<String, dynamic>> approveSession(int sessionId) async {
    try {
      final response = await _client.post('/consultation-sessions/$sessionId/approve');
      return {'success': true, 'message': response.data['message'], 'session': response.data['session']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal mengonfirmasi sesi.',
      };
    }
  }

  // 12. Start session (Psychologist)
  Future<Map<String, dynamic>> startSession(int sessionId) async {
    try {
      final response = await _client.post('/consultation-sessions/$sessionId/start');
      return {'success': true, 'message': response.data['message'], 'session': response.data['session']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal memulai sesi.',
      };
    }
  }

  // 13. End session (Psychologist)
  Future<Map<String, dynamic>> endSession(int sessionId) async {
    try {
      final response = await _client.post('/consultation-sessions/$sessionId/end');
      return {'success': true, 'message': response.data['message'], 'session': response.data['session']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal mengakhiri sesi.',
      };
    }
  }

  // 14. Create session (Psychologist)
  Future<Map<String, dynamic>> createSession(String sessionDate, String sessionTime) async {
    try {
      final response = await _client.post('/consultation-sessions', data: {
        'session_date': sessionDate,
        'session_time': sessionTime,
      });
      return {'success': true, 'message': response.data['message'], 'session': response.data['session']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal membuat jadwal sesi.',
      };
    }
  }

  // 15. Cancel / Delete session (Both)
  Future<Map<String, dynamic>> cancelSession(int sessionId) async {
    try {
      final response = await _client.delete('/consultation-sessions/$sessionId');
      return {'success': true, 'message': response.data['message']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal membatalkan sesi.',
      };
    }
  }

  // 16. Submit psychologist review
  Future<Map<String, dynamic>> submitReview(int psychologistId, int rating, String comment) async {
    try {
      final response = await _client.post(
        '/psychologists/$psychologistId/reviews',
        data: {
          'rating': rating,
          'comment': comment,
          'is_anonymous': true,
        },
      );
      return {'success': true, 'message': response.data['message']};
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal mengirim ulasan.',
      };
    }
  }

  // 17. Fetch psychologist reviews (for logged in psychologist)
  Future<Map<String, dynamic>> fetchReviews() async {
    try {
      final response = await _client.get('/reviews');
      return {
        'success': true,
        'reviews': response.data['reviews'] ?? [],
        'average_rating': response.data['average_rating'] ?? 0.0,
        'total_reviews': response.data['total_reviews'] ?? 0,
      };
    } catch (e) {
      return {
        'success': false,
        'reviews': [],
        'average_rating': 0.0,
        'total_reviews': 0,
      };
    }
  }

  // 18. Session Notifications Count
  Future<int> getSessionNotificationCount() async {
    try {
      final response = await _client.get('/session-notifications');
      return response.data['count'] ?? 0;
    } catch (_) {
      return 0;
    }
  }

  // 19. Mark Session Notifications Seen
  Future<void> markSessionNotificationsSeen() async {
    try {
      await _client.post('/sessions/mark-seen');
    } catch (_) {}
  }

  // 20. Friend Notifications Count
  Future<int> getFriendNotificationCount() async {
    try {
      final response = await _client.get('/friend-notifications');
      return response.data['count'] ?? 0;
    } catch (_) {
      return 0;
    }
  }

  // 21. Mark Friend Notifications Seen
  Future<void> markFriendNotificationsSeen() async {
    try {
      await _client.post('/friend-requests/mark-seen');
    } catch (_) {}
  }

  // 22. Get All Notifications
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await _client.get('/notifications');
      final List<dynamic> list = response.data['notifications'] ?? [];
      return list.map((json) => NotificationModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // 23. Mark All Notifications Seen
  Future<void> markAllNotificationsSeen() async {
    try {
      await _client.post('/notifications/mark-seen');
    } catch (_) {}
  }
}
