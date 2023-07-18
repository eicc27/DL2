package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TaskAndMethodResponse {
    private String name;
    private String intro;
}
