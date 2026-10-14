package com.fizcool.stickerinmotion;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.content.res.Configuration;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyFontScale();
    }
    @Override public void onConfigurationChanged(Configuration config) {
        super.onConfigurationChanged(config);
        applyFontScale();
    }
    private void applyFontScale() {
        if (getBridge() != null) getBridge().getWebView().getSettings().setTextZoom(
            Math.round(getResources().getConfiguration().fontScale * 100));
    }
}
