package com.talks.demo.article.donate;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.stripe.Stripe;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/donate")
public class DonationController {

    @Value("${stripe.secretKey}")
    private String stripeSecretKey;

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestParam Long authorId, @RequestParam Long amount) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        Map<String, Object> params = new HashMap<>();
        params.put("payment_method_types", List.of("card"));
        params.put("line_items", List.of(
                Map.of(
                        "price_data", Map.of(
                                "currency", "twd",
                                "unit_amount", amount.intValue() * 100,
                                "product_data", Map.of("name", "支持作者 #" + authorId)
                        ),
                        "quantity", 1
                )
        ));
        params.put("mode", "payment");
        params.put("success_url", "https://你的前端網址/success");
        params.put("cancel_url", "https://你的前端網址/cancel");
        params.put("metadata", Map.of("authorId", authorId.toString()));

        Session session = Session.create(params);
        Map<String, String> responseData = new HashMap<>();
        responseData.put("id", session.getId());
        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(HttpServletRequest request) throws IOException, IOException {
        String endpointSecret = "whsec_你的_webhook_secret";

        String payload = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String sigHeader = request.getHeader("Stripe-Signature");

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("簽章驗證失敗");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            // ⭐ 呼叫 Service 做業務邏輯
            //donationService.handlePaymentCompleted(session);
        }

        return ResponseEntity.ok("Webhook 已處理");
    }
}
