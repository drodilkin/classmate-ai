package com.classmate.ai;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                // Hardware layer acceleration for 60/120fps fluid rendering
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

                // Eliminate laggy Android rubber-band overscroll glow
                webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
                webView.setVerticalScrollBarEnabled(false);
                webView.setHorizontalScrollBarEnabled(false);

                // Optimal WebView engine configuration
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setCacheMode(WebSettings.LOAD_DEFAULT);
                settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
                settings.setEnableSmoothTransition(true);
                settings.setLoadsImagesAutomatically(true);
            }
        } catch (Exception ignored) {}
    }
}
