package com.dl2.userservice.Entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserTaskId {
    private String taskId;
    private String userId;
}
