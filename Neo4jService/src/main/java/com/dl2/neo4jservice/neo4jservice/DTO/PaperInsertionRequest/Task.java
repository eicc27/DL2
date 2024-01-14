package com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Task {
    private String id;
    private String name;
    private String desc;
}
