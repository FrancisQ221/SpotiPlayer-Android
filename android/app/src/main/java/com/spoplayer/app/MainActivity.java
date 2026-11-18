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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        // Allow media to autoplay without gesture (required for background audio)
        settings.setMediaPlaybackRequiresUserGesture(false);
        // Allow mixed HTTP/HTTPS content (YouTube CDN sometimes uses both)
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        // Storage
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        // Increase cache (reduces rebuffering stutters)
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        getBridge().setWebViewClient(new SpoPlayerWebViewClient(getBridge()));
    }

    private static class SpoPlayerWebViewClient extends BridgeWebViewClient {

        // Dedicated thread pool for intercepted API requests (keeps UI thread free)
        private static final ExecutorService executor = Executors.newCachedThreadPool();

        public SpoPlayerWebViewClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String urlStr = request.getUrl().toString();
            String host = request.getUrl().getHost();

            // Only intercept YouTube API calls (NOT googlevideo.com streams).
            // googlevideo.com is the actual audio CDN — Android WebView can stream
            // it natively via <audio src="..."> without any interception. Intercepting
            // it via HttpURLConnection would buffer the entire response before playing,
            // causing stutters and high memory use. Let it pass through directly.
            boolean isYouTubeApi = host != null
                    && host.contains("youtube.com")
                    && !host.contains("googlevideo.com");

            if (!isYouTubeApi) {
                return super.shouldInterceptRequest(view, request);
            }

            // Handle CORS preflight — return immediately
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
                headers.put("Access-Control-Allow-Headers", "*");
                headers.put("Access-Control-Max-Age", "86400");
                return new WebResourceResponse("text/plain", "UTF-8", 200, "OK", headers, null);
            }

            // GET / POST / HEAD — forward with proper Origin and Referer headers
            if ("GET".equalsIgnoreCase(request.getMethod())
                    || "POST".equalsIgnoreCase(request.getMethod())
                    || "HEAD".equalsIgnoreCase(request.getMethod())) {
                try {
                    URL url = new URL(urlStr);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod(request.getMethod());
                    conn.setConnectTimeout(10000);
                    conn.setReadTimeout(20000);
                    conn.setInstanceFollowRedirects(true);
                    conn.setDoInput(true);
                    if ("POST".equalsIgnoreCase(request.getMethod())) {
                        conn.setDoOutput(true);
                    }

                    // Forward original headers, except Origin/Referer which we set ourselves
                    for (Map.Entry<String, String> entry : request.getRequestHeaders().entrySet()) {
                        String k = entry.getKey();
                        if (!"Origin".equalsIgnoreCase(k) && !"Referer".equalsIgnoreCase(k)) {
                            try {
                                conn.setRequestProperty(k, entry.getValue());
                            } catch (Exception ignored) {}
                        }
                    }

                    // Spoof Origin / Referer so YouTube doesn't block the request
                    String origin = urlStr.contains("music.youtube.com")
                            ? "https://music.youtube.com"
                            : "https://www.youtube.com";
                    conn.setRequestProperty("Origin", origin);
                    conn.setRequestProperty("Referer", origin + "/");
                    conn.setRequestProperty("X-Origin", origin);

                    int responseCode = conn.getResponseCode();
                    String contentType = conn.getContentType();
                    if (contentType == null) contentType = "application/json";
                    String mimeType = contentType.split(";")[0].trim();
                    String encoding = conn.getContentEncoding();
                    if (encoding == null) encoding = "UTF-8";

                    Map<String, String> responseHeaders = new HashMap<>();
                    for (Map.Entry<String, List<String>> header : conn.getHeaderFields().entrySet()) {
                        if (header.getKey() != null && !header.getValue().isEmpty()) {
                            responseHeaders.put(header.getKey(), header.getValue().get(0));
                        }
                    }
                    // Always add CORS headers so the web app can read the response
                    responseHeaders.put("Access-Control-Allow-Origin", "*");
                    responseHeaders.put("Access-Control-Allow-Headers", "*");
                    responseHeaders.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");

                    InputStream is = (responseCode >= 200 && responseCode < 400)
                            ? conn.getInputStream()
                            : conn.getErrorStream();
                    String message = conn.getResponseMessage();
                    if (message == null || message.isEmpty()) message = "OK";

                    return new WebResourceResponse(mimeType, encoding, responseCode, message, responseHeaders, is);
                } catch (Exception e) {
                    // Network error — fall through to default WebView handling
                }
            }

            return super.shouldInterceptRequest(view, request);
        }
    }
}
