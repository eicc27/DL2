package com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class PaperRequest {
    private SourceCode[] codes;
    private String[] methods;
    private String[] authors;
    private String name;
    private String id;
    private String abs;
    private Long references;
    private Long citations;
    private String[] referencedPapers;
    private String[] tasks;
}
