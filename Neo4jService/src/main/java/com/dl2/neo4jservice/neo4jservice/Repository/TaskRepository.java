package com.dl2.neo4jservice.neo4jservice.Repository;

import com.dl2.neo4jservice.neo4jservice.Entity.Task;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends Neo4jRepository<Task, String> {
    @Query("MERGE (t: Task {name: $id}) " +
            "ON CREATE SET t.name=$id, t.desc=$desc " +
            "ON MATCH SET t.name=$id, t.desc=$desc " +
            "RETURN t")
    Task setTask(@Param("id") String id, @Param("desc") String desc);

    @Query("MERGE (p: Paper {arxivId: $paperId}) " +
            "MERGE (t: Task {name: $task}) " +
            "MERGE (p)-[:PERFORMS]->(t) " +
            "RETURN t")
    Task setTaskPaper(@Param("paperId") String paperId, @Param("task") String task);
}
