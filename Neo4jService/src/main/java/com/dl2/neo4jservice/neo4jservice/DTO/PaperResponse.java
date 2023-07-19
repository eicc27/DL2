package com.dl2.neo4jservice.neo4jservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaperResponse {
    private String[] arxivId;
    private Long[] citations;
}
