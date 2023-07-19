package com.dl2.neo4jservice.neo4jservice.DTO;

import lombok.Data;

import java.util.List;

@Data
public class PaperRequest {
    private List<String> arxivId;
}
