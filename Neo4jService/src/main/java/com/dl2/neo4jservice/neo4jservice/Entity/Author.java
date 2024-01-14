package com.dl2.neo4jservice.neo4jservice.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;

@AllArgsConstructor
@Data
public class Author {
    @Id
    private String name;
}
