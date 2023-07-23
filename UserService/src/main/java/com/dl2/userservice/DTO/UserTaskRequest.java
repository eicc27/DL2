package com.dl2.userservice.DTO;

import lombok.Data;

import java.util.List;
@Data
public class UserTaskRequest {
    private String jwt;
    private List<String> taskIds;
}
