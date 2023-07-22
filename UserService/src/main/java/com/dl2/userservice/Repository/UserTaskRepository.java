package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Task;
import com.dl2.userservice.Entity.UserTask;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserTaskRepository extends JpaRepository<UserTask, Long> {
    @Transactional
    @Modifying
    @Query(value = """
            insert into user_task (userid, taskid)
            values (:userId, :taskId);
            """, nativeQuery = true)
    void addLikedTaskByUserIdAndTaskId(@Param("userId")Long userId, @Param("taskId")String taskId);

    @Transactional
    @Modifying
    @Query(value = """
            delete from user_task
            where userid = :userId
            """, nativeQuery = true)
    void deleteAllLikedTaskByUserId(@Param("userId")Long userId);

    @Query(value = """
            select * from user_task
            where userid = :userId
            """, nativeQuery = true)
    List<UserTask> getUserTaskByUserId(@Param("userId")Long userId);
}
