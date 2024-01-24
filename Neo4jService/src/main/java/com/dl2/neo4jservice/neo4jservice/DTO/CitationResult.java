package com.dl2.neo4jservice.neo4jservice.DTO;

import com.dl2.neo4jservice.neo4jservice.Entity.Paper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CitationResult {
    private PaperResult source;
    private PaperResult target;
}
