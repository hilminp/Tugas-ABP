import '../../auth/models/user_model.dart';

class ConsultationSessionModel {
  final int id;
  final int? userId;
  final int psychologistId;
  final String sessionDate;
  final String sessionTime;
  final String status; // 'available', 'pending_approval', 'booked', 'completed'
  final String? startedAt;
  final String? endedAt;
  final UserModel? user;
  final UserModel? psychologist;

  ConsultationSessionModel({
    required this.id,
    this.userId,
    required this.psychologistId,
    required this.sessionDate,
    required this.sessionTime,
    required this.status,
    this.startedAt,
    this.endedAt,
    this.user,
    this.psychologist,
  });

  factory ConsultationSessionModel.fromJson(Map<String, dynamic> json) {
    return ConsultationSessionModel(
      id: json['id'] is int 
          ? json['id'] as int 
          : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      userId: json['user_id'] is int 
          ? json['user_id'] as int 
          : int.tryParse(json['user_id']?.toString() ?? ''),
      psychologistId: json['psychologist_id'] is int 
          ? json['psychologist_id'] as int 
          : int.tryParse(json['psychologist_id']?.toString() ?? '') ?? 0,
      sessionDate: json['session_date'] as String? ?? '',
      sessionTime: json['session_time'] as String? ?? '',
      status: json['status'] as String? ?? 'available',
      startedAt: json['started_at'] as String?,
      endedAt: json['ended_at'] as String?,
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      psychologist: json['psychologist'] != null ? UserModel.fromJson(json['psychologist'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'psychologist_id': psychologistId,
      'session_date': sessionDate,
      'session_time': sessionTime,
      'status': status,
      'started_at': startedAt,
      'ended_at': endedAt,
      'user': user?.toJson(),
      'psychologist': psychologist?.toJson(),
    };
  }

  bool get isStarted => startedAt != null;
  bool get isEnded => endedAt != null;
}
