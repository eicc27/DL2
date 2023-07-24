package com.dl2.userservice.Security;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Data
public class S3Config {
    ProfileCredentialsProvider provider;
    S3Client client;
    String bucketName;
    S3Presigner s3Presigner;

    public S3Config(String bucketName) {
        this.bucketName = bucketName;
        provider = ProfileCredentialsProvider.builder()
                .profileName("default")
                .build();
        client = S3Client.builder()
                .region(software.amazon.awssdk.regions.Region.US_EAST_1)
                .credentialsProvider(provider)
                .build();
        setCorsInfo();
        s3Presigner = S3Presigner.builder()
                .region(software.amazon.awssdk.regions.Region.US_EAST_1)
                .credentialsProvider(provider)
                .build();
    }

    public void setCorsInfo() {
        List<String> allowedMethods = new ArrayList<>();
        allowedMethods.add("PUT");
        allowedMethods.add("POST");
        allowedMethods.add("GET");
        allowedMethods.add("DELETE");
        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.add("*");
        List<String> allowedHeaders = new ArrayList<>();
        allowedHeaders.add("*");
        try {
            CORSRule rule = CORSRule.builder()
                    .allowedMethods(allowedMethods)
                    .allowedOrigins(allowedOrigins)
                    .allowedHeaders(allowedHeaders)
                    .build();
            List<CORSRule> rules = new ArrayList<>();
            rules.add(rule);
            client.putBucketCors(builder -> builder
                    .bucket(bucketName)
                    .corsConfiguration(builder1 -> builder1.corsRules(rules)));
        } catch (S3Exception e) {
            System.out.println(e.awsErrorDetails().errorMessage());
        }
    }

    public void putObject(MultipartFile file, String rootPath) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(rootPath + file.getOriginalFilename())
                    .build();
            String filePath = "tmp/" + file.getOriginalFilename();
            File targetFile = new File(filePath);
            if (!targetFile.exists()) {
                targetFile.mkdirs();
            }
            file.transferTo(targetFile);
            client.putObject(request, RequestBody.fromFile(targetFile));
            targetFile.delete();
        } catch (S3Exception | IOException e) {
            System.out.println(e.getMessage());
        }
    }

    public String getObject(String path) {
        try {
            ListObjectsResponse res = client.listObjects(builder -> builder.bucket(bucketName).prefix(path));
            GetObjectRequest getObjectRequest =
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(path)
                            .build();
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))
                    .getObjectRequest(getObjectRequest)
                    .build();
            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (S3Exception e) {
            System.out.println(e.awsErrorDetails().errorMessage());
            return null;
        }
    }

    public void getObject(String src, String dst) {
        try {
            GetObjectRequest getObjectRequest =
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(src)
                            .build();
            ResponseBytes<GetObjectResponse> objectBytes = client.getObjectAsBytes(getObjectRequest);
            byte[] data = objectBytes.asByteArray();
            // Write the data to a local file.
            File myFile = new File(dst);
            OutputStream os = new FileOutputStream(myFile);
            os.write(data);
            os.close();
        } catch (S3Exception | IOException e) {
            System.out.println(e.getMessage());
        }
    }


    public List<String> listObjects(String path) {
        try {
            List<String> objects = new ArrayList<>();
            ListObjectsResponse res = client.listObjects(builder -> builder.bucket(bucketName).prefix(path));
            for (S3Object s3Object : res.contents()) {
                objects.add(s3Object.key());
            }
            return objects;
        } catch (S3Exception e) {
            System.out.println(e.awsErrorDetails().errorMessage());
            return null;
        }
    }

}
