package com.talks.demo.article.donate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.util.DigestUtils;

public class EcpayUtil {

    public static String generateCheckMacValue(Map<String, String> params, String hashKey, String hashIv, int encryptType) {
        System.out.println("debug hashIv: " + hashIv);

        // Step 1：複製參數並移除不要算進check value的
        Map<String, String> tempMap = new HashMap<>(params);
        tempMap.remove("CheckMacValue");
        // 參數前處理：把 null 轉空字串、trim，避免大小寫/空白坑
        for (Map.Entry<String, String> e : params.entrySet()) {
            if (!"CheckMacValue".equalsIgnoreCase(e.getKey())) {
                tempMap.put(e.getKey(), e.getValue() == null ? "" : e.getValue().trim());
            }
        }

        // Step 2：排序參數（A-Z，不區分大小寫）
        Map<String, String> sortedMap = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        sortedMap.putAll(tempMap);

        // Step 3：組合原始待加密字串（含 HashKey/HashIV）
        StringBuilder sb = new StringBuilder();
        sb.append("HashKey=").append(hashKey).append("&");
        for (Map.Entry<String, String> entry : sortedMap.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            sb.append(key).append("=").append(value).append("&");
        }
        sb.append("HashIV=").append(hashIv);

        String raw = sb.toString();
        System.out.println("🔹Step 2 原始待加密字串：\n" + raw);

        // Step 4：使用 .NET 標準 URL Encode + toLowerCase
        String encoded = netUrlEncode(raw).toLowerCase();
        System.out.println("🔹Step 3 URL encoded (.NET 版)：\n" + encoded);

        // Step 5：進行雜湊加密（SHA256 或 MD5）
        String hash = "";
        if (encryptType == 1) {
            hash = sha256(encoded).toUpperCase();
        } else {
            hash = DigestUtils.md5DigestAsHex(encoded.getBytes(StandardCharsets.UTF_8)).toUpperCase();
        }

        return hash;
    }

    public static String netUrlEncode(String input) {
        try {
            String encoded = URLEncoder.encode(input, StandardCharsets.UTF_8.toString());

            // 模擬 .NET URL Encode（符合綠界要求）
            return encoded
                    .replace("%21", "!")
                    .replace("%2A", "*")
                    .replace("%28", "(")
                    .replace("%29", ")")
                    .replace("%20", "+")   // 空白要變成加號，這是重點
                    .replace("%7E", "~")
                    .replace("%27", "'");
        } catch (Exception e) {
            return input;
        }
    }

    private static String sha256(String str) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(str.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("SHA-256 error", ex);
        }
    }

    public static String genAutoSubmitForm(Map<String, String> params, String actionUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("<form id='ecpayForm' action='").append(actionUrl).append("' method='post'>");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            sb.append("<input type='hidden' name='").append(entry.getKey()).append("' value='").append(entry.getValue()).append("'/>");
        }
        sb.append("</form>");
        sb.append("<script>document.getElementById('ecpayForm').submit();</script>");
        return sb.toString();
    }

    public boolean verifyCheckMacValue(Map<String, String> params, String hashKey, String hashIV) {
        String checkMacValue = params.get("CheckMacValue");
        if (checkMacValue == null || checkMacValue.isEmpty()) return false;
        // 複製 Map 避免改到原資料
        Map<String, String> paramsCopy = new HashMap<>(params);
        paramsCopy.remove("CheckMacValue");

        String generatedCheckMacValue = generateCheckMacValue(paramsCopy, hashKey, hashIV, 1);

        return checkMacValue.equalsIgnoreCase(generatedCheckMacValue); // 忽略大小寫比對
    }
}
