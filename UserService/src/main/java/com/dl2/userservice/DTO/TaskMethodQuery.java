package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TaskMethodQuery {
    private String taskName;
    private String methodName;
}
