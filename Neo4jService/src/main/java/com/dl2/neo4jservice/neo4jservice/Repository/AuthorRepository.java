package com.dl2.neo4jservice.neo4jservice.Repository;

import com.dl2.neo4jservice.neo4jservice.Entity.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface AuthorRepository extends Neo4jRepository<Author, String> {
    @Query("MERGE (a: Author {name: $name}) RETURN a")
    Author setAuthor(@Param("name") String name);

    @Query("MERGE (p: Paper {arxivId: $id})" +
            "MERGE (a: Author {name: $name})" +
            "MERGE (a)-[:WRITES]->(p)" +
            "RETURN a")
    Author setAuthorPaper(@Param("name") String name, @Param("id") String id);
}
