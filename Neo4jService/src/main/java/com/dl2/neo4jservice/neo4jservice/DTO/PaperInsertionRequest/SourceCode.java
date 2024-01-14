package com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class SourceCode {
    private String url;
    private Long rating;
}
