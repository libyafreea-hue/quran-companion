package com.quran.khatmaapp1;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.core.content.ContextCompat;

public class AdhanReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            if ("com.quran.adhan.PLAY".equals(intent.getAction())) {
                long at = intent.getLongExtra("at", 0);
                // Never replay old prayers after reboot, a clock change or a delayed alarm.
                long delay = System.currentTimeMillis() - at;
                if (delay >= 0 && delay < 5 * 60_000 && AdhanScheduler.contains(context, at)) {
                    ContextCompat.startForegroundService(context,
                            new Intent(context, AdhanPlaybackService.class)
                                    .putExtra("title", intent.getStringExtra("title")));
                }
            }
        } catch (Exception error) { Log.e("AdhanAlarm", "Unable to start Adhan", error); }
        finally {
            // Boot only restores an alarm; it never starts a media service directly.
            try { AdhanScheduler.armNext(context); }
            catch (Exception error) { Log.e("AdhanAlarm", "Unable to restore alarm", error); }
        }
    }
}