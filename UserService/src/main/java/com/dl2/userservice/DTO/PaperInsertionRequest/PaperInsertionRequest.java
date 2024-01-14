package com.dl2.userservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;


@AllArgsConstructor
@Data
public class PaperInsertionRequest {
    private PaperRequest[] papers;
    private Method[] methods;
    private Task[] tasks;
}

