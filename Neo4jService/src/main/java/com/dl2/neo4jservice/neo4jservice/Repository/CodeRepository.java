package com.dl2.neo4jservice.neo4jservice.Repository;


import com.dl2.neo4jservice.neo4jservice.Entity.Code;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface CodeRepository extends Neo4jRepository<Code, String> {

    @Query("MERGE (c: Code {url: $url}) " +
            "ON CREATE SET c.url=$url, c.rating=$rating " +
            "ON MATCH SET c.url=$url, c.rating=$rating " +
            "RETURN c")
    Code setCode(@Param("url") String url, @Param("rating") Long rating);

    @Query("MERGE (p: Paper {arxivId: $paperId}" +
            "MERGE (c: Code {url: $url}" +
            "MERGE (c)-[:IMPLEMENTS]->(p)" +
            "RETURN c")
    Code setCodePaper(@Param("paperId") String paperId, @Param("url") String url);
}
