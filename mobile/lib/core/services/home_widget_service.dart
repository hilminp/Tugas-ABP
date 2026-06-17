import 'package:home_widget/home_widget.dart';

class HomeWidgetService {
  static const String appGroupId = 'com.example.mobile'; 
  static const String androidWidgetName = 'StreakWidgetProvider';

  static Future<void> initialize() async {
    await HomeWidget.setAppGroupId(appGroupId);
  }

  static Future<void> updateStreak(int streakDays, String message, {String emoticon = "😭"}) async {
    // Simpan data
    await HomeWidget.saveWidgetData<String>('emoticon_text', emoticon);
    await HomeWidget.saveWidgetData<String>('streak_text', streakDays.toString());
    await HomeWidget.saveWidgetData<String>('message_text', message);
    
    // Perintahkan widget untuk update
    await HomeWidget.updateWidget(
      name: androidWidgetName,
      androidName: androidWidgetName,
    );
  }
}
