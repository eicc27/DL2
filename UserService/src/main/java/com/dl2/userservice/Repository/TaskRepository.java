package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    Optional<Task> getTaskByName(String taskName);

    Long countAllByName(String taskName);

    @Query(value = """
    SELECT COUNT(*) as num, tp.taskid, t.intro
    from task_paper as tp
    join task t
    on t.name = tp.taskid
    group by taskid
    order by num desc
    limit :size
    offset :offset
    """, nativeQuery = true)
    List<Object[]> sortByNumPapers(int offset, int size);

    @Query(value = """
            WITH task_counts AS (
              SELECT
                t.name AS task_name,
                m.name AS method_name,
                COUNT(*) AS paper_count,
                ROW_NUMBER() OVER(PARTITION BY m.name ORDER BY COUNT(*) DESC) AS rn
              FROM
                task t
              JOIN
                task_paper tp ON t.name = tp.taskid
              JOIN
                method_paper mp ON tp.paperid = mp.paperid
              JOIN
                method m ON mp.methodid = m.name
              WHERE
                m.name = :method_name
              GROUP BY
                t.name,
                m.name
            )       
            SELECT
              task_name,
              method_name,
              paper_count
            FROM
              task_counts
            WHERE
              rn <= 5
            ORDER BY paper_count DESC
            LIMIT 5;
            """, nativeQuery = true)
    List<Object[]> getTopTasksByMethodName(@Param(value = "method_name") String methodName);

    @Query(value= """
                select p.arxiv_id
                from task_paper as tp
                join paper p
                on p.arxiv_id = tp.paperid
                where tp.taskid=:task_name
                order by p.citations desc,
                p.year desc
                limit 5;
            """, nativeQuery = true)
    List<Object[]> getTopPapersByTaskName(@Param(value = "task_name") String taskName);

}
