package com.dl2.neo4jservice.neo4jservice.Repository;

import com.dl2.neo4jservice.neo4jservice.Entity.Method;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface MethodRepository extends Neo4jRepository<Method, String> {
    @Query("MERGE (m: Method {name: $id}) " +
            "ON CREATE SET m.name=$id, m.desc=$desc " +
            "ON MATCH SET m.name=$id, m.desc=$desc " +
            "RETURN m")
    Method setMethod(@Param("id") String id, @Param("desc") String desc);

    @Query("MERGE (p: Paper {arxivId: $paperId})" +
            "MERGE (m: Method {name: $methodId})" +
            "MERGE (p)-[:APPLIES]->(m)" +
            "RETURN m")
    Method setMethodPaper(@Param("paperId") String paperId, @Param("methodId") String methodId);

    @Query("MERGE (p: Paper {arxivId: $paperId})" +
            "MERGE (m: Method {name: $methodId})" +
            "MERGE (p)-[:PROPOSES]->(m)" +
            "RETURN m")
    Method setPaperMethod(@Param("methodId") String methodId, @Param("paperId") String paperId);
}
