package com.quran.khatmaapp1;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSArray;

@CapacitorPlugin(name = "AdhanAlarm")
public class AdhanAlarmPlugin extends Plugin {
    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            JSArray alarms = call.getArray("alarms", new JSArray());
            AdhanScheduler.replace(getContext(), alarms);
            call.resolve();
        } catch (Exception error) { call.reject(error.getMessage(), error); }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), AdhanPlaybackService.class));
        call.resolve();
    }
}