package com.quran.khatmaapp1;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

/** Plays the bundled FULL recording to completion, independently of the web view. */
public class AdhanPlaybackService extends Service {
    private static final String CHANNEL = "prayer-adhan-playback-v2";
    private static final String STOP = "com.quran.adhan.STOP";
    private MediaPlayer player;
    private AudioManager audioManager;
    private AudioFocusRequest focus;
    private final AudioManager.OnAudioFocusChangeListener focusListener = change -> {
        if (change < 0) stopSelf();
    };

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || STOP.equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }
        NotificationManager notifications = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "الأذان الكامل", NotificationManager.IMPORTANCE_LOW);
            channel.setSound(null, null);
            notifications.createNotificationChannel(channel);
        }
        PendingIntent stop = PendingIntent.getService(this, 31001,
                new Intent(this, AdhanPlaybackService.class).setAction(STOP),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent open = PendingIntent.getActivity(this, 31002,
                new Intent(this, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification notification = new NotificationCompat.Builder(this, CHANNEL)
                .setSmallIcon(com.quran.khatmaapp1.R.drawable.ic_adhan_notification)
                .setContentTitle(intent.getStringExtra("title"))
                .setContentText("الأذان الكامل")
                .setContentIntent(open).setOngoing(true).setOnlyAlertOnce(true)
                .addAction(android.R.drawable.ic_media_pause, "إيقاف الأذان", stop).build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(31000, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(31000, notification);
        releasePlayer();
        try {
            audioManager = getSystemService(AudioManager.class);
            // Do not override silent mode, DND, volume, calls or another app's audio focus.
            if (audioManager.getRingerMode() != AudioManager.RINGER_MODE_NORMAL ||
                    notifications.getCurrentInterruptionFilter() != NotificationManager.INTERRUPTION_FILTER_ALL) {
                stopSelf(); return START_NOT_STICKY;
            }
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build();
            int focusResult;
            if (Build.VERSION.SDK_INT >= 26) {
                focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                        .setAudioAttributes(attributes).setOnAudioFocusChangeListener(focusListener).build();
                focusResult = audioManager.requestAudioFocus(focus);
            } else {
                focusResult = audioManager.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
            }
            if (focusResult != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                stopSelf(); return START_NOT_STICKY;
            }
            player = MediaPlayer.create(this, R.raw.adhan_full, attributes, 0);
            if (player == null) { stopSelf(); return START_NOT_STICKY; }
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            player.setLooping(false);
            player.setOnCompletionListener(media -> stopSelf());
            player.setOnErrorListener((media, what, extra) -> { stopSelf(); return true; });
            player.start();
        } catch (Exception error) { Log.e("AdhanPlayback", "Unable to play Adhan", error); stopSelf(); }
        return START_NOT_STICKY;
    }

    private void releasePlayer() {
        if (player != null) { player.release(); player = null; }
        if (audioManager != null) {
            if (Build.VERSION.SDK_INT >= 26 && focus != null) {
                audioManager.abandonAudioFocusRequest(focus); focus = null;
            } else if (Build.VERSION.SDK_INT < 26) audioManager.abandonAudioFocus(focusListener);
        }
    }
    @Override public void onDestroy() { releasePlayer(); stopForeground(true); super.onDestroy(); }
}