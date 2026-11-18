package com.spoplayer.app;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        getBridge().setWebViewClient(new SpoPlayerWebViewClient(getBridge()));
    }

    private static class SpoPlayerWebViewClient extends BridgeWebViewClient {
        public SpoPlayerWebViewClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String urlStr = request.getUrl().toString();
            String host = request.getUrl().getHost();

            if (host != null && (host.contains("youtube.com") || host.contains("googlevideo.com"))) {
                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
                    headers.put("Access-Control-Allow-Headers", "*");
                    headers.put("Access-Control-Max-Age", "86400");
                    return new WebResourceResponse("text/plain", "UTF-8", 200, "OK", headers, null);
                }

                if ("GET".equalsIgnoreCase(request.getMethod()) || "HEAD".equalsIgnoreCase(request.getMethod())) {
                    try {
                        URL url = new URL(urlStr);
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod(request.getMethod());
                        conn.setConnectTimeout(15000);
                        conn.setReadTimeout(30000);
                        conn.setInstanceFollowRedirects(true);

                        for (Map.Entry<String, String> entry : request.getRequestHeaders().entrySet()) {
                            String k = entry.getKey();
                            if (!"Origin".equalsIgnoreCase(k) && !"Referer".equalsIgnoreCase(k)) {
                                conn.setRequestProperty(k, entry.getValue());
                            }
                        }

                        String origin = urlStr.contains("www.youtube.com") ? "https://www.youtube.com" : "https://music.youtube.com";
                        conn.setRequestProperty("Origin", origin);
                        conn.setRequestProperty("Referer", origin + "/");

                        int responseCode = conn.getResponseCode();
                        String contentType = conn.getContentType();
                        if (contentType == null) {
                            contentType = host.contains("googlevideo.com") ? "audio/webm" : "application/json";
                        }
                        String mimeType = contentType.split(";")[0].trim();
                        String encoding = conn.getContentEncoding();
                        if (encoding == null) encoding = "UTF-8";

                        Map<String, String> responseHeaders = new HashMap<>();
                        for (Map.Entry<String, List<String>> header : conn.getHeaderFields().entrySet()) {
                            if (header.getKey() != null && !header.getValue().isEmpty()) {
                                responseHeaders.put(header.getKey(), header.getValue().get(0));
                            }
                        }
                        responseHeaders.put("Access-Control-Allow-Origin", "*");
                        responseHeaders.put("Access-Control-Allow-Headers", "*");
                        responseHeaders.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");

                        InputStream is = (responseCode >= 200 && responseCode < 400) ? conn.getInputStream() : conn.getErrorStream();
                        String message = conn.getResponseMessage();
                        if (message == null || message.isEmpty()) message = "OK";

                        return new WebResourceResponse(mimeType, encoding, responseCode, message, responseHeaders, is);
                    } catch (Exception e) {
                        // fallback
                    }
                }
            }

            return super.shouldInterceptRequest(view, request);
        }
    }
}
