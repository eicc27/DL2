package com.dl2.neo4jservice.neo4jservice.Entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

@Node
public class Paper {
    @Id private String id;

    private String paperId;
    private Long citedNum;

    private Paper() {};

    private Paper(String paperId, Long citedNum) {
        this.paperId = paperId;
        this.citedNum = citedNum;
    }

    @Relationship(type = "CITED")
    public Set<Paper> citedPapers;

    public void citedBy(Paper paper) {
        if (citedPapers == null) {
            citedPapers = new HashSet<>();
        }
        citedPapers.add(paper);
    }

    public void setPaperId(String paperId) {
        this.paperId = paperId;
    }

    public String getPaperId() {
        return paperId;
    }

    public void setCitedNum(Long citedNum) {
        this.citedNum = citedNum;
    }

    public Long getCitedNum() {
        return citedNum;
    }
}
