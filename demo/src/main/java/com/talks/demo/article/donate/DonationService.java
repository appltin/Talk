package com.talks.demo.article.donate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final EcpayConfig ecpayConfig;

    public String createEcpayOrder(Long articleId, Double amount) {
        String merchantTradeNo = genMerchantTradeNo();
        String tradeDesc = "donate";
        String itemName = "donate website";
        String returnUrl = "https://talks-production.up.railway.app/donate/ecpay-callback";
        String clientBackUrl = "https://talks-rust-tau.vercel.app/donate/success";

        Map<String, String> params = new HashMap<>();
        params.put("MerchantID", ecpayConfig.getMerchantId());
        params.put("MerchantTradeNo", merchantTradeNo);
        params.put("MerchantTradeDate", "2023/03/12 15:30:23");
        params.put("PaymentType", "aio");
        params.put("TotalAmount", String.valueOf(amount.intValue()));
        params.put("TradeDesc", tradeDesc);
        params.put("ItemName", itemName);
        params.put("ReturnURL", returnUrl);
        params.put("ChoosePayment", "ALL");
//        params.put("ClientBackURL", clientBackUrl);
        params.put("EncryptType", "1");

        Map<String, String> macParams = new HashMap<>(params);

        // 產生 CheckMacValue（原文）
        String checkMacValue = EcpayUtil.generateCheckMacValue(macParams, "pwFHCqoQZGmho4w6", "EkRm7iFT261dpevs", 1);
        params.put("CheckMacValue", checkMacValue);


        // 生成自動送出表單 HTML
        return EcpayUtil.genAutoSubmitForm(params, ecpayConfig.getBaseUrl());
    }

    // 產生不重複的訂單編號（英數、<=20）
    private static String genMerchantTradeNo() {
        String ts = String.valueOf(System.currentTimeMillis()); // 毫秒時間戳
        String rnd = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 3).toUpperCase(); // 3碼隨機
        String no = "EC" + ts + rnd; // 前綴避免純數字
        return no.length() > 20 ? no.substring(0, 20) : no; // 維持在20字內
    }
}
