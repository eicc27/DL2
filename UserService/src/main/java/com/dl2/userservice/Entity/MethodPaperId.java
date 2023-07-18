package com.dl2.userservice.Entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class MethodPaperId implements Serializable {
    private String paperId;
    private String methodId;
}
