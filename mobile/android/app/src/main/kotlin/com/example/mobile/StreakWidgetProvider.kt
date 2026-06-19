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

                val density = context.resources.displayMetrics.density
                val defaultPaddingPx = (8 * density).toInt()

                // Tampilkan gambar sesuai mood yang dipilih
                if (emoticonText == "😭") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                    setImageViewResource(R.id.widget_emoticon_image, R.drawable.owl_sad_transparent)
                    setViewPadding(R.id.widget_emoticon_image, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx)
                } else if (emoticonText == "🤩") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                    setImageViewResource(R.id.widget_emoticon_image, R.drawable.happy_icon)
                    setViewPadding(R.id.widget_emoticon_image, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx)
                } else if (emoticonText == "😰") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                    setImageViewResource(R.id.widget_emoticon_image, R.drawable.cemas_icon)
                    setViewPadding(R.id.widget_emoticon_image, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx)
                } else if (emoticonText == "😡") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                    setImageViewResource(R.id.widget_emoticon_image, R.drawable.marah_icon)
                    // Set padding to 0 so the angry icon appears larger
                    setViewPadding(R.id.widget_emoticon_image, 0, 0, 0, 0)
                } else if (emoticonText == "😌") {
                    setViewVisibility(R.id.widget_emoticon_image, View.VISIBLE)
                    setViewVisibility(R.id.widget_emoticon, View.GONE)
                    setImageViewResource(R.id.widget_emoticon_image, R.drawable.tenang_icon)
                    setViewPadding(R.id.widget_emoticon_image, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx, defaultPaddingPx)
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
