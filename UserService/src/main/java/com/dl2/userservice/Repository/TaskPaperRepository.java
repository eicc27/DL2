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
                    select taskid, num
                    from task_paper,
                    (
                    	select taskid, count(*) as num
                        from task_paper
                        group by taskid
                        order by num desc
                    ) as Order_task(id, num)
                    where paperid = :paperId and id = taskid
                    limit 5;
                   """, nativeQuery = true)
    List<Object[]> getMostPopularTasksByNumOfPapers(@Param("paperId") String paperId);

}