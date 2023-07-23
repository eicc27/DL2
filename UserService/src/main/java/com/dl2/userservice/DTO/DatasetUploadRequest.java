package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DatasetUploadRequest {
    private String jwt;
    private String name;
    private String task;
    private String desc;
}
