package com.dl2.userservice.DTO;

import lombok.Data;

@Data
public class UserViewRequest {
    private String jwt;
    private String paperId;
}
