package com.dl2.neo4jservice.neo4jservice.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@AllArgsConstructor
@Data
@Node
public class Code {
    @Id
    private String url;
    private long rating;
}