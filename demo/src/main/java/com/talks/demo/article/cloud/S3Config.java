package com.talks.demo.article.cloud;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${cloud.aws.credentials.accessKey}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secretKey}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public S3Client s3Client() {
        // 從配置文件中讀取 AWS 憑證和區域
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);

        // 配置 S3 客戶端，設置區域和憑證提供者
        return S3Client.builder()
                .region(Region.of(region)) // 使用從配置文件中讀取的區域
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();
    }
}