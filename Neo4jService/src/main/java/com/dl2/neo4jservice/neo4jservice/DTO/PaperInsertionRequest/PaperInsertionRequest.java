package com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;


@AllArgsConstructor
@Data
public class PaperInsertionRequest {
    private PaperRequest[] papers;
    private Method[] methods;
    private Task[] tasks;
}

