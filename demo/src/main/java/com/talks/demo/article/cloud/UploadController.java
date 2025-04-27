package com.talks.demo.article.cloud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.net.URI;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/cloud")
public class UploadController {

    @Autowired
    private S3Client s3Client;

    // S3 存儲桶名稱
    @Value("${aws.s3.bucket}")
    String bucketName;

    @PostMapping("/uploadImg")
    public ResponseEntity<String> uploadFile(@RequestParam("image") MultipartFile file) {
        try {
            //String bucketName = "elasticbeanstalk-ap-northeast-3-460820365574";

            // 使用 UUID 生成唯一的文件名，避免文件名衝突
            String originalFilename = Paths.get(file.getOriginalFilename()).getFileName().toString();
            String cleanedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_"); // 清理文件名中的特殊字符
            String key = UUID.randomUUID() + "-" + cleanedFilename;
            // 確定文件的 Content-Type
            String contentType = file.getContentType(); // 從上傳的文件獲取 MIME 類型

            // 創建 S3 上傳請求
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)  // 設定要上傳的存儲桶
                    .key(key)            // 設定文件在存儲桶中的 key
                    .contentType(contentType) // 設定文件的 Content-Type
                    .build();

            // 將文件上傳到 S3
            s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));

            // 構建圖片的 URL，返回給前端
            String imageUrl = String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
            System.out.println(imageUrl);
            return ResponseEntity.ok(imageUrl);  // 返回圖片的 URL
        } catch (Exception e) {
            // 如果上傳過程中出現錯誤，返回 500 狀態碼並帶上錯誤信息
            return ResponseEntity.status(500).body("圖片上傳失敗：" + e.getMessage());
        }
    }

    @DeleteMapping("/deleteImg")
    public ResponseEntity<?> deleteImage(@RequestParam String imageUrl) {
        try {
            // 從 imageUrl 解析出 bucket 名稱和 key（即檔案的路徑）
            String bucketName = "elasticbeanstalk-ap-northeast-3-460820365574"; // S3 bucket 名稱
            String key = imageUrl.substring(imageUrl.lastIndexOf("/") + 1); // 獲取檔案名稱作為 key

            // 創建刪除請求
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName) // 指定 bucket
                    .key(key) // 指定 key
                    .build();

            // 執行刪除操作
            s3Client.deleteObject(deleteObjectRequest);

            // 返回成功回應
            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            // 捕捉異常並返回內部伺服器錯誤回應
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete image");
        }
    }

}
