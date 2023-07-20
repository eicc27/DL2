package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SingleTaskResponse {
    private String name;
    private String intro;
    private List<String> methods;
    private List<Long> methodNumPapers;
    private List<PaperResponse> papers;
}
