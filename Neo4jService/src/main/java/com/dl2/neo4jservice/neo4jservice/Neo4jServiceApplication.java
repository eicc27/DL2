package com.dl2.neo4jservice.neo4jservice;

import com.dl2.neo4jservice.neo4jservice.Service.GenAIService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;
import java.util.Map;

@SpringBootApplication
public class Neo4jServiceApplication {
	public static void main(String[] args) {
        SpringApplication.run(Neo4jServiceApplication.class, args);
	}
}
