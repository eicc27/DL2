package com.dl2.userservice.DTO.PaperInsertionRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Method {
    private String id;
    private String method;
    private String desc;
    private String arxivId;
}
