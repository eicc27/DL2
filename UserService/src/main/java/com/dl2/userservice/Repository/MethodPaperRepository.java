package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.MethodPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MethodPaperRepository extends JpaRepository<MethodPaper, String> {
    List<MethodPaper> getMethodPapersByPaperId(String paperId);

    Optional<MethodPaper> getMethodPaperByMethodId(String methodId);

    @Query(value = """
            SELECT methodid, total_papers
            FROM (
                SELECT methodid, COUNT(*) AS total_papers
                FROM method_paper
                GROUP BY methodid
            ) AS total_counts
            WHERE methodid IN (
                SELECT methodid
                FROM method_paper
                WHERE paperid = :paperId
            )
            ORDER BY total_papers DESC
            LIMIT 5;
                   """, nativeQuery = true)
    List<Object[]> getMostPopularMethodsByNumOfPapers(@Param("paperId") String paperId);

    @Query(value = """
            select mp.methodid as name, m.intro as intro, count(*) as paperNum
            from method_paper mp
            join method m
            on m.name=mp.methodid
                group by name
                order by paperNum desc
                limit 10;
            """, nativeQuery = true)
    List<Object[]> getMostPopularMethods();
}
