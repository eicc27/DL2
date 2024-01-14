package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Paper;
import com.dl2.userservice.Entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaperRepository extends JpaRepository<Paper, String> {
    Optional<Paper> getPaperByArxivId(String arxivId);

    Page<Paper> findByOrderByCitationsAsc(Pageable pageable);

    @Query(value = """
            select * from paper
                order by citations desc, year desc
                limit 10;
            """, nativeQuery = true)
    List<Paper> getMostCitedPapers();

    @Query(value = """
                select * from paper
                    where title like
                        CONCAT('%', :query, '%')
                order by citations desc, year desc
                limit 10;
            """, nativeQuery = true)
    List<Paper> searchByTitle(@Param("query") String query);

    @Query(value = """
                SELECT p.*
                FROM paper p
                JOIN task_paper pt ON pt.paperid = p.arxiv_id
                WHERE pt.taskid IN (
                    SELECT ut.taskid
                    FROM user_task ut
                    WHERE ut.userid = :userId
                )
                ORDER BY p.year DESC
                LIMIT 5;
            """, nativeQuery = true)
    List<Paper> getNewPapersByUserId(@Param("userId") Long userId);


}
