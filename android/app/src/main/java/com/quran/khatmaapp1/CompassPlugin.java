package com.quran.khatmaapp1;

import android.content.Context;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Compass")
public class CompassPlugin extends Plugin implements SensorEventListener {
    private SensorManager manager;
    private float declination;
    private int accuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;

    @PluginMethod
    public void start(PluginCall call) {
        Double latitude = call.getDouble("latitude");
        Double longitude = call.getDouble("longitude");
        if (latitude == null || longitude == null || !Double.isFinite(latitude) || !Double.isFinite(longitude)
                || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            call.reject("الموقع غير صالح.");
            return;
        }
        manager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        Sensor sensor = manager == null ? null : manager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (sensor == null) {
            call.reject("لا يحتوي هذا الجهاز على بوصلة متوافقة. استخدم زاوية القبلة من الشمال الحقيقي.");
            return;
        }
        manager.unregisterListener(this);
        accuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;
        declination = new GeomagneticField(latitude.floatValue(), longitude.floatValue(), 0, System.currentTimeMillis()).getDeclination();
        if (!manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_UI)) {
            call.reject("تعذر تشغيل بوصلة الجهاز.");
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopSensors();
        call.resolve();
    }

    private void stopSensors() {
        if (manager != null) manager.unregisterListener(this);
    }

    @Override
    protected void handleOnPause() { stopSensors(); }

    @Override
    protected void handleOnDestroy() { stopSensors(); }

    @Override
    public void onAccuracyChanged(Sensor sensor, int value) { accuracy = value; }

    @Override
    public void onSensorChanged(SensorEvent event) {
        float[] matrix = new float[9];
        float[] adjusted = new float[9];
        float[] orientation = new float[3];
        SensorManager.getRotationMatrixFromVector(matrix, event.values);
        int rotation = getActivity().getWindowManager().getDefaultDisplay().getRotation();
        int x = SensorManager.AXIS_X;
        int y = SensorManager.AXIS_Y;
        if (rotation == Surface.ROTATION_90) { x = SensorManager.AXIS_Y; y = SensorManager.AXIS_MINUS_X; }
        else if (rotation == Surface.ROTATION_180) { x = SensorManager.AXIS_MINUS_X; y = SensorManager.AXIS_MINUS_Y; }
        else if (rotation == Surface.ROTATION_270) { x = SensorManager.AXIS_MINUS_Y; y = SensorManager.AXIS_X; }
        SensorManager.remapCoordinateSystem(matrix, x, y, adjusted);
        SensorManager.getOrientation(adjusted, orientation);
        double heading = (Math.toDegrees(orientation[0]) + declination + 360) % 360;
        JSObject data = new JSObject();
        data.put("heading", heading);
        data.put("accuracy", accuracy);
        notifyListeners("heading", data);
    }
}