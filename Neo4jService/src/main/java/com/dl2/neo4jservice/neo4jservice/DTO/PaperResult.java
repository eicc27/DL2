package com.dl2.neo4jservice.neo4jservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaperResult {
    private String arxivId;
    private String title;
    private String field;
}
