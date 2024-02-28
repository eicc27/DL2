package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.TaskPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskPaperRepository extends JpaRepository<TaskPaper, String> {
    List<TaskPaper> getTaskPapersByPaperId(String paperId);

    Optional<TaskPaper> getTaskPaperByTaskId(String taskId);

    @Query(value = """
            SELECT taskid, total_papers
            FROM (
                SELECT taskid, COUNT(*) AS total_papers
                FROM task_paper
                GROUP BY taskid
            ) AS total_counts
            WHERE taskid IN (
                SELECT taskid
                FROM task_paper
                WHERE paperid = :paperId
            )
            ORDER BY total_papers DESC
            LIMIT 5;
                   """, nativeQuery = true)
    List<Object[]> getMostPopularTasksByNumOfPapers(@Param("paperId") String paperId);

    @Query(value = """
                 select tp.taskid as name, t.intro as intro, count(*) as paperNum
                 from task_paper tp
                     join task t
                     on tp.taskid = t.name
                         where intro is not null
                         group by name
                         order by paperNum desc
                         limit 10;
            """, nativeQuery = true)
    List<Object[]> getMostPopularTasks();

    @Query(value = """
                select * from task_paper
                where userid = :userId and rating = 1
                limit 5;
            """, nativeQuery = true)
    List<TaskPaper> getRecentViewedTasksByUserId(@Param("userId") Long userId);
}