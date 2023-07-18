package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Data
@Entity
@IdClass(TaskPaperId.class)
@Table(name= "task_paper")
public class TaskPaper {
    @Id
    @GeneratedValue()
    private String taskId;

    @Id
    @GeneratedValue()
    private String paperId;
}
