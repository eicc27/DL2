package com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Method {
    private String id;
    private String method;
    private String desc;
    private String arxivId;
}
