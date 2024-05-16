package com.dl2.neo4jservice.neo4jservice.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;

public class GenAIService {
    public static float[] embedPaper(String title, String abs) {
        var client = HttpClients.createDefault();
        var post = new HttpPost("http://localhost:27001/embed");
        post.addHeader("Content-Type", "application/json");
        var body = "{\"title\": \"" + title + "\", \"abstract\": \"" + abs + "\"}";
        post.setEntity(new StringEntity(body));
        CloseableHttpResponse resp = null;
        try {
            resp = client.execute(post);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String result = null;
        if (resp.getCode() == 200) {
            try {
                result = EntityUtils.toString(resp.getEntity());
            } catch (IOException | ParseException e) {
                throw new RuntimeException(e);
            }
        }
        if (result == null) {
            try {
                System.out.printf("error %d: %s", resp.getCode(), EntityUtils.toString(resp.getEntity()));
                return null;
            } catch (IOException | ParseException e) {
                throw new RuntimeException(e);
            }
        }
        var mapper = new ObjectMapper();
        try {
            Map<String, Map<String, float[]>> value = mapper.readValue(result, new TypeReference<>() {});
            return value.get("embedding").get("Values");
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
