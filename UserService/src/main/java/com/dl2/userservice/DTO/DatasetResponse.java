package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DatasetResponse {
    private String name;
    private String task;
    private String intro;
    private String userName;
    private String uploadTime;
    private List<UploadResponse> userCodes;
}
