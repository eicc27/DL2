package com.dl2.neo4jservice.neo4jservice.Repository;

import com.dl2.neo4jservice.neo4jservice.DTO.CitationResult;
import com.dl2.neo4jservice.neo4jservice.Entity.Paper;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.util.Pair;

import java.util.List;
import java.util.Map;

public interface PaperRepository extends Neo4jRepository<Paper, String> {
    @Query("MATCH (p:Paper) WHERE p.paperId = $paperId RETURN p")
    Paper findByPaperId(@Param("paperId") String paperId);

    //    List<Paper> findByCitedPapersPaperId(String paperId);
    @Query("MATCH (p:Paper)-[:CITED]->(n:Paper) WHERE p.paperId IN $paperIds RETURN n")
    List<Paper> findNearbyPapers(@Param("paperIds") List<String> paperIds);


    @Query("MERGE (p:Paper {arxivId: $id}) " +
            "ON CREATE SET p.title = $title, p.abs = $abs, p.citedNum = $citedNum " +
            "ON MATCH SET p.title = $title, p.abs = $abs, p.citedNum = $citedNum " +
            "RETURN p")
    void setPaper(@Param("id") String id, @Param("title") String title, @Param("abs") String abs, @Param("citedNum") Long citedNum);

    @Query("MERGE (p1: Paper {arxivId: $src})" + "MERGE (p2: Paper {arxivId: $dst})" + "MERGE (p1)-[:CITES]->(p2)" + "RETURN p2")
    void setPaperCitation(@Param("src") String src, @Param("dst") String dst);

    @Query("MATCH (p:Paper {arxivId: $id})-[:CITES*0..2]-(relatedPaper:Paper) " + "WHERE relatedPaper.title IS NOT NULL " + "RETURN relatedPaper.arxivId LIMIT 10")
    List<String> getNearbyPapers(@Param("id") String id);

    @Query("""
            MATCH (paper:Paper)-[c:CITES]->(citedPaper:Paper)
            WHERE paper.title IS NOT NULL AND citedPaper.title IS NOT NULL
            WITH DISTINCT paper, citedPaper, COUNT(c) as citedNum
            ORDER BY paper.arxivId DESC, citedNum DESC
            RETURN {
                source: paper.arxivId,
                target: citedPaper.arxivId
            }
            LIMIT 300
            """)
    List<Map<String, String>> getHomepageGraph();

    @Query("""
            MATCH (paper:Paper {arxivId: $id})
            CALL db.create.setNodeVectorProperty(paper, 'propertyKey', :#{literal(#vec)})
            return paper
            """)
    void setPaperEmbedding(@Param("id") String id, String vec);
}
