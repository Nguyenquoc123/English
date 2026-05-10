package com.learning.english.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.english.dto.request.SePayWebhookRequest;
import com.learning.english.dto.response.SePayWebhookResponse;
import com.learning.english.service.SePayWebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@RestController
@RequestMapping("/webhooks/sepay")
public class SePayWebhookController {

    @Autowired
    private SePayWebhookService sePayWebhookService;

//    @Autowired
//    private ObjectMapper objectMapper;

    @Value("${sepay.webhook.secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<SePayWebhookResponse> nhanWebhookSePay(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "X-SePay-Signature", required = false) String signature,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestampHeader
    ) {
        try {
            if (rawBody == null || rawBody.length == 0) {
                return badRequest("Empty body");
            }

            if (signature == null || signature.isBlank()) {
                return unauthorized("Missing signature");
            }

            if (timestampHeader == null || timestampHeader.isBlank()) {
                return unauthorized("Missing timestamp");
            }

            long timestamp;

            try {
                timestamp = Long.parseLong(timestampHeader.trim());
            } catch (Exception e) {
                return unauthorized("Invalid timestamp");
            }

            /*
                Nếu SePay gửi timestamp dạng milliseconds, ví dụ 1778349013000,
                thì chuyển về seconds.
                Còn nếu đã là seconds, ví dụ 1778349013, thì giữ nguyên.
            */
            long timestampSeconds = timestamp;

            if (timestampSeconds > 1000000000000L) {
                timestampSeconds = timestampSeconds / 1000;
            }

            long nowSeconds = Instant.now().getEpochSecond();
            long diffSeconds = Math.abs(nowSeconds - timestampSeconds);

            System.out.println("===== SEPAY TIMESTAMP DEBUG =====");
            System.out.println("timestampHeader = " + timestampHeader);
            System.out.println("timestampSeconds = " + timestampSeconds);
            System.out.println("nowSeconds = " + nowSeconds);
            System.out.println("diffSeconds = " + diffSeconds);

            /*
                Cho phép lệch 15 phút để test qua SePay + ngrok.
                Sau khi chạy ổn production có thể giảm về 300.
            */
            long allowedDiffSeconds = 900;

            if (diffSeconds > allowedDiffSeconds) {
                return unauthorized("Request expired");
            }

            /*
                Quan trọng:
                verifySignature phải dùng timestampHeader gốc,
                không dùng timestampSeconds đã xử lý.
            */
            boolean validSignature = verifySignature(
                    rawBody,
                    timestampHeader,
                    signature,
                    webhookSecret
            );

            if (!validSignature) {
                return unauthorized("Invalid signature");
            }

            ObjectMapper objectMapper = new ObjectMapper();

            SePayWebhookRequest request = objectMapper.readValue(
                    rawBody,
                    SePayWebhookRequest.class
            );

            if (request.getId() == null) {
                return badRequest("Invalid payload");
            }

            System.out.println("===== SEPAY WEBHOOK RECEIVED =====");
            System.out.println("id = " + request.getId());
            System.out.println("gateway = " + request.getGateway());
            System.out.println("accountNumber = " + request.getAccountNumber());
            System.out.println("code = " + request.getCode());
            System.out.println("content = " + request.getContent());
            System.out.println("transferType = " + request.getTransferType());
            System.out.println("transferAmount = " + request.getTransferAmount());
            System.out.println("referenceCode = " + request.getReferenceCode());

            sePayWebhookService.xuLyThanhToanSePay(request);

            return ResponseEntity.ok(
                    SePayWebhookResponse.builder()
                            .success(true)
                            .message("OK")
                            .build()
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            SePayWebhookResponse.builder()
                                    .success(false)
                                    .message("Internal error")
                                    .build()
                    );
        }
    }

    private boolean verifySignature(
            byte[] rawBody,
            String timestamp,
            String signature,
            String secret
    ) throws Exception {
        String expected = "sha256=" + hmacSha256Hex(timestamp, rawBody, secret);

        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String hmacSha256Hex(
            String timestamp,
            byte[] rawBody,
            String secret
    ) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");

        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );

        mac.init(secretKeySpec);

        /*
            Phải ký đúng dạng giống PHP:
            timestamp + "." + rawBody
        */
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        outputStream.write(timestamp.getBytes(StandardCharsets.UTF_8));
        outputStream.write(".".getBytes(StandardCharsets.UTF_8));
        outputStream.write(rawBody);

        byte[] digest = mac.doFinal(outputStream.toByteArray());

        return HexFormat.of().formatHex(digest);
    }

    private ResponseEntity<SePayWebhookResponse> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(
                        SePayWebhookResponse.builder()
                                .success(false)
                                .message(message)
                                .build()
                );
    }

    private ResponseEntity<SePayWebhookResponse> unauthorized(String message) {
    	System.out.println("SePay webhook unauthorized: " + message);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                        SePayWebhookResponse.builder()
                                .success(false)
                                .message(message)
                                .build()
                );
    }
}