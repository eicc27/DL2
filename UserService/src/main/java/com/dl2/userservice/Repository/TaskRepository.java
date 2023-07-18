package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    Optional<Task> getTaskByName(String taskName);
}
