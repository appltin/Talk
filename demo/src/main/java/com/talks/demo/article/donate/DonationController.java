package com.talks.demo.article.donate;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/donate")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;
    private final EcpayConfig ecpayConfig;

    @PostMapping("/create")
    public ResponseEntity<String> createDonation(@RequestParam Long articleId, @RequestParam Double amount) {
        String formHtml = donationService.createEcpayOrder(articleId, amount);
        return ResponseEntity.ok(formHtml); // 前端收到直接渲染 HTML 跳付款頁
    }

    @PostMapping("/ecpay-callback")
    public ResponseEntity<String> handleEcpayCallback(HttpServletRequest request) {
        // 先把參數取出成 Map
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, String> params = new HashMap<>();
        parameterMap.forEach((key, values) -> params.put(key, values[0]));

        // 驗證簽章
        boolean isValid = new EcpayUtil().verifyCheckMacValue(params, ecpayConfig.getHashKey(), ecpayConfig.getHashIv());

        if (!isValid) {
            // 驗證失敗
            return ResponseEntity.badRequest().body("0|CheckMacValue Error");
        }

        String merchantTradeNo = params.get("MerchantTradeNo");
        String rtnCode = params.get("RtnCode");

        // ✅ 驗證 rtnCode == 1 表示付款成功
        if ("1".equals(rtnCode)) {
            // 這裡更新資料庫訂單狀態
            // donateMapper.updateStatusByTradeNo(merchantTradeNo, "SUCCESS");
        }

        return ResponseEntity.ok("1|OK");
    }

}
