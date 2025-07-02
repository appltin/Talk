package com.talks.demo.article.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//生成和解析 JWT Token
@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secretKeyString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        System.out.println("Secret Key String from Env: " + secretKeyString);  // 打印原始的 secretKeyString
        // Base64 解碼密鑰並設置
        byte[] keyBytes = Base64.getDecoder().decode(secretKeyString);
        this.secretKey = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
        System.out.println("Secret Key: " + Base64.getEncoder().encodeToString(keyBytes));
    }

    //  產生 token
    public String generateToken(String username) {
        try {
            System.out.println("Attempting to generate token for: " + username);  // 測試輸出
            logger.info("Starting to generate token for user: " + username);

            String token = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))  // 10 小時過期
                    .signWith(secretKey)
                    .compact();

            logger.info("Generated Token: " + token);
            return token;
        } catch (Exception e) {
            logger.error("Error generating token: ", e);
            return null;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {

        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody().getExpiration().before(new Date());
    }
}
