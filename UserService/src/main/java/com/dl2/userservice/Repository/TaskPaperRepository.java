package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.TaskPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskPaperRepository extends JpaRepository<TaskPaper, String> {
    List<TaskPaper> getTaskPapersByPaperId(String paperId);

    Optional<TaskPaper> getTaskPaperByTaskId(String taskId);

    @Query(value = """
                    select taskid, count(*) as numPapers 
                    from task_paper 
                    group by taskid 
                    having numPapers > 20 
                    order by numPapers desc
                   """, nativeQuery = true)
    List<Object[]> getMostPopularTasksByNumOfPapers();

}