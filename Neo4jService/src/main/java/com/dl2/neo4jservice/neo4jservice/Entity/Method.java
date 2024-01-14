package com.dl2.neo4jservice.neo4jservice.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Data
@AllArgsConstructor
@Node
public class Method {
    @Id
    private String name;
    private String desc;
}
