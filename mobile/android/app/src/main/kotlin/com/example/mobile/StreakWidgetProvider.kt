package com.example.mobile

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.SharedPreferences
import android.view.View
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetProvider

class StreakWidgetProvider : HomeWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
        widgetData: SharedPreferences
    ) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout).apply {
                // Mendapatkan data dari Flutter
                val emoticonText = widgetData.getString("emoticon_text", "😭")
                val streakText = widgetData.getString("streak_text", "0")
                val messageText = widgetData.getString("message_text", "Sedih banget...")

                // Jika mood nya Sedih (😭), tampilkan gambar burung hantu sedih
                if (emoticonText == "😭") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                } else {
                    setViewVisibility(R.id.widget_emoticon_image, View.GONE)
                    setViewVisibility(R.id.widget_emoticon, View.VISIBLE)
                    setTextViewText(R.id.widget_emoticon, emoticonText)
                }

                setTextViewText(R.id.widget_title, streakText)
                setTextViewText(R.id.widget_message, messageText)
            }
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
