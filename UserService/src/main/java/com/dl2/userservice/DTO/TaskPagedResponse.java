package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TaskPagedResponse {
    private List<TaskResponse> tasks;
    private long totalElements;
}
