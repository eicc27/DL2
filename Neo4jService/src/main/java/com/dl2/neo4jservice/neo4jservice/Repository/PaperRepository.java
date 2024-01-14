package com.dl2.neo4jservice.neo4jservice.Repository;

import com.dl2.neo4jservice.neo4jservice.Entity.Paper;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaperRepository extends Neo4jRepository<Paper, String> {
    @Query("MATCH (p:Paper) WHERE p.paperId = $paperId RETURN p")
    Paper findByPaperId(@Param("paperId") String paperId);

    //    List<Paper> findByCitedPapersPaperId(String paperId);
    @Query("MATCH (p:Paper)-[:CITED]->(n:Paper) WHERE p.paperId IN $paperIds RETURN n")
    List<Paper> findNearbyPapers(@Param("paperIds") List<String> paperIds);


    @Query("MERGE (p:Paper {arxivId: $id, title: $title, abs: $abs, citedNum: $citedNum}) RETURN p")
    Paper setPaper(@Param("id") String id, @Param("title") String title, @Param("abs") String abs, @Param("citedNum") Long citedNum);

    @Query("MERGE (p1: paper {arxivId: $src})" +
            "MERGE (p2: paper {arxivId: $dst})" +
            "MERGE (p1)-[:CITES]->(p2)" +
            "RETURN p2")
    Paper setPaperCitation(@Param("src") String src, @Param("dst") String dst);
}
