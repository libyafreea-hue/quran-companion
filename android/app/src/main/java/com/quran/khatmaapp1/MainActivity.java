package com.quran.khatmaapp1;

import android.os.Bundle;
import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Edge-to-edge (Android 15+): let the web layout draw behind system bars.
        // The web side handles insets via env(safe-area-inset-*).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        registerPlugin(CompassPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
