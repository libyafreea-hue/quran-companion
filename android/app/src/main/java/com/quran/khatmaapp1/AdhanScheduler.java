package com.quran.khatmaapp1;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/** Persist the rolling plan and arm only its next future prayer. */
final class AdhanScheduler {
    private static PendingIntent pending(Context context, JSONObject alarm) {
        Intent intent = new Intent(context, AdhanReceiver.class).setAction("com.quran.adhan.PLAY");
        if (alarm != null) {
            intent.putExtra("at", alarm.optLong("at"));
            intent.putExtra("title", alarm.optString("title", "الأذان"));
        }
        return PendingIntent.getBroadcast(context, 31000, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static synchronized void replace(Context context, JSONArray alarms) throws Exception {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        manager.cancel(pending(context, null));
        context.getSharedPreferences("adhan_alarms", Context.MODE_PRIVATE).edit()
                .putString("plan", "[]").commit();
        if (alarms.length() > 0 && Build.VERSION.SDK_INT >= 31 && !manager.canScheduleExactAlarms()) {
            throw new IllegalStateException("يرجى السماح بالتنبيهات الدقيقة لتشغيل الأذان كاملاً في موعده.");
        }
        if (!context.getSharedPreferences("adhan_alarms", Context.MODE_PRIVATE).edit()
                .putString("plan", alarms.toString()).commit()) {
            throw new IllegalStateException("تعذر حفظ جدول الأذان.");
        }
        armNext(context);
        if (alarms.length() == 0) context.stopService(new Intent(context, AdhanPlaybackService.class));
    }

    static synchronized void armNext(Context context) throws Exception {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        manager.cancel(pending(context, null));
        if (Build.VERSION.SDK_INT >= 31 && !manager.canScheduleExactAlarms()) return;
        JSONArray plan = new JSONArray(context.getSharedPreferences("adhan_alarms", Context.MODE_PRIVATE)
                .getString("plan", "[]"));
        JSONObject next = null;
        for (int i = 0; i < plan.length(); i++) {
            JSONObject item = plan.getJSONObject(i);
            long at = item.optLong("at");
            if (at > System.currentTimeMillis() && (next == null || at < next.optLong("at"))) next = item;
        }
        if (next != null) manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,
                next.optLong("at"), pending(context, next));
    }

    static synchronized boolean contains(Context context, long at) throws Exception {
        JSONArray plan = new JSONArray(context.getSharedPreferences("adhan_alarms", Context.MODE_PRIVATE)
                .getString("plan", "[]"));
        for (int i = 0; i < plan.length(); i++) if (plan.getJSONObject(i).optLong("at") == at) return true;
        return false;
    }
}